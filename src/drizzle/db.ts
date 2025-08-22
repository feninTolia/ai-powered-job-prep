import { env } from '@/data/env/server';
import * as schema from '@/drizzle/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

console.log('Database URL in db -----', env.DATABASE_URL);

export const db = drizzle(env.DATABASE_URL, { schema });
