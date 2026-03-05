import {
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type UpdateProductRequest,
  type OrderRequest,
  type InsertOrderRequest,
} from "@shared/schema";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

const MemoryStore = MemoryStoreFactory(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getOrderRequests(): Promise<OrderRequest[]>;
  getOrderRequest(id: number): Promise<OrderRequest | undefined>;
  createOrderRequest(order: InsertOrderRequest): Promise<OrderRequest>;
  updateOrderRequestStatus(id: number, status: string): Promise<OrderRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, OrderRequest>;
  sessionStore: session.Store;
  currentUserId: number;
  currentProductId: number;
  currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => !p.isArchived);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      isArchived: false, 
      updatedAt: new Date(),
      price: product.price ?? null,
      unit: product.unit ?? null,
      imageUrl: product.imageUrl ?? null,
      limitedStockNote: product.limitedStockNote ?? null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updated = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      this.products.set(id, { ...product, isArchived: true });
    }
  }

  async getOrderRequests(): Promise<OrderRequest[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
  }

  async getOrderRequest(id: number): Promise<OrderRequest | undefined> {
    return this.orders.get(id);
  }

  async createOrderRequest(order: InsertOrderRequest): Promise<OrderRequest> {
    const id = this.currentOrderId++;
    const newOrder: OrderRequest = { 
      ...order, 
      id, 
      status: "pending", 
      createdAt: new Date(),
      notes: order.notes ?? null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderRequestStatus(id: number, status: string): Promise<OrderRequest | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, status };
    this.orders.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
