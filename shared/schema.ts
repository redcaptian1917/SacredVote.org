/**
 * @module shared/schema
 *
 * Central data-model definition for SacredVote.
 *
 * Every database table, insert schema, and API type lives here so the client
 * and server share a single source of truth. Drizzle ORM generates the SQL
 * DDL; drizzle-zod generates Zod validation schemas from the same definitions.
 *
 * SECURITY NOTE — The `votes` table intentionally has NO foreign key to
 * `voters`. This separation ensures that a database dump cannot correlate a
 * ballot with the person who cast it. The only link is the one-way SHA-256
 * receipt hash, which includes a random salt (see `storage.ts`).
 */

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TYPES FOR ACCESS POLICY ===

export const GEOGRAPHIC_SCOPES = ["world", "continent", "nation", "state", "county", "city", "precinct"] as const;
export type GeographicScope = typeof GEOGRAPHIC_SCOPES[number];

export const ATTRIBUTE_OPERATORS = ["eq", "neq", "gte", "lte", "gt", "lt", "in", "contains"] as const;
export type AttributeOperator = typeof ATTRIBUTE_OPERATORS[number];

export type AccessCondition = {
  key: string;
  operator: AttributeOperator;
  value: string | number | boolean | string[];
};

export type LocationEntry = {
  scope: Exclude<GeographicScope, "world">;
  value: string;
};

export type AccessPolicy = {
  geographic?: {
    scope: GeographicScope;
    regions: string[];
  };
  locations?: LocationEntry[];
  attributes?: AccessCondition[];
};

export type VoterAttributes = {
  location?: {
    continent?: string;
    nation?: string;
    state?: string;
    county?: string;
    city?: string;
    precinct?: string;
  };
  [key: string]: unknown;
};

// === TABLE DEFINITIONS ===

/**
 * Polls — each row represents a single ballot question with a JSONB array of
 * selectable options. `isOpen` controls whether voters can still cast ballots.
 */
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  answerType: text("answer_type").default("radio").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxSelections: integer("max_selections"),
  category: text("category"),
  displayOrder: integer("display_order").default(0).notNull(),
  securityTier: integer("security_tier").default(1).notNull(),
  embargoResults: boolean("embargo_results").default(true).notNull(),
  accessPolicy: jsonb("access_policy").$type<AccessPolicy>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Compatibility with newer code that might expect 'is_open'
  isOpen: boolean("is_open").default(true).notNull(),
});

/**
 * Votes — stores each cast ballot. `receiptHash` is a SHA-256 digest that the
 * voter can use to verify inclusion without revealing their identity.
 * There is deliberately no voter reference here (see module-level security note).
 */
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  pollId: integer("poll_id").notNull(),
  voterHash: text("voter_hash").notNull(),
  selectedOptionIndex: integer("selected_option_index").notNull(),
  openEndedResponse: text("open_ended_response"),
  voteHash: text("vote_hash").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  nonce: integer("nonce").notNull().default(0),
  previousHash: text("previous_hash"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  // Compatibility fields
  optionSelected: text("option_selected"),
  receiptHash: text("receipt_hash"),
}, (table) => [
  uniqueIndex("votes_poll_voter_option_unique").on(table.pollId, table.voterHash, table.selectedOptionIndex),
]);

/**
 * Voters — authorized voter roster. `hasVoted` is flipped to `true` after a
 * ballot is cast, preventing double-voting. The `voterId` is a pre-issued
 * credential (e.g. "VOTE-1234-5678") verified at the /auth page.
 */
export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  voterId: text("voter_id").notNull().unique(),
  hasVoted: boolean("has_voted").default(false).notNull(),
  // Compatibility with voterIds table if needed
  code: text("code"),
  type: text("type").default("voter"),
  isActive: boolean("is_active").default(true),
  attributes: jsonb("attributes").$type<VoterAttributes>(),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Contact Messages — public contact-form submissions stored for admin review. */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/**
 * Site Content (CMS) — key/value text blocks managed through the admin panel.
 * `key` is the unique identifier used by the frontend to look up a piece of
 * content; `section` groups related keys for the admin UI.
 */
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull().default("text"),
  section: text("section").notNull().default("general"),
  label: text("label").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Site Links (CMS) — admin-managed navigation and reference links, ordered by `order`. */
export const siteLinks = pgTable("site_links", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  section: text("section").notNull().default("general"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Site Images (CMS) — uploaded images referenced by the frontend via their `url`. */
export const siteImages = pgTable("site_images", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text").notNull().default(""),
  section: text("section").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * === INSERT SCHEMAS ===
 * Generated from the table definitions by drizzle-zod. Auto-generated columns
 * (id, timestamps) are omitted so these schemas validate only user-supplied fields.
 */
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true });
export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, timestamp: true });
export const insertVoterSchema = createInsertSchema(voters).omit({ id: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });
export const insertSiteContentSchema = createInsertSchema(siteContent).omit({ id: true, updatedAt: true });
export const insertSiteLinkSchema = createInsertSchema(siteLinks).omit({ id: true, createdAt: true });
export const insertSiteImageSchema = createInsertSchema(siteImages).omit({ id: true, createdAt: true });

/**
 * === API CONTRACT TYPES ===
 * Select types (database row shapes) and request/response types used by both
 * the server routes and the frontend hooks.
 */
export type Poll = typeof polls.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Voter = typeof voters.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type SiteContent = typeof siteContent.$inferSelect;
export type SiteLink = typeof siteLinks.$inferSelect;
export type SiteImage = typeof siteImages.$inferSelect;
export type CreateSiteContentRequest = z.infer<typeof insertSiteContentSchema>;
export type CreateSiteLinkRequest = z.infer<typeof insertSiteLinkSchema>;
export type CreateSiteImageRequest = z.infer<typeof insertSiteImageSchema>;

export type CreatePollRequest = z.infer<typeof insertPollSchema>;

/**
 * CastVoteRequest includes the `voterId` so the server can verify eligibility
 * and mark the voter as having voted, but it is NEVER persisted in the `votes`
 * table — it is used only transiently during the cast-vote transaction.
 */
export type CastVoteRequest = {
  pollId: number;
  optionSelected: string;
  voterId: string;
};
export type VerifyVoterRequest = {
  voterId: string;
};
export type ContactRequest = z.infer<typeof insertContactMessageSchema>;

// Response types
export type PollResponse = Poll;
export type VoteReceiptResponse = {
  success: true;
  pollId: number;
  pollTitle: string;
  optionSelected: string;
  receiptHash: string;
  timestamp: string;
};
export type VoterVerificationResponse = {
  valid: boolean;
  hasVoted: boolean;
};
