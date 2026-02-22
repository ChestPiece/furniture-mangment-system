import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all products
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// Get a single product by ID
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new product
export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    price: v.number(),
    stock: v.number(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    lowStockThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check for existing SKU
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();

    if (existing) {
      throw new Error("Product with this SKU already exists");
    }

    const productId = await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return productId;
  },
});

// Update product stock
export const updateStock = mutation({
  args: {
    id: v.id("products"),
    quantityChange: v.number(), // Positive to add, negative to subtract
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

    const newStock = product.stock + args.quantityChange;
    if (newStock < 0) throw new Error("Insufficient stock");

    await ctx.db.patch(args.id, {
      stock: newStock,
      updatedAt: Date.now(),
    });
  },
});

// Delete product
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
