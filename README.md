# Cloudflare Full-Stack Starter

[cloudflarebutton]

A production-ready full-stack template combining React, TypeScript, Tailwind CSS, and Cloudflare Workers with Durable Objects for scalable stateful applications.

## Description

This template provides a modern development experience for building web applications with a React frontend and a Cloudflare Workers backend. It includes a complete demo of real-time chat functionality using IndexedEntity patterns, demonstrating how to manage users, chats, and messages across distributed Durable Objects. Perfect for rapidly prototyping and deploying serverless full-stack applications.

## Key Features

- React 18 + Vite frontend with shadcn/ui components and Tailwind CSS
- Cloudflare Workers backend powered by Hono for routing
- Durable Objects with built-in indexing for entities (Users, Chat Boards)
- Shared TypeScript types between frontend and worker
- Pre-configured error handling, API client, and theme support
- Dark mode, responsive layout, and animation utilities
- Type-safe development with strict TypeScript configurations

## Technology Stack

**Frontend**
- React 18, React Router, TanStack Query
- Tailwind CSS, shadcn/ui, Lucide icons
- Zustand, Immer, Framer Motion, Sonner

**Backend**
- Cloudflare Workers + Durable Objects
- Hono framework, TypeScript
- SQLite-backed storage via GlobalDurableObject

**Dev Tools**
- Vite, Bun, Wrangler, ESLint
- PostCSS, Autoprefixer

## Getting Started

### Prerequisites

- Bun (recommended) or Node.js 20+
- Cloudflare account (for deployment)

### Installation

```bash
bun install
```

### Development

Start the local development server:

```bash
bun dev
```

The app runs at `http://localhost:3000` (or the next available port). The Vite dev server proxies API requests to the Workers runtime.

Run type checking:

```bash
bun run cf-typegen
```

### Usage Examples

The included demo showcases the entity system:

- Navigate to the homepage to interact with the placeholder "Please Wait" experience.
- Use the seeded Users and Chats endpoints (`/api/users`, `/api/chats`) to explore the Durable Object-backed CRUD operations.
- Messages can be posted to chat boards via the `/api/chats/:chatId/messages` route.

Extend the app by editing `worker/user-routes.ts` for new API endpoints and `src/pages/HomePage.tsx` for the frontend UI.

## Deployment

Deploy to Cloudflare Workers with a single command:

```bash
bun run deploy
```

[cloudflarebutton]

This builds the Vite assets and deploys the Worker (including Durable Object migrations) defined in `wrangler.jsonc`.

For custom domain or additional configuration, update `wrangler.jsonc` and re-run the deploy command.