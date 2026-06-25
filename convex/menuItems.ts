import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { getOrgContext, requireOrgAdmin } from "./organizations";

// Resolve a menu item document into the shape the UI consumes (image URL inlined).
async function withImageUrl(ctx: QueryCtx, item: Doc<"menuItems">) {
  return {
    ...item,
    imageUrl: item.imageStorageId
      ? await ctx.storage.getUrl(item.imageStorageId)
      : null,
  };
}

async function listForOrg(ctx: QueryCtx, orgId: string) {
  const items = await ctx.db
    .query("menuItems")
    .withIndex("byOrg", (q) => q.eq("orgId", orgId))
    .collect();
  return Promise.all(items.map((item) => withImageUrl(ctx, item)));
}

// Menu items for the active organization (dashboard).
export const list = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await getOrgContext(ctx);
    return await listForOrg(ctx, orgId);
  },
});

// Menu items for a public organization page, looked up by slug.
export const listPublic = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();
    if (!org) return [];
    return await listForOrg(ctx, org.clerkOrgId);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireOrgAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    mealTypeId: v.id("mealTypes"),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("menuItems"),
  handler: async (ctx, args) => {
    const { orgId, userId } = await requireOrgAdmin(ctx);
    const mealType = await ctx.db.get(args.mealTypeId);
    if (!mealType || mealType.orgId !== orgId) {
      throw new Error("Invalid meal type");
    }
    return await ctx.db.insert("menuItems", {
      orgId,
      title: args.title,
      description: args.description,
      mealTypeId: args.mealTypeId,
      imageStorageId: args.imageStorageId,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    mealTypeId: v.optional(v.id("mealTypes")),
    // Pass null to clear the image, undefined to leave it unchanged.
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (!item || item.orgId !== orgId) {
      throw new Error("Menu item not found");
    }

    const patch: Partial<Doc<"menuItems">> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.mealTypeId !== undefined) {
      const mealType = await ctx.db.get(args.mealTypeId);
      if (!mealType || mealType.orgId !== orgId) {
        throw new Error("Invalid meal type");
      }
      patch.mealTypeId = args.mealTypeId;
    }
    if (args.imageStorageId !== undefined) {
      // Clean up the previously stored image when replacing or clearing it.
      if (item.imageStorageId && item.imageStorageId !== args.imageStorageId) {
        await ctx.storage.delete(item.imageStorageId);
      }
      patch.imageStorageId = args.imageStorageId ?? undefined;
    }
    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const item = await ctx.db.get(id);
    if (!item || item.orgId !== orgId) {
      throw new Error("Menu item not found");
    }
    if (item.imageStorageId) {
      await ctx.storage.delete(item.imageStorageId);
    }
    await ctx.db.delete(id);
    return null;
  },
});
