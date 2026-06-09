import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id:         uuid("id").primaryKey().defaultRandom(),
  email:      text("email").notNull().unique(),
  name:       text("name").notNull().default(""),
  provider:   text("provider").notNull(),
  providerId: text("provider_id").notNull(),
  avatarUrl:  text("avatar_url"),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User     = typeof usersTable.$inferSelect;
