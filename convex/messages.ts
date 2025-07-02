import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

const populateThreads = async (
  ctx: QueryCtx,
  parentMessageId: Id<"messages">
) => {
  const threads = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", parentMessageId)
    )
    .collect();

  if (!threads || threads.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
    };
  }

  const lastMessage = threads[threads.length - 1];
  const lastMessageMem = await populateMember(ctx, lastMessage.memberId);
  if (!lastMessageMem) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
    };
  }
  // console.log(lastMessage);
  const lastMessageUser = await populateUser(ctx, lastMessageMem.userId);

  const value = {
    count: threads.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
  };

  // console.log(value);

  return {
    count: value.count,
    image: value.image,
    timestamp: value.timestamp,
    name: lastMessageUser?.name,
  };
};

const populateReactions = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
  return reactions;
};

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

export const update = mutation({
  args: {
    messageId: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not Found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId)
      throw new Error("Unauthorized");

    await ctx.db.patch(args.messageId, {
      body: args.body,
      updateAt: Date.now(),
    });
    return args.messageId;
  },
});
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) throw new Error("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not Found");

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId)
      throw new Error("Unauthorized");

    await ctx.db.delete(args.messageId);
    return args.messageId;
  },
});

export const getById = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) {
      return null;
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    const member = await populateMember(ctx, message.memberId);
    if (!member) return null;

    const currentMember = await getMember(
      ctx,
      message.workspaceId,
      member.userId
    );
    if (!currentMember) return null;

    const user = await populateUser(ctx, member.userId);

    if (!user) return null;

    const reactions = await populateReactions(ctx, message._id);

    const reactionsWihCount = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });
    const dedupedReactions = reactionsWihCount.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({
            ...reaction,
            memberIds: [reaction.memberId],
          });
        }
        return acc;
      },
      [] as ({
        count: number;
        memberIds: Id<"members">[];
      } & Doc<"reactions">)[]
    );
    const reactionsWithoutMemberIdProperties = dedupedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      member,
      user,
      reactions: reactionsWithoutMemberIdProperties,
    };
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) {
      return {
        page: [],
      };
    }

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage)
        return {
          page: [],
        };
      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_id_conversional_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!user || !member) return null;

            const reactions = await populateReactions(ctx, message._id);
            const threads = await populateThreads(ctx, message._id);
            // console.log(threads);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWihCount = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length,
              };
            });

            const dedupedReactions = reactionsWihCount.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({
                    ...reaction,
                    memberIds: [reaction.memberId],
                  });
                }
                return acc;
              },
              [] as ({
                count: number;
                memberIds: Id<"members">[];
              } & Doc<"reactions">)[]
            );
            const reactionsWithoutMemberIdProperties = dedupedReactions.map(
              ({ memberId, ...rest }) => rest
            );
            // const value = {
            //   ...message,
            //   image,
            //   member,
            //   user,
            //   reactions: reactionsWithoutMemberIdProperties,
            //   threadCount: threads.count,
            //   threadImage: threads.image,
            //   threadTimestamp: threads.timestamp,
            // };

            // console.log(value);

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperties,
              threadCount: threads.count,
              threadImage: threads.image,
              threadTimestamp: threads.timestamp,
              threadName: threads.name,
            };
          })
        )
      ).filter(
        (message): message is NonNullable<typeof message> => message != null
      ),
    };
  },
});

const getMember = async (
  ctx: QueryCtx,
  workspaceId: Id<"workSpaces">,
  userId: Id<"users">
) => {
  const member = await ctx.db
    .query("members")
    .withIndex("by_workspace_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();

  return member;
};

export const create = mutation({
  args: {
    workspaceId: v.id("workSpaces"),
    body: v.string(),
    channelId: v.optional(v.id("channels")),
    image: v.optional(v.id("_storage")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) throw new Error("Unauthorized");
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error("Unauthorized");

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new Error("Parent Message Not Found");
      _conversationId = parentMessage.conversationId;
    }

    const messageId = ctx.db.insert("messages", {
      memberId: member._id,
      image: args.image,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      body: args.body,
      parentMessageId: args.parentMessageId,
      conversationId: _conversationId,
    });
    return messageId;
  },
});
