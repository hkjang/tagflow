const { DatabaseService } = require('../dist/database/database.service');

async function runMigrations() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();
  
  try {
    await dbService.runMigrations();
    console.log('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await dbService.onModuleDestroy();
  }
}

runMigrations();
