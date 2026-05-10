import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  resumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    filename: v.optional(v.string()),
    r2Key: v.optional(v.string()),
    rawText: v.optional(v.string()),
    data: v.optional(v.string()), // JSON string of ResumeData
    analysis: v.optional(v.string()),
  })
    .index("by_userId", ["userId"]),
});
