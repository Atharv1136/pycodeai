# PyCode AI - Application Workflow Documentation

This document explains the complete flow of how the application processes input, executes code, and displays output.

## 🏗️ Application Architecture

The app is built with:
- **Frontend**: Next.js (React) with TypeScript
- **State Management**: Zustand store
- **Code Execution**: Node.js child processes (spawn)
- **AI Integration**: Google Gemini (via Genkit)
- **Database**: MySQL for persistence
- **Code Editor**: Monaco Editor (VS Code editor)

---

## 📝 **1. CODE EDITING FLOW**

### User Input → Code Storage

**Path**: `CodeEditor.tsx` → `store.ts`

1. **User types in Monaco Editor**
   - File: `src/components/editor/CodeEditor.tsx`
   - Component: Monaco Editor (line 90-106)
   - On change, calls: `handleContentChange()` → `updateFileContent()`

2. **State Update in Store**
   - File: `src/lib/store.ts` (line 438-487)
   - Function: `updateFileContent(fileName, content)`
   - Actions:
     - Updates file content in `fileTree`
     - Updates `openFiles` array
     - Updates `activeFile`
     - **Auto-saves to database** via `saveProjectToDatabase()` helper

3. **Database Persistence**
   - Helper: `saveProjectToDatabase()` (line 364-386)
   - Makes PUT request to `/api/projects`
   - Updates `file_tree` JSON field in MySQL database
   - Also saves to localStorage as backup

**Result**: Code changes are immediately saved to the database and persist after refresh.

---

## 🚀 **2. CODE EXECUTION FLOW**

### Run Button → Python Execution → Output Display

**Path**: `OutputConsole.tsx` → `store.ts` → `run-python-code.ts` → `OutputConsole.tsx`

#### Step 1: User Clicks Run Button
- File: `src/components/editor/OutputConsole.tsx` (line 189)
- Button triggers: `runCode()` from store

#### Step 2: Prepare Code for Execution
- File: `src/lib/store.ts` (line 489-678)
- Function: `runCode()`
- Actions:
  1. Checks credit limit (line 497-500)
  2. Sets `isCodeRunning = true`
  3. Gets all project files from `fileTree`
  4. **Wraps code** to recreate all project files:
     - Creates wrapper Python code that writes all project files to disk
     - Ensures imported modules are available
  5. Prepares execution context

#### Step 3: Execute Python Code
- File: `src/ai/flows/run-python-code.ts` (line 27-222)
- Function: `runPythonCode(input)`
- Uses AI-defined tool: `pythonInterpreter`

**Execution Process**:
```
1. Detects if code uses graphical libraries (pygame, tkinter, turtle, matplotlib)
   ↓
2. Spawns Python child process (spawn from 'child_process')
   ↓
3. Sets up environment:
   - PYTHONUSERBASE for user-installed packages
   - Virtual display for graphical apps (SDL_VIDEODRIVER='dummy')
   - Agg backend for matplotlib
   ↓
4. Executes code via: python3 -u -c "user_code"
   ↓
5. Captures stdout and stderr streams
   ↓
6. Returns { output, error, workingDir }
```

**Key Code** (line 42-183):
```typescript
const python = spawn('python3', args, { env });
python.stdout.on('data', (data) => output += data.toString());
python.stderr.on('data', (data) => errorOutput += data.toString());
python.on('close', () => resolve({ output, error, workingDir }));
```

#### Step 4: Process Execution Results
- File: `src/lib/store.ts` (line 566-677)
- After execution:
  1. Receives `{ output, error }` from `runPythonCode()`
  2. **Detects newly created files** (if any):
     - Calls `/api/files/detect-new` endpoint
     - Scans project directory for new files
     - Adds them to `fileTree`
     - Saves to database
  3. Updates state:
     ```typescript
     state.output += result.output;
     if (result.error) {
       state.output += `\nError:\n${result.error}`;
     }
     ```
  4. Increments code run counter
  5. Sets `isCodeRunning = false`

#### Step 5: Display Output
- File: `src/components/editor/OutputConsole.tsx` (line 112-175)
- Component reads `output` from store
- Function: `renderOutput()`
- Processes output lines:
  - **Errors**: Highlighted in red
  - **Info messages**: Highlighted in blue
  - **Image references**: Special blue box display
  - **Success messages**: Green highlight
  - Auto-scrolls to bottom on new output

