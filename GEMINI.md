# Agent Instructions

This project uses Supabase as its backend database and API.
Agents must follow the rules below when interacting with Supabase, environment variables, and database structure.

## Tech Stack
- Next.js (React)
- TypeScript
- Supabase (Postgres)
- Deployment target: Vercel

## Environment Variables (.env)

Environment variables are defined in the `.env` file and are NOT included in prompts.

Supabase configuration is provided via:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Rules:
- NEVER hardcode environment variable values
- ALWAYS reference them via `process.env`
- ASSUME these variables are correctly configured for both local development and Vercel
- DO NOT log, print, or expose secret values
- DO NOT ask for or require the actual values

Example usage: process.env.NEXT_PUBLIC_SUPABASE_URL

## Database Schema Reference



The canonical database schema is defined in `db/schema.sql`

Rules:
- Reference the schema by file path when database structure is needed
- Use table and column names exactly as defined in schema.sql
- Do not inline or paste the full SQL schema into responses
- Do not restate large portions of the schema from memory