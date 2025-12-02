const { DatabaseService } = require('../dist/database/database.service');

async function runSeeds() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();
  
  try {
    await dbService.runSeeds();
    console.log('✓ Seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dbService.onModuleDestroy();
  }
}

runSeeds();
