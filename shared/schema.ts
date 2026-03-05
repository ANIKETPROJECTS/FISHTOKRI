import { sql } from "drizzle-orm";
import { pgTable, text, serial, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Fish', 'Prawns', 'Chicken', 'Mutton', 'Masalas'
  status: text("status").notNull().default("available"), // 'available', 'unavailable', 'limited'
  limitedStockNote: text("limited_stock_note"),
  price: integer("price"), 
  unit: text("unit"), // e.g. 'per kg', 'per piece'
  imageUrl: text("image_url"),
  isArchived: boolean("is_archived").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderRequests = pgTable("order_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  deliveryArea: text("delivery_area").notNull(),
  address: text("address").notNull(), // House/Flat, Street, Area
  items: jsonb("items").notNull(), // Array of { productId, quantity, name, price }
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'out_for_delivery', 'delivered'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export const insertProductSchema = createInsertSchema(products).omit({ id: true, updatedAt: true, isArchived: true });
export const insertOrderRequestSchema = createInsertSchema(orderRequests).omit({ id: true, createdAt: true, status: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrderRequest = z.infer<typeof insertOrderRequestSchema>;
export type OrderRequest = typeof orderRequests.$inferSelect;

export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct> & { isArchived?: boolean };
export type CreateOrderRequest = InsertOrderRequest;
export type UpdateOrderStatusRequest = { status: string };
