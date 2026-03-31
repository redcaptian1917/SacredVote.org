/**
 * @module server/storage
 *
 * Data-access layer for SacredVote. All database operations go through the
 * `IStorage` interface so the rest of the server never touches Drizzle directly.
 * This makes it straightforward to swap implementations (e.g. an in-memory
 * store for tests) without changing route handlers.
 *
 * SECURITY NOTE — `castVote()` generates a SHA-256 receipt hash that includes
 * a cryptographically random 16-byte salt AND a high-resolution timestamp.
 * The voterId is mixed into the hash input but is NOT stored in the `votes`
 * row, preserving ballot anonymity.
 */

import { db } from "./db";
import {
  polls,
  votes,
  voters,
  contactMessages,
  siteContent,
  siteLinks,
  siteImages,
  type CreatePollRequest,
  type CastVoteRequest,
  type Poll,
  type Vote,
  type Voter,
  type ContactRequest,
  type ContactMessage,
  type SiteContent,
  type SiteLink,
  type SiteImage,
  type CreateSiteContentRequest,
  type CreateSiteLinkRequest,
  type CreateSiteImageRequest
} from "@shared/schema";
import { eq, sql, asc } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";

/**
 * Storage interface — every route handler depends on this contract.
 * Add new methods here first, then implement them in `DatabaseStorage`.
 */
export interface IStorage {
  getPolls(): Promise<Poll[]>;
  getPoll(id: number): Promise<Poll | undefined>;
  createPoll(poll: CreatePollRequest): Promise<Poll>;

  // Voters
  getVoter(voterId: string): Promise<Voter | undefined>;
  createVoter(voterId: string): Promise<Voter>;
  markVoterAsVoted(voterId: string): Promise<void>;

  // Votes
  castVote(vote: CastVoteRequest): Promise<Vote>;

  // Contact
  createContactMessage(message: ContactRequest): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;

  // CMS - Site Content
  getAllContent(): Promise<SiteContent[]>;
  getContentBySection(section: string): Promise<SiteContent[]>;
  getContentByKey(key: string): Promise<SiteContent | undefined>;
  upsertContent(data: CreateSiteContentRequest): Promise<SiteContent>;
  updateContentById(id: number, data: Partial<CreateSiteContentRequest>): Promise<SiteContent | undefined>;
  deleteContent(id: number): Promise<void>;

  // CMS - Site Links
  getAllLinks(): Promise<SiteLink[]>;
  getLinksBySection(section: string): Promise<SiteLink[]>;
  createLink(data: CreateSiteLinkRequest): Promise<SiteLink>;
  updateLink(id: number, data: Partial<CreateSiteLinkRequest>): Promise<SiteLink | undefined>;
  deleteLink(id: number): Promise<void>;

  // CMS - Site Images
  getAllImages(): Promise<SiteImage[]>;
  createImage(data: CreateSiteImageRequest): Promise<SiteImage>;
  deleteImage(id: number): Promise<void>;

  // CMS - Contact Messages
  deleteContactMessage(id: number): Promise<void>;
}

/**
 * Production storage backed by PostgreSQL via Drizzle ORM.
 * Instantiated as a singleton (`storage`) at the bottom of this file.
 */
export class DatabaseStorage implements IStorage {
  async getPolls(): Promise<Poll[]> {
    console.log(`[DEBUG] [getPolls] Fetching all polls (CMS).`);
    return await db.select().from(polls);
  }

  async getPoll(id: number): Promise<Poll | undefined> {
    console.log(`[DEBUG] [getPoll] Fetching poll ID: ${id}`);
    const [poll] = await db.select().from(polls).where(eq(polls.id, id));
    return poll;
  }

  async createPoll(poll: CreatePollRequest): Promise<Poll> {
    console.log(`[DEBUG] [createPoll] CMS creating poll: "${poll.title}"`);
    try {
      const [newPoll] = await db.insert(polls).values(poll).returning();
      console.log(`[DEBUG] [createPoll] SUCCESS: ID #${newPoll.id}`);
      return newPoll;
    } catch (err) {
      console.error(`[DEBUG] [createPoll] FAILURE:`, err);
      throw err;
    }
  }

  async getVoter(voterId: string): Promise<Voter | undefined> {
    console.log(`[DEBUG] [getVoter] Looking up voter ID: ${voterId}`);
    const [voter] = await db.select().from(voters).where(eq(voters.voterId, voterId));
    return voter;
  }

  async createVoter(voterId: string): Promise<Voter> {
    console.log(`[DEBUG] [createVoter] Registering new voter ID.`);
    try {
      const [voter] = await db.insert(voters).values({ voterId }).returning();
      console.log(`[DEBUG] [createVoter] SUCCESS: ID #${voter.id}`);
      return voter;
    } catch (err) {
      console.error(`[DEBUG] [createVoter] FAILURE:`, err);
      throw err;
    }
  }

  async markVoterAsVoted(voterId: string): Promise<void> {
    console.log(`[DEBUG] [markVoterAsVoted] Flagging voterId: ${voterId}`);
    await db.update(voters)
      .set({ hasVoted: true })
      .where(eq(voters.voterId, voterId));
  }

