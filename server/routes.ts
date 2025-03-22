import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  portfolioSchema, 
  insertContactSchema,
  type PortfolioData
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Get portfolio data endpoint
  app.get("/api/portfolio/:id", async (req: Request, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.id);
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }

      const portfolio = await storage.getPortfolio(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      return res.status(200).json(portfolio.data);
    } catch (error) {
      console.error("Error getting portfolio:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create/update portfolio endpoint
  app.post("/api/portfolio", async (req: Request, res: Response) => {
    try {
      // Validate the portfolio data
      const result = portfolioSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const portfolioData = result.data;
      
      // Create a default user if none exists
      let user = await storage.getUserByUsername("defaultuser");
      
      if (!user) {
        user = await storage.createUser({
          username: "defaultuser",
          password: "defaultpassword",
        });
      }

      // Check if portfolio exists for this user
      let portfolio = await storage.getPortfolioByUserId(user.id);
      
      if (portfolio) {
        // Update existing portfolio
        portfolio = await storage.updatePortfolio(portfolio.id, portfolioData);
        return res.status(200).json({ id: portfolio?.id, message: "Portfolio updated successfully" });
      } else {
        // Create new portfolio
        portfolio = await storage.createPortfolio({
          userId: user.id,
          data: portfolioData,
        });
        return res.status(201).json({ id: portfolio.id, message: "Portfolio created successfully" });
      }
    } catch (error) {
      console.error("Error creating/updating portfolio:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Add current date to request body
      const contactData = {
        ...req.body,
        createdAt: new Date().toISOString()
      };

      // Validate the contact form data
      const result = insertContactSchema.safeParse(contactData);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const contact = await storage.createContactMessage(result.data);
      
      return res.status(201).json({ 
        id: contact.id, 
        message: "Message sent successfully" 
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
