import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';
import { existsSync } from 'fs';
import { join } from 'path';

export async function runMigrations() {
  try {
    // Check if migrations folder exists
    const migrationsFolder = join(process.cwd(), 'drizzle');
    if (!existsSync(migrationsFolder)) {
      console.log('No migrations folder found, skipping migrations');
      return;
    }

    // Check if journal file exists
    const journalPath = join(migrationsFolder, 'meta', '_journal.json');
    if (!existsSync(journalPath)) {
      console.log('No migration journal found, skipping migrations');
      return;
    }

    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    // Don't throw error to prevent app from crashing
    console.log('Continuing without migrations...');
  }
}
