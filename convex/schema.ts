import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index("byExternalId", ["externalId"]),

    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    // Clerk organizations synced via webhook. Powers public per-org pages.
    organizations: defineTable({
      clerkOrgId: v.string(), // Clerk organization id (org_...)
      name: v.string(),
      slug: v.string(),
      imageUrl: v.optional(v.string()),
    })
      .index("byClerkOrgId", ["clerkOrgId"])
      .index("bySlug", ["slug"]),

    // Per-org meal categories. Seeded with Breakfast/Lunch/Dinner on org create.
    mealTypes: defineTable({
      orgId: v.string(), // clerkOrgId
      name: v.string(),
      order: v.number(),
      color: v.optional(v.string()),
      isDefault: v.boolean(),
    }).index("byOrg", ["orgId"]),

    // The food library. A menu item belongs to one meal-type category.
    menuItems: defineTable({
      orgId: v.string(), // clerkOrgId
      title: v.string(),
      description: v.string(),
      imageStorageId: v.optional(v.id("_storage")),
      mealTypeId: v.id("mealTypes"),
      createdBy: v.string(), // clerk user id
    }).index("byOrg", ["orgId"]),

    // Calendar entries: a meal placed on a specific day + hour.
    scheduledMeals: defineTable({
      orgId: v.string(), // clerkOrgId
      date: v.string(), // "YYYY-MM-DD"
      startHour: v.number(), // 0-23
      endHour: v.optional(v.number()), // 0-23, inclusive; defaults to startHour
      mealTypeId: v.id("mealTypes"),
      menuItemIds: v.array(v.id("menuItems")),
      note: v.optional(v.string()),
    })
      .index("byOrgDate", ["orgId", "date"])
      .index("byOrg", ["orgId"]),
  });