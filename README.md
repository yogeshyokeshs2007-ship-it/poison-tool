# TrustFlow Agent Dashboard

## Database and backend

The Express API serves the dashboard locally and is exposed through a catch-all Vercel Function in production. Request history, verification records, and system logs are stored in PostgreSQL. The first API request creates the required tables and imports the demo records into empty tables; later requests persist across restarts and deployments. The SQL schema is also available in [database/schema.sql](database/schema.sql).

### Local setup

1. Create a PostgreSQL database with a provider such as Neon or Supabase.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to that database's connection string. Use a pooled connection string for serverless deployments and include `sslmode=require` when required by the provider.
3. Run `npm install`, then `npm run dev`.

Without `DATABASE_URL`, local development uses a clearly labeled in-memory store; its writes do not survive a server restart. Production requests that require persistence return HTTP 503 until the database is configured.

### Vercel setup

1. Add `DATABASE_URL` under **Project Settings [0m>[0m Environment Variables** in Vercel. Keep the credential server-side; it is never exposed to the browser.
2. Select the environments to configure (Production and Preview as needed), save, and redeploy.
3. Check `https://<your-deployment>/api/health`; the `database` field should be `CONNECTED`.

Tables are created automatically by the API using the configured database user. The user must have permission to create tables and indexes, or an administrator can apply [database/schema.sql](database/schema.sql) in advance.
