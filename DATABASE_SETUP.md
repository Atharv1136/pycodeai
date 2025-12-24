# PyCode AI - Database Integration

## 🚀 Database Setup Complete!

Your PyCode AI application is now fully connected to MySQL database with comprehensive user management, project storage, and analytics tracking.

## 📊 Database Schema

The following tables have been created in your `pythonapp` database:

### `users` Table
- **id**: Unique user identifier
- **email**: User email (unique)
- **name**: User display name
- **subscription**: 'free', 'pro', or 'team'
- **credits**: Current credit balance
- **credit_limit**: Maximum credits for subscription
- **code_runs**: Total code executions
- **ai_queries**: Total AI queries made
- **created_at**: Account creation timestamp
- **last_active**: Last activity timestamp
- **is_active**: Account status

### `projects` Table
- **id**: Unique project identifier
- **user_id**: Foreign key to users table
- **name**: Project name
- **description**: Project description
- **file_tree**: JSON structure of project files
- **created_at**: Project creation timestamp
- **updated_at**: Last modification timestamp

### `daily_stats` Table
- **id**: Auto-increment primary key
- **user_id**: Foreign key to users table
- **date**: Date of statistics
- **code_runs**: Code runs for that day
- **ai_queries**: AI queries for that day
- **created_at**: Record creation timestamp

### `admin_sessions` Table
- **id**: Auto-increment primary key
- **session_token**: Unique session token
- **expires_at**: Session expiration timestamp
- **created_at**: Session creation timestamp

## 🔑 Default Credentials

### Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `Atharv@1136`
- **Access**: Full admin panel with user management

### Demo User Account
- **Email**: `user@example.com`
- **Credits**: 100 (Free plan)
- **Access**: Standard user features

## 🛠️ API Endpoints

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user credits/subscription
- `DELETE /api/users` - Delete user

### Project Management
- `GET /api/projects?userId={id}` - Get user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects` - Update project
- `DELETE /api/projects?projectId={id}` - Delete project

### Statistics Tracking
- `GET /api/stats?userId={id}` - Get user stats
- `POST /api/stats` - Increment usage counters
- `PUT /api/stats` - Get admin statistics

### Admin Authentication
- `POST /api/admin/auth` - Admin login
- `GET /api/admin/auth?token={token}` - Verify session
- `DELETE /api/admin/auth?token={token}` - Admin logout

## 🔧 Database Configuration

The database connection is configured in `src/lib/database.ts`:

```typescript
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'pythonapp',
  port: 3306,
  // ... additional connection options
};
```

## 📈 Features Implemented

### ✅ User Management
- User registration and authentication
- Subscription management (Free/Pro/Team)
- Credit system with limits
- Usage tracking and analytics

### ✅ Project Management
- Project creation and storage
- File tree management
- Auto-save functionality
- Project sharing capabilities

### ✅ Admin Panel
- User management interface
- Credit assignment
- Subscription upgrades
- Real-time statistics
- Session management

### ✅ Analytics & Tracking
- Code run tracking
- AI query monitoring
- Daily usage statistics
- User activity monitoring

## 🚀 Getting Started

1. **Database Setup**: Already completed with `npm run setup-db`
2. **Start Development Server**: `npm run dev`
3. **Access Admin Panel**: Navigate to `/admin/login`
4. **Login**: Use admin credentials above
5. **Manage Users**: View and edit user accounts
6. **Monitor Usage**: Track real-time statistics

## 🔒 Security Features

- **Session Management**: Secure admin sessions with expiration
- **Credit Validation**: Server-side credit limit enforcement
- **SQL Injection Protection**: Parameterized queries
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Comprehensive error management

## 📊 Credit System

### Subscription Tiers
- **Free**: 100 credits
- **Pro**: 1,000 credits
- **Team**: 5,000 credits

### Usage Costs
- **Code Run**: 1 credit per execution
- **AI Query**: 1 credit per query

### Credit Management
- Real-time credit deduction
- Low credit warnings
- Upgrade prompts
- Admin credit assignment

## 🎯 Next Steps

Your PyCode AI application is now fully database-integrated! You can:

1. **Add more users** through the admin panel
2. **Monitor usage** with real-time statistics
3. **Manage subscriptions** and credit limits
4. **Track project activity** across all users
5. **Scale the application** with proper database architecture

The system is production-ready with proper error handling, security measures, and scalable architecture!
