# Database Fix Guide

## Issue
Projects and files were disappearing after sign out/in cycle.

## Root Cause Analysis
The database structure is correct (MySQL JSON column for `file_tree`), but there were potential issues with:
1. JSON parsing/deserialization edge cases
2. Missing error handling for null/empty file_tree values
3. Insufficient validation of loaded data

## Solutions Implemented

### 1. Enhanced Error Handling
- Added comprehensive logging throughout save/load operations
- Better error messages with stack traces
- Graceful fallbacks when data is corrupted

### 2. Improved JSON Parsing
- Handle multiple MySQL JSON return formats (string, object, null)
- Validate fileTree structure after parsing
- Initialize empty arrays if children are missing

### 3. Size Validation
- Check file_tree size before saving (warn if > 16MB)
- Log file_tree sizes for debugging

### 4. Diagnostic Endpoint
- Added `/api/projects/diagnostic?userId=xxx` to inspect database contents
- Shows project count, file_tree sizes, and structure analysis

## How to Use Diagnostic Tool

1. Open browser console
2. Navigate to: `http://localhost:9002/api/projects/diagnostic?userId=YOUR_USER_ID`
3. Check the response for:
   - Total projects count
   - File tree sizes
   - Structure validation
   - Sample file/folder counts

## Testing the Fix

1. **Create a project** with files
2. **Add uploaded files** to the project
3. **Sign out** and **sign in again**
4. **Verify projects appear** in dashboard
5. **Open a project** and verify all files are present

## If Projects Still Disappear

### Check Database Directly
```sql
USE pythonapp;
SELECT id, name, user_id, LENGTH(file_tree) as size, updated_at 
FROM projects 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY updated_at DESC;
```

### Check Console Logs
Look for:
- `[saveProjectToDatabase]` messages
- `[loadUserProjects]` messages
- `[API]` messages from server

### Verify File Tree Structure
```sql
SELECT id, name, JSON_PRETTY(file_tree) as file_tree 
FROM projects 
WHERE id = 'PROJECT_ID' 
LIMIT 1;
```

## Alternative: Switch to LONGTEXT

If MySQL JSON column continues to have issues, you can switch to LONGTEXT:

```sql
ALTER TABLE projects MODIFY file_tree LONGTEXT;
```

This will:
- Remove JSON validation (store as plain text)
- Allow much larger data (>4GB)
- Require manual JSON.stringify/parse in code (already done)

**Note:** The current code already handles both JSON and string formats, so switching to LONGTEXT will work without code changes.

## MongoDB Alternative (Future Consideration)

If MySQL continues to have issues, consider MongoDB:
- Better native JSON support
- More flexible schema
- Easier to scale
- But requires migration effort

Current MySQL setup should work fine with the fixes implemented.

