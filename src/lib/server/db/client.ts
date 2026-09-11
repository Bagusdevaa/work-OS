import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, {
	// Required by Supabase's transaction-mode pooler, and harmless anywhere else.
	prepare: false,
	/*
	 * Sized for Vercel's fluid compute: a few long-lived instances each serving concurrent
	 * requests, rather than one instance per request. A page fires up to five queries at once,
	 * so a pool of three made them queue.
	 */
	max: 10,
	/*
	 * Opening a pooled connection costs a TCP and TLS handshake — far more than the queries
	 * themselves, which Postgres answers in single-digit milliseconds. Holding connections
	 * through the gaps between navigations is the difference between a warm and a cold page.
	 */
	idle_timeout: 300,
	connect_timeout: 10
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
