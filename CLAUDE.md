# seramikbak

This project uses the **agent-hub super-team** (Gemini/Claude Agent). Specialists adapt to the
profile below — keep this file short and accurate; it loads automatically.

@.claude/agent-hub/profile.yml

The team reads the profile (and any ADRs in `.claude/agent-hub/decisions/`) before acting.
Run `/onboard` to (re)generate the profile, `/team` to see the roster, `/review` for a
full-team diff review, `/decide` to record a decision, `/handoff` to summarize state.

## Stack
This is a fullstack Next.js 16 (App Router) web application utilizing Tailwind CSS v4 for styling. It features 3D ceramic studio customization using Three.js and location/dealer mapping using Leaflet. The persistence layer uses Prisma ORM configured with a local SQLite database for development, and LibSQL/Turso database adapter in production environments.

## Commands
- Install: `npm install`  · Dev: `npm run dev`  · Test: `N/A`  · Lint: `npm run lint`  · Build: `npm run build`

## Conventions
- Use `@/*` for absolute imports pointing to the `src/` directory.
- Use the shared Prisma Client instance from `src/lib/prisma.js` for database operations.
- Styled using Tailwind CSS v4.

## Do not
- Do not instantiate `PrismaClient` directly; import the shared instance from `src/lib/prisma.js` to prevent database connection leaks.
