import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { internal } from "./_generated/api";

export const upload = mutation({
  args: {
    title: v.string(),
    filename: v.string(),
    rawText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const resumeId = await ctx.db.insert("resumes", {
      userId,
      title: args.title,
      filename: args.filename,
      rawText: args.rawText,
    });

    // Schedule embedding generation
    await ctx.scheduler.runAfter(0, internal.embeddings.updateResumeEmbedding, {
      resumeId,
      text: args.rawText,
    });

    return resumeId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("resumes") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const resume = await ctx.db.get(args.id);
    if (!resume || resume.userId !== userId) {
      throw new Error("Resume not found or unauthorized");
    }

    return resume;
  },
});

export const save = mutation({
  args: {
    data: v.string(), // JSON string
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if there's an existing resume with this title for this user
    const existing = await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("resumes", {
        userId,
        title: args.title,
        data: args.data,
      });
    }
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("resumes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
  },
});
