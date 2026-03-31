/**
 * @module shared/routes
 *
 * Single source of truth for the public API contract. Each entry defines the
 * HTTP method, URL path, Zod input schema, and Zod response schemas for every
 * status code. Both the server route handlers (`server/routes.ts`) and the
 * frontend hooks consume this object, guaranteeing type-safe, consistent APIs
 * without code generation or OpenAPI tooling.
 *
 * To add a new endpoint, add it here first, then implement the route and
 * storage method. See CONTRIBUTING.md for a step-by-step guide.
 */

import { z } from 'zod';
import { insertPollSchema, insertContactMessageSchema, polls, votes, voters } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  polls: {
    list: {
      method: 'GET' as const,
      path: '/api/polls' as const,
      responses: {
        200: z.array(z.custom<typeof polls.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/polls/:id' as const,
      responses: {
        200: z.custom<typeof polls.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/polls' as const,
      input: insertPollSchema,
      responses: {
        201: z.custom<typeof polls.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  votes: {
    cast: {
      method: 'POST' as const,
      path: '/api/votes' as const,
      input: z.object({
        pollId: z.number(),
        optionSelected: z.string(),
        voterId: z.string(),
      }),
      responses: {
        201: z.object({
          success: z.boolean(),
          pollId: z.number(),
          pollTitle: z.string(),
          optionSelected: z.string(),
          receiptHash: z.string(),
          timestamp: z.string(),
        }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        409: z.object({ message: z.string() }),
      },
    },
  },
  voters: {
    verify: {
      method: 'POST' as const,
      path: '/api/voters/verify' as const,
      input: z.object({
        voterId: z.string(),
      }),
      responses: {
        200: z.object({
          valid: z.boolean(),
          hasVoted: z.boolean(),
        }),
      },
    }
  },
  contact: {
    submit: {
      method: 'POST' as const,
      path: '/api/contact' as const,
      input: insertContactMessageSchema,
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
      }
    }
  }
};

/**
 * Replaces `:param` placeholders in a route path with actual values.
 * Example: buildUrl('/api/polls/:id', { id: 42 }) => '/api/polls/42'
 */
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