---

## 💬 **3. AI CHAT FLOW**

### User Message → AI Response → Code Update

**Path**: `ChatPanel.tsx` → `store.ts` → `ai-code-assistance.ts` → `ChatPanel.tsx`

#### Step 1: User Sends Message
- File: `src/components/ai/ChatPanel.tsx` (line 29-34)
- User types in textarea and submits
- Calls: `sendMessage(message, attachCode)`

#### Step 2: Process Message in Store
- File: `src/lib/store.ts` (line 682-1197)
- Function: `sendMessage(message, attachCode)`
- Actions:
  1. Checks credit limit
  2. Sets `isAiLoading = true`
  3. Gets current file content (if attachCode is true)
  4. Gets all project files for context
  5. Calls AI flow: `aiCodeAssistance(input)`

#### Step 3: AI Processing
- File: `src/ai/flows/ai-code-assistance.ts`
- Uses Google Gemini via Genkit
- Input includes:
  - User instruction
  - Current code
  - All project files
  - Quick actions context

**AI Flow**:
```
1. Sends prompt to Gemini AI
   ↓
2. AI analyzes code and request
   ↓
3. AI generates response with:
   - Explanation
   - Modified/New code
   - Suggestions
   ↓
4. Returns structured response
```

#### Step 4: Apply AI Response
- File: `src/lib/store.ts` (line 720-732)
- Detects if AI wants to create new file or modify existing
- Actions:
  - **New file**: Calls `addNewFile(name, code)`
  - **Existing file**: Calls `updateFileContent(name, code)`
- Adds AI response to `chatHistory`
- Sets `isAiLoading = false`

#### Step 5: Display in Chat
- File: `src/components/ai/ChatPanel.tsx` (line 86-102)
- Renders `chatHistory` array
- Shows user messages on right (blue)
- Shows AI responses on left (gray)
- Auto-scrolls to latest message

---

## 🖥️ **4. TERMINAL COMMAND FLOW**

### Terminal Input → Command Execution → Result Display

**Path**: `Terminal.tsx` → `/api/terminal` → `Terminal.tsx`

#### Step 1: User Types Command
- File: `src/components/editor/Terminal.tsx` (line 176-342)
- User enters command in input field
- Presses Enter → calls `executeCommand(command)`

#### Step 2: Validate and Send Request
- Function: `executeCommand(command)` (line 176)
- Validates command (help, install-all, clear, etc.)
- Makes POST request to `/api/terminal`:
  ```typescript
  fetch('/api/terminal', {
    method: 'POST',
    body: JSON.stringify({ command, projectId, userId })
  })
  ```

#### Step 3: Server-Side Execution
- File: `src/app/api/terminal/route.ts` (line 5-176)
- Function: `POST(request)`
- Actions:
  1. **Security Check**: Only allows safe commands
     - pip commands (install, uninstall, list, show, freeze)
     - python commands (--version, --help, -m)
     - Basic shell commands (ls, pwd, echo, etc.)
  
  2. **Execute Command**:
     ```typescript
     const child = spawn(actualCmd, actualArgs, { env });
     child.stdout.on('data', (data) => output += data.toString());
     child.stderr.on('data', (data) => errorOutput += data.toString());
     child.on('close', (code) => resolve({ output, error, success }));
     ```
  
  3. **Track Packages** (if pip install):
     - Saves to `installed_packages` table in database
  
  4. Returns `{ output, error, success }`

#### Step 4: Display Result
- File: `src/components/editor/Terminal.tsx` (line 303-321)
- Updates terminal history:
  ```typescript
  setHistory(prev => {
    const newHistory = [...prev];
    const lastEntry = newHistory[newHistory.length - 1];
    lastEntry.output = data.output || data.error;
    lastEntry.success = data.success;
    return newHistory;
  });
  ```
- Renders in terminal UI (green for success, red for errors)
- Auto-scrolls to bottom

---

## 📊 **5. DATA FLOW SUMMARY**

### Complete Input → Output Cycle

