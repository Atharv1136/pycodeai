import { pool } from '../src/lib/database';
import bcrypt from 'bcryptjs';

async function migrateDatabase() {
  console.log('🔄 Migrating database schema...\n');
  
  try {
    const connection = await pool.getConnection();
    
    // Add password_hash column if it doesn't exist
    console.log('1. Adding password_hash column...');
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''
    `);
    
    // Add user_sessions table if it doesn't exist
    console.log('2. Creating user_sessions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Update existing users with default passwords
    console.log('3. Updating existing users with passwords...');
    
    // Hash passwords for existing users
    const adminPasswordHash = await bcrypt.hash('Atharv@1136', 12);
    const demoPasswordHash = await bcrypt.hash('demo123', 12);
    
    // Update admin user
    await connection.execute(`
      UPDATE users 
      SET password_hash = ? 
      WHERE email = 'admin@gmail.com'
    `, [adminPasswordHash]);
    
    // Update demo user
    await connection.execute(`
      UPDATE users 
      SET password_hash = ? 
      WHERE email = 'user@example.com'
    `, [demoPasswordHash]);
    
    // Update any other users with a default password
    await connection.execute(`
      UPDATE users 
      SET password_hash = ? 
      WHERE password_hash = ''
    `, [await bcrypt.hash('password123', 12)]);
    
    connection.release();
    
    console.log('✅ Database migration completed successfully!');
    console.log('\n🔑 Updated User Credentials:');
    console.log('   Admin: admin@gmail.com / Atharv@1136');
    console.log('   Demo: user@example.com / demo123');
    console.log('   Other users: [email] / password123');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

migrateDatabase().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
