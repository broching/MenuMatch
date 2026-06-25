import { internalMutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

// Default meal categories seeded when an organization is first created.
const DEFAULT_MEAL_TYPES = [
  { name: "Breakfast", color: "#f59e0b" },
  { name: "Lunch", color: "#10b981" },
  { name: "Dinner", color: "#6366f1" },
];

/**
 * Returns the active organization context from the Clerk JWT.
 * Requires the `convex` JWT template to include `org_id`, `org_role`, `org_slug`.
 */
export async function getOrgContext(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  const orgId = (identity as unknown as { org_id?: string }).org_id;
  if (!orgId) {
    throw new Error("No active organization selected");
  }
  const orgRole = (identity as unknown as { org_role?: string }).org_role;
  const orgSlug = (identity as unknown as { org_slug?: string }).org_slug;
  return { identity, orgId, orgRole, orgSlug, userId: identity.subject };
}

/** Asserts the caller is an admin of the active organization. */
export async function requireOrgAdmin(ctx: QueryCtx) {
  const context = await getOrgContext(ctx);
  if (context.orgRole !== "org:admin") {
    throw new Error("Requires organization admin role");
  }
  return context;
}

async function orgByClerkId(ctx: QueryCtx, clerkOrgId: string) {
  return await ctx.db
    .query("organizations")
    .withIndex("byClerkOrgId", (q) => q.eq("clerkOrgId", clerkOrgId))
    .unique();
}

async function seedDefaultMealTypes(ctx: MutationCtx, orgId: string) {
  await Promise.all(
    DEFAULT_MEAL_TYPES.map((mealType, index) =>
      ctx.db.insert("mealTypes", {
        orgId,
        name: mealType.name,
        color: mealType.color,
        order: index,
        isDefault: true,
      }),
    ),
  );
}

// Public query used by the per-org public pages (/menu/[slug]).
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("organizations")
      .withIndex("bySlug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const upsertFromClerk = internalMutation({
  // Clerk organization webhook payload (trusted, not runtime-validated).
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const attributes = {
      clerkOrgId: data.id as string,
      name: data.name as string,
      slug: data.slug as string,
      imageUrl: (data.image_url as string | undefined) || undefined,
    };

    const existing = await orgByClerkId(ctx, attributes.clerkOrgId);
    if (existing === null) {
      await ctx.db.insert("organizations", attributes);
      await seedDefaultMealTypes(ctx, attributes.clerkOrgId);
    } else {
      await ctx.db.patch(existing._id, attributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkOrgId: v.string() },
  returns: v.null(),
  handler: async (ctx, { clerkOrgId }) => {
    const org = await orgByClerkId(ctx, clerkOrgId);
    if (org !== null) {
      await ctx.db.delete(org._id);
    } else {
      console.warn(`Can't delete organization, none for Clerk org ID: ${clerkOrgId}`);
    }
  },
});
