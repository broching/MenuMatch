import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { getOrgContext, requireOrgAdmin } from "./organizations";

// Enrich a scheduled meal with its meal type and resolved menu items.
async function enrich(ctx: QueryCtx, meal: Doc<"scheduledMeals">) {
  const mealType = await ctx.db.get(meal.mealTypeId);
  const menuItems = await Promise.all(
    meal.menuItemIds.map(async (id) => {
      const item = await ctx.db.get(id);
      if (!item) return null;
      return {
        _id: item._id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageStorageId
          ? await ctx.storage.getUrl(item.imageStorageId)
          : null,
      };
    }),
  );
  return {
    ...meal,
    mealType: mealType
      ? { _id: mealType._id, name: mealType.name, color: mealType.color }
      : null,
    menuItems: menuItems.filter((item) => item !== null),
  };
}

async function listForOrgDate(ctx: QueryCtx, orgId: string, date: string) {
  const meals = await ctx.db
    .query("scheduledMeals")
    .withIndex("byOrgDate", (q) => q.eq("orgId", orgId).eq("date", date))
    .collect();
  const enriched = await Promise.all(meals.map((meal) => enrich(ctx, meal)));
  return enriched.sort((a, b) => a.startHour - b.startHour);
}

async function listForOrgRange(
  ctx: QueryCtx,
  orgId: string,
  startDate: string,
  endDate: string,
) {
  // Date strings are "YYYY-MM-DD", so lexicographic order is chronological.
  const meals = await ctx.db
    .query("scheduledMeals")
    .withIndex("byOrgDate", (q) =>
      q.eq("orgId", orgId).gte("date", startDate).lte("date", endDate),
    )
    .collect();
  const enriched = await Promise.all(meals.map((meal) => enrich(ctx, meal)));
  return enriched.sort(
    (a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour,
  );
}

// Scheduled meals for a given day in the active organization (dashboard).
export const listByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const { orgId } = await getOrgContext(ctx);
    return await listForOrgDate(ctx, orgId, date);
  },
});

// Scheduled meals across a date range in the active organization (month view).
export const listByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { startDate, endDate }) => {
    const { orgId } = await getOrgContext(ctx);
    return await listForOrgRange(ctx, orgId, startDate, endDate);
  },
});

// Scheduled meals for a public organization page on a given day.
export const listPublicByDate = query({
  args: { slug: v.string(), date: v.string() },
  handler: async (ctx, { slug, date }) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();
    if (!org) return [];
    return await listForOrgDate(ctx, org.clerkOrgId, date);
  },
});

// Scheduled meals across a date range for a public organization page.
export const listPublicByDateRange = query({
  args: { slug: v.string(), startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { slug, startDate, endDate }) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();
    if (!org) return [];
    return await listForOrgRange(ctx, org.clerkOrgId, startDate, endDate);
  },
});

function validateHours(startHour: number, endHour: number) {
  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    throw new Error("Hours must be between 0 and 23");
  }
  if (endHour < startHour) {
    throw new Error("endHour must be greater than or equal to startHour");
  }
}

export const create = mutation({
  args: {
    date: v.string(),
    startHour: v.number(),
    endHour: v.optional(v.number()),
    mealTypeId: v.id("mealTypes"),
    menuItemIds: v.array(v.id("menuItems")),
    note: v.optional(v.string()),
  },
  returns: v.id("scheduledMeals"),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const endHour = args.endHour ?? args.startHour;
    validateHours(args.startHour, endHour);
    const mealType = await ctx.db.get(args.mealTypeId);
    if (!mealType || mealType.orgId !== orgId) {
      throw new Error("Invalid meal type");
    }
    return await ctx.db.insert("scheduledMeals", {
      orgId,
      date: args.date,
      startHour: args.startHour,
      endHour,
      mealTypeId: args.mealTypeId,
      menuItemIds: args.menuItemIds,
      note: args.note,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("scheduledMeals"),
    startHour: v.optional(v.number()),
    endHour: v.optional(v.number()),
    mealTypeId: v.optional(v.id("mealTypes")),
    menuItemIds: v.optional(v.array(v.id("menuItems"))),
    note: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const meal = await ctx.db.get(args.id);
    if (!meal || meal.orgId !== orgId) {
      throw new Error("Scheduled meal not found");
    }
    const patch: Partial<Doc<"scheduledMeals">> = {};
    // Resolve the effective window so we can validate start <= end together.
    const nextStart = args.startHour ?? meal.startHour;
    const nextEnd = args.endHour ?? meal.endHour ?? nextStart;
    if (args.startHour !== undefined || args.endHour !== undefined) {
      validateHours(nextStart, nextEnd);
      patch.startHour = nextStart;
      patch.endHour = nextEnd;
    }
    if (args.mealTypeId !== undefined) {
      const mealType = await ctx.db.get(args.mealTypeId);
      if (!mealType || mealType.orgId !== orgId) {
        throw new Error("Invalid meal type");
      }
      patch.mealTypeId = args.mealTypeId;
    }
    if (args.menuItemIds !== undefined) patch.menuItemIds = args.menuItemIds;
    if (args.note !== undefined) patch.note = args.note ?? undefined;
    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("scheduledMeals") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const { orgId } = await requireOrgAdmin(ctx);
    const meal = await ctx.db.get(id);
    if (!meal || meal.orgId !== orgId) {
      throw new Error("Scheduled meal not found");
    }
    await ctx.db.delete(id);
    return null;
  },
});
