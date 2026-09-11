import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, {
	// Required by Supabase's transaction-mode pooler, and harmless anywhere else.
	prepare: false,
	/*
	 * Deliberately small. DATABASE_URL points at Supabase's *session* pooler, which allots each
	 * project only a handful of client connections; asking for ten made the pooler refuse the
	 * extras, and the dashboard — which fires five queries at once — failed on the fifth.
	 * Raising this is only safe on the transaction pooler (port 6543).
	 */
	max: 3,
	// Queries now run beside the database, so rebuilding a connection is cheap enough to let go.
	idle_timeout: 20,
	connect_timeout: 10
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
