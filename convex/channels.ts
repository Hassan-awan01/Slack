import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
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
    if (!member || member.role !== "admin") throw new Error("Un Authorized");

    args.name = args.name.replace(/\s+/g, "-").toLowerCase();

    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      workspaceId: args.workspaceId,
    });

    return channelId;
  },
});

export const update = mutation({
  args: {
    channelId: v.id("channels"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UnAuhorized");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel Not found");
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", channel?.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Member not Found");

    await ctx.db.patch(args.channelId, {
      name: args.name,
    });

    return args.channelId;
  },
});

export const remove = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("UnAuhorized");

    const channel = await ctx.db.get(args.channelId);
    if (!channel) throw new Error("Channel Not found");
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", channel?.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member || member.role !== "admin") throw new Error("Member not Found");

    // todo remove associated messages
    await ctx.db.delete(args.channelId);

    return args.channelId;
  },
});

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

    const channels = ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    return channels;
  },
});

export const getById = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId == null) return [];
    const channel = await ctx.db.get(args.channelId);
    if (!channel) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();
    if (!member) return null;
    return channel;
  },
});
