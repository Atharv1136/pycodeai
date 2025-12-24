import { testConnection, initializeDatabase } from '@/lib/database';

async function setupDatabase() {
  console.log('🚀 Setting up PyCode AI Database...\n');
  
  // Test connection
  console.log('1. Testing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('❌ Database connection failed. Please check your MySQL server and credentials.');
    process.exit(1);
  }
  
  // Initialize tables
  console.log('2. Initializing database tables...');
  const initialized = await initializeDatabase();
  
  if (!initialized) {
    console.error('❌ Database initialization failed.');
    process.exit(1);
  }
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📊 Database Schema:');
  console.log('   - users: User accounts and subscriptions');
  console.log('   - projects: User projects and file trees');
  console.log('   - daily_stats: Daily usage statistics');
  console.log('   - admin_sessions: Admin authentication sessions');
  console.log('\n🔑 Default Admin Credentials:');
  console.log('   Email: admin@gmail.com');
  console.log('   Password: Atharv@1136');
  console.log('\n👤 Default Demo User:');
  console.log('   Email: user@example.com');
  console.log('   Credits: 100 (Free plan)');
  
  process.exit(0);
}

setupDatabase().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
