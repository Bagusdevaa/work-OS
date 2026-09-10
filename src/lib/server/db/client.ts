import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, {
	// Required by Supabase's transaction-mode pooler, and harmless anywhere else.
	prepare: false,
	// Each serverless instance keeps its own pool, so a large one here multiplies across
	// instances and exhausts the shared pooler. Three still lets a page's parallel queries run.
	max: 3,
	// Hand connections back to the pooler between invocations instead of holding them idle.
	idle_timeout: 20
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
