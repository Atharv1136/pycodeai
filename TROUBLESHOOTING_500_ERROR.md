# Troubleshooting 500 Error When Loading Projects

## What We Fixed

1. **Enhanced Error Handling** - Now captures and logs all error details
2. **Better Error Messages** - API responses now include detailed error information
3. **Connection Validation** - Added explicit database connection error handling

## Next Steps to Debug

### 1. Check Server Terminal Logs

Look at the terminal where `npm run dev` is running. You should now see detailed error messages like:
- `[API] Failed to get database connection: ...`
- `[API] Database error details: ...`
- `[API] Error message: ...`
- `[API] Error code: ...`

### 2. Common Issues and Solutions

#### Issue: Database Connection Failed
**Symptoms:**
- Error: `ECONNREFUSED` or `ETIMEDOUT`
- Error code: `ECONNREFUSED` or similar

**Solutions:**
1. Check if MySQL is running:
   ```bash
   # Windows
   net start MySQL80
   # Or check Services app
   ```

2. Verify database credentials in `src/lib/database.ts`:
   ```typescript
   host: '127.0.0.1',
   user: 'root',
   password: 'root',  // Check this matches your MySQL password
   database: 'pythonapp',
   port: 3306
   ```

3. Test connection manually:
   ```sql
   mysql -u root -p -h 127.0.0.1 -P 3306 pythonapp
   ```

#### Issue: Projects Table Doesn't Exist
**Symptoms:**
- Error message mentions "Projects table not found"

**Solution:**
Run database initialization:
```bash
# Check if there's a setup script, or create one
npm run db:init
# Or manually run the SQL from src/lib/database.ts
```

#### Issue: Invalid User ID
**Symptoms:**
- Error in query execution
- User ID is null or invalid

**Check:**
- Open browser console
- Look for: `[loadUserProjects] Loading projects for user: XXX`
- Verify the user ID is correct

### 3. Test Database Connection

Create a test endpoint or use the diagnostic endpoint:

```bash
# Test diagnostic endpoint
curl http://localhost:9002/api/projects/diagnostic?userId=YOUR_USER_ID
```

### 4. Check Browser Console

Now the error should show more details. Look for:
```javascript
[loadUserProjects] Failed to load projects: 500
[loadUserProjects] Error data: { error: "...", details: "..." }
[loadUserProjects] Error: [actual error message]
```

### 5. Verify Database Schema

Connect to MySQL and check:
```sql
USE pythonapp;
SHOW TABLES;
DESCRIBE projects;
SELECT COUNT(*) FROM projects;
```

## Quick Fixes to Try

### 1. Restart the Development Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 2. Verify MySQL is Running
- Windows: Check Services
- Look for "MySQL" service
- Start it if stopped

### 3. Check Database Credentials
- Open `src/lib/database.ts`
- Verify `host`, `user`, `password`, `database` match your MySQL setup

### 4. Reinitialize Database
If table structure is wrong, you might need to:
```sql
DROP TABLE IF EXISTS projects;
-- Then restart the app to recreate it
```

## What to Look For in Logs

After the fix, you should see one of these error patterns:

### Pattern 1: Connection Error
```
[API] Failed to get database connection: Error: connect ECONNREFUSED
[API] Connection error details: { message: "...", code: "ECONNREFUSED" }
```

### Pattern 2: Table Missing
```
[API] Projects table does not exist!
```

### Pattern 3: SQL Error
```
[API] Database error details:
[API] Error message: ...
[API] Error code: ...
[API] Error sqlState: ...
```

### Pattern 4: Query Error
```
[API] Database query result: ...
```

## Expected Behavior After Fix

1. **If there's an error**, you'll see detailed error messages in:
   - Server terminal (detailed logs)
   - Browser console (user-friendly messages)

2. **If connection works**, you'll see:
   ```
   [API] Database connection successful
   [API] Projects table exists, querying...
   [API] Database query result: X projects found
   ```

## Still Getting Empty {} Error?

If you still see `{}` in the error response, it means:
1. The error is happening outside our catch blocks (unlikely now)
2. There's a middleware issue
3. The response is being modified somewhere

Check:
- Server terminal for the actual error
- Network tab in browser DevTools → Response tab
- Any middleware that might intercept responses

