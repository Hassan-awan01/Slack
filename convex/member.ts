import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

const populateUsers = async (ctx: QueryCtx, id: Id<"users">) => {
  return await ctx.db.get(id);
};

export const get = query({
  args: {
    workspaceId: v.id("workSpaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) return [];

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const members = [];
    for (const member of data) {
      const user = await populateUsers(ctx, member.userId);
      if (user) {
        members.push({
          ...member,
          user,
        });
      }
    }
    return members;
  },
});

export const current = query({
  args: { workspaceId: v.id("workSpaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) return [];

    return member;
  },
});

export const getById = query({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const member = await ctx.db.get(args.memberId);
    if (!member) return null;

    const user = await populateUsers(ctx, member.userId);

    if (!user) return null;

    return {
      ...member,
      user,
    };
  },
});

export const update = mutation({
  args: {
    memberId: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) throw new Error("Un authorized");
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member Not Found");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", member?.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!currentMember || currentMember.role !== "admin")
      throw new Error("UnAuthorized");

    await ctx.db.patch(args.memberId, {
      role: args.role,
    });

    return args.memberId;
  },
});

export const remove = mutation({
  args: {
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) throw new Error("Un authorized");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member Not Found");

    if (member.role === "admin") throw new Error("Admin can't remove himself");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", member?.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!currentMember) throw new Error("UnAuthorized");

    if (currentMember._id === args.memberId && currentMember.role === "admin")
      throw new Error("Admin can't remove himself");

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.memberId))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.memberId))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) => q.eq(q.field("memberOneId"), args.memberId))
        .filter((q) => q.eq(q.field("memberTwoId"), args.memberId))
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }
    await ctx.db.delete(args.memberId);

    return args.memberId;
  },
});
