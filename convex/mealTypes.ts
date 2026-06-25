import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getOrgContext, requireOrgAdmin } from "./organizations";

// List meal types for the active organization, ordered.
export const list = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await getOrgContext(ctx);
    const mealTypes = await ctx.db
      .query("mealTypes")
      .withIndex("byOrg", (q) => q.eq("orgId", orgId))
      .collect();
    return mealTypes.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  returns: v.id("mealTypes"),
  handler: async (ctx, { name, color }) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const existing = await ctx.db
      .query("mealTypes")
      .withIndex("byOrg", (q) => q.eq("orgId", orgId))
      .collect();
    const maxOrder = existing.reduce((max, mt) => Math.max(max, mt.order), -1);
    return await ctx.db.insert("mealTypes", {
      orgId,
      name,
      color,
      order: maxOrder + 1,
      isDefault: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("mealTypes"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { id, name, color, order }) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const mealType = await ctx.db.get(id);
    if (!mealType || mealType.orgId !== orgId) {
      throw new Error("Meal type not found");
    }
    const patch: Partial<{ name: string; color: string; order: number }> = {};
    if (name !== undefined) patch.name = name;
    if (color !== undefined) patch.color = color;
    if (order !== undefined) patch.order = order;
    await ctx.db.patch(id, patch);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("mealTypes") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const mealType = await ctx.db.get(id);
    if (!mealType || mealType.orgId !== orgId) {
      throw new Error("Meal type not found");
    }
    // Block deletion while menu items still reference this meal type.
    const orgMenuItems = await ctx.db
      .query("menuItems")
      .withIndex("byOrg", (q) => q.eq("orgId", orgId))
      .collect();
    if (orgMenuItems.some((item) => item.mealTypeId === id)) {
      throw new Error("Cannot delete a meal type that still has menu items");
    }
    await ctx.db.delete(id);
    return null;
  },
});
