import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createSnippet = mutation({
  args : {
    title : v.string(),
    language : v.string(),
    code : v.string(),
  },

  handler : async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
      throw new Error("You must be logged in to create a snippet");
    }

    const user = await ctx.db
                 .query("users")
                 .withIndex("by_user_id")
                 .filter((q) => q.eq(q.field("userId"), identity.subject))
                 .first()

    if(!user){
      throw new Error("User not found");
    }

    const snippetId = await ctx.db.insert("snippets", {
      ...args,
      userId : user._id,
      userName : user.name,
      // title : args.title,
      // language : args.language,
      // code : args.code,
    })

    return snippetId;
  }
})