import { DatabaseService } from '../src/database/database.service';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();
  
  try {
    // Check if admin already exists
    const existingAdmin = dbService.queryOne('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    dbService.exec(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'admin']
    );
    
    console.log('✓ Admin user created successfully');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    
    // Verify creation
    const admin = dbService.queryOne('SELECT * FROM users WHERE username = ?', ['admin']);
    console.log('  Verified:', admin ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await dbService.onModuleDestroy();
  }
}

createAdminUser();
