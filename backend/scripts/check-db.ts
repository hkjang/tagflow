import { DatabaseService } from '../src/database/database.service';

async function checkDatabase() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();
  
  try {
    // Query all users
    const users = dbService.query('SELECT * FROM users');
    console.log('All users:', JSON.stringify(users, null, 2));
    
    // Query admin user specifically
    const admin = dbService.queryOne('SELECT * FROM users WHERE username = ?', ['admin']);
    console.log('Admin user:', JSON.stringify(admin, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dbService.onModuleDestroy();
  }
}

checkDatabase();
