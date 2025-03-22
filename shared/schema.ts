import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Social Media link schema
export const socialMediaSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

// Custom URL validator that accepts both local paths and full URLs
const relativeOrAbsoluteUrl = z.string().refine(val => {
  // Accept relative paths that start with / (local uploads)
  if (val.startsWith('/')) {
    return true;
  }
  // Otherwise, try to validate as a URL
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, { message: 'Must be a valid URL or a local path starting with "/"' });

// Project schema
export const projectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: relativeOrAbsoluteUrl.optional(),
  github: z.string().url(),
  order: z.number().optional(),
});

// Portfolio data schema
export const portfolioSchema = z.object({
  fullName: z.string(),
  title: z.string(),
  shortBio: z.string(),
  profilePicture: relativeOrAbsoluteUrl,
  detailedBio: z.string(),
  skills: z.array(z.string()),
  projects: z.array(projectSchema),
  socialMedia: z.array(socialMediaSchema),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  data: jsonb("data").notNull().$type<z.infer<typeof portfolioSchema>>(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: text("createdAt").notNull(),
  portfolioId: integer("portfolioId").references(() => portfolios.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  data: true,
});

export const insertContactSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
  portfolioId: true,
});

export type SocialMedia = z.infer<typeof socialMediaSchema>;
export type Project = z.infer<typeof projectSchema>;
export type PortfolioData = z.infer<typeof portfolioSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type User = typeof users.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
