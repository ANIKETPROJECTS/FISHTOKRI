import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Products routes (public for list, protected for modifications)
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post(api.products.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.products.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.products.bulkUpdateStatus.path, requireAuth, async (req, res) => {
    try {
      const { category, status } = api.products.bulkUpdateStatus.input.parse(req.body);
      const products = await storage.getProducts();
      
      const promises = products
        .filter(p => p.category === category)
        .map(p => storage.updateProduct(p.id, { status }));
        
      await Promise.all(promises);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.products.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).end();
  });

  // Orders routes (public create, protected list/update)
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrderRequest(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.orders.list.path, requireAuth, async (req, res) => {
    const orders = await storage.getOrderRequests();
    res.json(orders);
  });

  app.patch(api.orders.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.updateStatus.input.parse(req.body);
      const order = await storage.updateOrderRequestStatus(Number(req.params.id), input.status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    const defaultProducts = [
      // FISH
      { name: "Silver Pomfret", category: "Fish", status: "available", price: 1200, unit: "per kg" },
      { name: "Black Pomfret", category: "Fish", status: "available", price: 1100, unit: "per kg" },
      { name: "Khapri Pomfret", category: "Fish", status: "available", price: 1000, unit: "per kg" },
      { name: "Surmai", category: "Fish", status: "available", price: 900, unit: "per kg" },
      { name: "Rawas", category: "Fish", status: "available", price: 950, unit: "per kg" },
      { name: "Lady Fish", category: "Fish", status: "available", price: 600, unit: "per kg" },
      { name: "Bombil", category: "Fish", status: "available", price: 400, unit: "per kg" },
      { name: "Bangda", category: "Fish", status: "available", price: 350, unit: "per kg" },
      { name: "Tarli", category: "Fish", status: "available", price: 300, unit: "per kg" },
      { name: "Karli", category: "Fish", status: "available", price: 450, unit: "per kg" },
      { name: "Shark", category: "Fish", status: "available", price: 550, unit: "per kg" },
      { name: "Catla", category: "Fish", status: "available", price: 300, unit: "per kg" },
      { name: "Tuna", category: "Fish", status: "available", price: 500, unit: "per kg" },
      { name: "Ghol", category: "Fish", status: "available", price: 1500, unit: "per kg" },
      { name: "Jitada", category: "Fish", status: "available", price: 800, unit: "per kg" },
      { name: "Vaam", category: "Fish", status: "available", price: 700, unit: "per kg" },
      { name: "Indian Basa", category: "Fish", status: "available", price: 400, unit: "per kg" },
      { name: "Rohu", category: "Fish", status: "available", price: 300, unit: "per kg" },
      
      // PRAWNS
      { name: "White Prawn", category: "Prawns", status: "available", price: 700, unit: "per kg" },
      { name: "Red Prawn", category: "Prawns", status: "available", price: 750, unit: "per kg" },
      { name: "Tiger Prawn", category: "Prawns", status: "available", price: 1200, unit: "per kg" },
      { name: "Freshwater Prawn", category: "Prawns", status: "available", price: 650, unit: "per kg" },
      { name: "Scampi Prawn", category: "Prawns", status: "available", price: 900, unit: "per kg" },
      { name: "Lobsters", category: "Prawns", status: "available", price: 2500, unit: "per kg" },
      { name: "Kardi", category: "Prawns", status: "available", price: 400, unit: "per kg" },
      { name: "Jumbo Prawn", category: "Prawns", status: "available", price: 1500, unit: "per kg" },

      // CHICKEN
      { name: "Chicken Curry Cut", category: "Chicken", status: "available", price: 250, unit: "per kg" },
      { name: "Chicken Breast", category: "Chicken", status: "available", price: 350, unit: "per kg" },
      { name: "Chicken Boneless Cubes", category: "Chicken", status: "available", price: 400, unit: "per kg" },
      { name: "Chicken Whole Leg", category: "Chicken", status: "available", price: 300, unit: "per kg" },
      { name: "Chicken Drumstick", category: "Chicken", status: "available", price: 350, unit: "per kg" },
      { name: "Chicken Lollipop", category: "Chicken", status: "available", price: 300, unit: "per 10pcs" },
      { name: "Chicken Kheema", category: "Chicken", status: "available", price: 450, unit: "per kg" },
      { name: "Chicken Liver", category: "Chicken", status: "available", price: 150, unit: "per kg" },

      // MUTTON
      { name: "Goat Curry Cut", category: "Mutton", status: "available", price: 850, unit: "per kg" },
      { name: "Goat Shoulder Cut", category: "Mutton", status: "available", price: 900, unit: "per kg" },
      { name: "Goat Boneless", category: "Mutton", status: "available", price: 1100, unit: "per kg" },
      { name: "Goat Liver", category: "Mutton", status: "available", price: 850, unit: "per kg" },
      { name: "Goat Kheema", category: "Mutton", status: "available", price: 950, unit: "per kg" },
      { name: "Goat Paya", category: "Mutton", status: "available", price: 400, unit: "per 4pcs" },
      { name: "Goat Brain", category: "Mutton", status: "available", price: 250, unit: "per pc" },
      { name: "Goat Biryani Cut", category: "Mutton", status: "available", price: 850, unit: "per kg" },

      // MASALAS
      { name: "Fish Curry Masala", category: "Masalas", status: "available", price: 50, unit: "per pc" },
      { name: "Fish Fry Masala", category: "Masalas", status: "available", price: 50, unit: "per pc" },
      { name: "Malvani Masala", category: "Masalas", status: "available", price: 100, unit: "per 100g" },
      { name: "Special Chicken Masala", category: "Masalas", status: "available", price: 60, unit: "per pc" },
      { name: "Special Mutton Masala", category: "Masalas", status: "available", price: 60, unit: "per pc" },
      { name: "Koliwada Masala", category: "Masalas", status: "available", price: 70, unit: "per pc" },
    ];
    
    for (const product of defaultProducts) {
      await storage.createProduct(product as any);
    }
    console.log("Seeded database with all FishTokri products.");
  }
}