```
┌─────────────────────────────────────────────────────────┐
│                    USER INPUT                            │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        │                                │
  Code Editor                    Terminal/AI Chat
        │                                │
        ↓                                ↓
┌───────────────┐            ┌──────────────────┐
│ Update State  │            │  Send Request    │
│  (Zustand)    │            │  to API/Server   │
└───────────────┘            └──────────────────┘
        │                                │
        ↓                                ↓
┌───────────────┐            ┌──────────────────┐
│ Save to DB    │            │ Execute Code/     │
│ (MySQL)       │            │ Process AI       │
└───────────────┘            └──────────────────┘
        │                                │
        └───────────────┬────────────────┘
                        ↓
              ┌──────────────────┐
              │  Process Result  │
              │  (Python spawn /  │
              │   AI Response)    │
              └──────────────────┘
                        ↓
              ┌──────────────────┐
              │  Update State    │
              │  (output, error) │
              └──────────────────┘
                        ↓
              ┌──────────────────┐
              │  Display Output  │
              │  (OutputConsole / │
              │   Terminal / Chat)│
              └──────────────────┘
```

---

## 🔑 **KEY COMPONENTS**

### State Management (`store.ts`)
- **State**: `EditorState` - contains all app data
  - `fileTree`: Project file structure
  - `openFiles`: Currently open files
  - `activeFile`: Currently active file
  - `output`: Execution output
  - `chatHistory`: AI conversation history
  - `projects`: All user projects
  - `currentProject`: Currently active project

- **Actions**: `EditorActions` - all user operations
  - `updateFileContent()`: Save code changes
  - `runCode()`: Execute Python code
  - `sendMessage()`: Send AI message
  - `addNewFile()`: Create new file
  - `deleteFile()`: Delete file
  - `loadProject()`: Load project from database

### Code Execution (`run-python-code.ts`)
- Uses Node.js `spawn()` to execute Python
- Handles both text and graphical code
- Captures stdout/stderr streams
- Returns formatted output/error

### API Routes
- `/api/projects` - Project CRUD operations
- `/api/terminal` - Terminal command execution
- `/api/files/*` - File operations
- `/api/upload` - File uploads

### Database
- **projects** table: Stores project file trees as JSON
- **files** table: Stores uploaded file metadata
- **installed_packages** table: Tracks Python packages

---

## 🎯 **OUTPUT DISPLAY METHODS**

### 1. Code Execution Output
- Component: `OutputConsole.tsx`
- Source: `store.output` (updated by `runCode()`)
- Features:
  - Syntax highlighting (errors in red, info in blue)
  - Auto-scroll
  - Download option
  - Image detection

### 2. Terminal Output
- Component: `Terminal.tsx`
- Source: Terminal history state
- Features:
  - Command history
  - Color-coded success/error
  - Scrollable history
  - Command autocomplete

### 3. AI Chat Output
- Component: `ChatPanel.tsx`
- Source: `store.chatHistory`
- Features:
  - Conversation history
  - Code suggestions
  - Quick actions
  - File context display

---

## 🔄 **PERSISTENCE FLOW**

### Save Flow (Every Action)
```
User Action (edit/create/delete file)
    ↓
Update Zustand State
    ↓
saveProjectToDatabase() helper
    ↓
PUT /api/projects
    ↓
Update MySQL database (file_tree JSON)
    ↓
Also save to localStorage (backup)
```

### Load Flow (On Page Load)
```
Page Load
    ↓
loadUserProjects() - Fetch all projects
    ↓
loadProject(projectId) - Fetch specific project
    ↓
GET /api/projects?projectId=xxx
    ↓
Parse file_tree JSON from database
    ↓
Merge with uploaded files
    ↓
Update Zustand State
    ↓
Render in UI
```

---

## 📌 **IMPORTANT NOTES**

1. **All file operations are auto-saved** to the database immediately
2. **Code execution is asynchronous** - doesn't block UI
3. **Output streams are captured** in real-time
4. **Graphical code** (pygame, turtle) runs in headless mode
5. **Terminal commands** are sandboxed for security
6. **AI responses** are streamed and displayed incrementally

---

## 🛠️ **DEBUGGING TIPS**

1. **Check browser console** for client-side errors
2. **Check server logs** for API errors
3. **Database**: Verify `file_tree` JSON field contains updated data
4. **Execution**: Check Python process spawn logs
5. **State**: Use React DevTools to inspect Zustand store

---

This architecture ensures:
- ✅ Real-time code editing with auto-save
- ✅ Secure code execution
- ✅ Persistent data storage
- ✅ Fast UI responsiveness
- ✅ Complete project context for AI

