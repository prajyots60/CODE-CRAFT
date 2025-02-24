import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to create a snippet");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const snippetId = await ctx.db.insert("snippets", {
      ...args,
      userId: identity.subject,
      userName: user.name,
      // title : args.title,
      // language : args.language,
      // code : args.code,
    });

    return snippetId;
  },
});

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to delete a snippet");
    }

    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) {
      throw new Error("Snippet not found");
    }

    if (snippet.userId !== identity.subject) {
      throw new Error("You can only delete your own snippets");
    }

    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    await ctx.db.delete(args.snippetId);
  },
});

export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to star a snippet");
    }

    const existingStar = await ctx.db
      .query("stars")
      .withIndex("by_user_and_snippet_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), identity.subject) &&
          q.eq(q.field("snippetId"), args.snippetId)
      )
      .first();

    if (existingStar) {
      await ctx.db.delete(existingStar._id);
    } else {
      await ctx.db.insert("stars", {
        userId: identity.subject,
        snippetId: args.snippetId,
      });
    }
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    const snippets = await ctx.db.query("snippets").order("desc").collect();

    return snippets;
  },
});

export const getSnippetById = query({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) {
      throw new Error("Snippet not found");
    }
    return snippet;
  },
});

export const addComment = mutation({
  args: {
    snippetId: v.id("snippets"),
    content: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to comment on a snippet");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const comment = await ctx.db.insert("snippetComments", {
      snippetId: args.snippetId,
      userId: identity.subject,
      userName: user.name,
      content: args.content,
    });

    return comment;
  },
});

export const deleteComment = mutation({
  args: {
    commentId: v.id("snippetComments"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to delete a comment");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== identity.subject) {
      throw new Error("You can only delete your own comments");
    }

    await ctx.db.delete(args.commentId);
  },
});

export const getComments = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .order("desc")
      .collect();
    return comments;
  },
});

export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be logged in to create a snippet");
    }

    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_and_snippet_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), identity.subject) &&
          q.eq(q.field("snippetId"), args.snippetId)
      )
      .first();

    return !!star; //!! converts to boolean
  },
});

export const getSnippetStarCount = query({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    return stars.length;
  },
});


export const getStarredSnippets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const stars = await ctx.db
      .query("stars")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const snippets = await Promise.all(stars.map((star) => ctx.db.get(star.snippetId)));

    return snippets.filter((snippet) => snippet !== null);
  },
});
