import { runMigrations } from './migrate';

// Run migrations on import
runMigrations().catch(console.error);