  /**
   * Cast a vote and produce a verifiable receipt hash.
   *
   * The hash is SHA-256 over `pollId:option:voterId:timestamp:salt`.
   * Including the voterId in the hash lets the voter verify their receipt
   * privately, but because the salt is random and the hash is one-way,
   * no one else can reverse it to discover the voter's identity.
   *
   * IMPORTANT: `voterId` is intentionally excluded from the INSERT — the
   * `votes` table must never contain a direct link to the voter.
   */
  async castVote(voteReq: CastVoteRequest): Promise<Vote> {
    console.log(`[DEBUG] [castVote] IP initiating vote for poll ID: ${voteReq.pollId}`);
    try {
      const salt = randomBytes(16).toString('hex');
      const data = `${voteReq.pollId}:${voteReq.optionSelected}:${voteReq.voterId}:${Date.now()}:${salt}`;
      const receiptHash = createHash('sha256').update(data).digest('hex');

      const [vote] = await db.insert(votes).values({
        pollId: voteReq.pollId,
        optionSelected: voteReq.optionSelected,
        receiptHash: receiptHash,
      }).returning();

      console.log(`[DEBUG] [castVote] SUCCESS: Receipt hash generated: ${receiptHash.substring(0, 16)}...`);
      return vote;
    } catch (err) {
      console.error(`[DEBUG] [castVote] FAILURE:`, err);
      throw err;
    }
  }

  async createContactMessage(message: ContactRequest): Promise<ContactMessage> {
    console.log(`[DEBUG] [createContactMessage] Logging new message from: ${message.email}`);
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    console.log(`[DEBUG] [getContactMessages] Fetching all inbox messages.`);
    return await db.select().from(contactMessages);
  }

  async getAllContent(): Promise<SiteContent[]> {
    console.log(`[DEBUG] [getAllContent] Fetching full site content ledger.`);
    return await db.select().from(siteContent);
  }

  async getContentBySection(section: string): Promise<SiteContent[]> {
    console.log(`[DEBUG] [getContentBySection] Fetching blocks for section: ${section}`);
    return await db.select().from(siteContent).where(eq(siteContent.section, section));
  }

  async getContentByKey(key: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    return content;
  }

  async upsertContent(data: CreateSiteContentRequest): Promise<SiteContent> {
    console.log(`[DEBUG] [upsertContent] Key: ${data.key}, Section: ${data.section}`);
    const existing = await this.getContentByKey(data.key);
    if (existing) {
      console.log(`[DEBUG] [upsertContent] Updating existing block ID #${existing.id}`);
      const [updated] = await db.update(siteContent)
        .set({ value: data.value, type: data.type, section: data.section, label: data.label, updatedAt: new Date() })
        .where(eq(siteContent.key, data.key))
        .returning();
      return updated;
    }
    console.log(`[DEBUG] [upsertContent] Creating new block.`);
    const [created] = await db.insert(siteContent).values(data).returning();
    return created;
  }

  async updateContentById(id: number, data: Partial<CreateSiteContentRequest>): Promise<SiteContent | undefined> {
    console.log(`[DEBUG] [updateContentById] Updating ID #${id}`);
    const [updated] = await db.update(siteContent)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(siteContent.id, id))
      .returning();
    return updated;
  }

  async deleteContent(id: number): Promise<void> {
    console.log(`[DEBUG] [deleteContent] Removing content block ID #${id}`);
    await db.delete(siteContent).where(eq(siteContent.id, id));
  }

  async getAllLinks(): Promise<SiteLink[]> {
    console.log(`[DEBUG] [getAllLinks] Fetching all navigation links.`);
    return await db.select().from(siteLinks).orderBy(asc(siteLinks.order));
  }

  async getLinksBySection(section: string): Promise<SiteLink[]> {
    return await db.select().from(siteLinks)
      .where(eq(siteLinks.section, section))
      .orderBy(asc(siteLinks.order));
  }

  async createLink(data: CreateSiteLinkRequest): Promise<SiteLink> {
    console.log(`[DEBUG] [createLink] Adding link: ${data.label}`);
    const [link] = await db.insert(siteLinks).values(data).returning();
    return link;
  }

  async updateLink(id: number, data: Partial<CreateSiteLinkRequest>): Promise<SiteLink | undefined> {
    console.log(`[DEBUG] [updateLink] Updating link ID #${id}`);
    const [updated] = await db.update(siteLinks).set(data).where(eq(siteLinks.id, id)).returning();
    return updated;
  }

  async deleteLink(id: number): Promise<void> {
    console.log(`[DEBUG] [deleteLink] Removing link ID #${id}`);
    await db.delete(siteLinks).where(eq(siteLinks.id, id));
  }

  async getAllImages(): Promise<SiteImage[]> {
    console.log(`[DEBUG] [getAllImages] Querying image gallery.`);
    return await db.select().from(siteImages);
  }

  async createImage(data: CreateSiteImageRequest): Promise<SiteImage> {
    console.log(`[DEBUG] [createImage] Storing metadata for: ${data.name}`);
    const [image] = await db.insert(siteImages).values(data).returning();
    return image;
  }

  async deleteImage(id: number): Promise<void> {
    await db.delete(siteImages).where(eq(siteImages.id, id));
  }

  async deleteContactMessage(id: number): Promise<void> {
    console.log(`[DEBUG] [deleteContactMessage] Removing message ID #${id}`);
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }
}

export const storage = new DatabaseStorage();
