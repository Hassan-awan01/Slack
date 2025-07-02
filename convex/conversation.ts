import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
  args: {
    memberId: v.id("members"),
    workspaceId: v.id("workSpaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Un Authorized");
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();
    const otherMember = await ctx.db.get(args.memberId);
    if (!member || !otherMember) {
      throw new Error("Can't Initiate the Conversation");
    }

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), member._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), member._id)
          )
        )
      )

      .unique();

    if (existingConversation) return existingConversation._id;

    const conversationId = await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      memberOneId: member._id,
      memberTwoId: otherMember._id,
    });

    if (!conversationId) throw new Error("Failed to Create Conversation");
    return conversationId;
  },
});
