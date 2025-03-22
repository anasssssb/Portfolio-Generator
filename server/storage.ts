import { 
  users, 
  portfolios, 
  contactMessages, 
  type User, 
  type InsertUser, 
  type Portfolio, 
  type InsertPortfolio,
  type ContactMessage,
  type InsertContact,
  type PortfolioData
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio operations
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, data: PortfolioData): Promise<Portfolio | undefined>;
  
  // Contact message operations
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  getContactMessages(portfolioId: number): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private contactMessages: Map<number, ContactMessage>;
  private currentUserId: number;
  private currentPortfolioId: number;
  private currentContactMessageId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.contactMessages = new Map();
    this.currentUserId = 1;
    this.currentPortfolioId = 1;
    this.currentContactMessageId = 1;
  }

  // User operations
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

  // Portfolio operations
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(
      (portfolio) => portfolio.userId === userId,
    );
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = { ...insertPortfolio, id };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, data: PortfolioData): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    
    const updatedPortfolio: Portfolio = { ...portfolio, data };
    this.portfolios.set(id, updatedPortfolio);
    return updatedPortfolio;
  }

  // Contact message operations
  async createContactMessage(insertMessage: InsertContact): Promise<ContactMessage> {
    const id = this.currentContactMessageId++;
    const message: ContactMessage = { 
      ...insertMessage, 
      id,
      createdAt: new Date().toISOString()
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(portfolioId: number): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).filter(
      (message) => message.portfolioId === portfolioId,
    );
  }
}

export const storage = new MemStorage();
