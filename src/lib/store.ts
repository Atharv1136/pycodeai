import { create } from 'zustand';
import { produce } from 'immer';
import { aiCodeAssistance, AiCodeAssistanceInput } from '@/ai/flows/ai-code-assistance';
import { decideCodeAssistanceActions } from '@/ai/flows/decide-code-assistance-actions';
import { runPythonCode } from '@/ai/flows/run-python-code';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type File = {
  name: string;
  type: 'file';
  content: string;
  uploadPath?: string; // Optional path for uploaded files
};

type Folder = {
  name: string;
  type: 'folder';
  children: FileOrFolder[];
};

export type FileOrFolder = File | Folder;

type ChatMessage = {
  role: 'user' | 'assistant';
  message: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  fileTree: Folder;
};

type User = {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro' | 'team';
  credits: number;
  creditLimit: number;
  codeRuns: number;
  aiQueries: number;
  createdAt: Date;
  lastActive: Date;
  isActive: boolean;
  profileComplete?: boolean;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  avatarUrl?: string;
};

type AdminStats = {
  totalUsers: number;
  totalProjects: number;
  totalCodeRuns: number;
  totalAiQueries: number;
  activeUsers: number;
  premiumUsers: number;
};

type EditorState = {
  currentProject: Project | null;
  fileTree: Folder;
  openFiles: File[];
  activeFile: File | null;
  output: string;
  chatHistory: ChatMessage[];
  isAiLoading: boolean;
  isCodeRunning: boolean;
  quickActions: string[];
  codeContext: string;
  projects: Project[];
  currentUser: User | null;
  users: User[];
  adminStats: AdminStats;
  isAdmin: boolean;
  dailyCodeRuns: number;
  dailyAiQueries: number;
};

type EditorActions = {
  openFile: (file: File) => void;
  closeFile: (fileName: string) => void;
  setActiveFile: (fileName: string) => void;
  updateFileContent: (fileName: string, content: string) => void;
  runCode: () => void;
  clearOutput: () => void;
  sendMessage: (message: string, attachCode: boolean) => Promise<void>;
  runQuickAction: (action: string) => void;
  fetchQuickActions: () => void;
  addNewFile: (name: string, content?: string) => void;
  addNewFileFromUpload: (name: string, path: string, content: string) => void;
  addNewFolder: (name: string) => void;
  deleteFile: (path: string[]) => void;
  downloadProjectAsZip: () => void;
  createProject: (name: string, description?: string) => void;
  loadUserProjects: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  saveProject: () => void;
  // User functions
  registerUser: (name: string, email: string, password: string, subscription?: 'free' | 'pro' | 'team') => Promise<{ success: boolean, user?: User, error?: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean, user?: User, error?: string }>;
  logoutUser: () => void;
  // Admin functions
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  getAllUsers: () => User[];
  updateUserCredits: (userId: string, credits: number) => void;
  updateUserSubscription: (userId: string, subscription: 'free' | 'pro' | 'team') => void;
  getUserStats: () => AdminStats;
  incrementCodeRun: () => void;
  incrementAiQuery: () => void;
  checkCreditLimit: () => boolean;
  updateCurrentUser: (updates: Partial<User>) => void;
};

const defaultCode = `print("Hello from main.py!")
`;

const initialFile: File = { name: 'main.py', type: 'file', content: defaultCode };

const initialFileTree: Folder = {
  name: 'My Python Project',
  type: 'folder',
  children: [initialFile],
};

const findFileByPath = (tree: Folder, path: string[]): File | undefined => {
  let current: FileOrFolder | undefined = tree;
  for (const name of path) {
    if (current?.type === 'folder') {
      current = current.children.find(child => child.name === name);
    } else {
      return undefined;
    }
  }
  return current?.type === 'file' ? current : undefined;
};

// Fallback function for AI assistant when the main AI service fails
const getFallbackResponse = (message: string, currentCode: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('snake game') || lowerMessage.includes('make a snake game')) {
    const snakeGameCode = `import turtle
import time
import random

# Set up the screen
wn = turtle.Screen()
wn.title("Snake Game")
wn.bgcolor("black")
wn.setup(width=600, height=600)
wn.tracer(0)

# Snake head
head = turtle.Turtle()
head.speed(0)
head.shape("square")
head.color("white")
head.penup()
head.goto(0, 0)
head.direction = "stop"

# Snake food
food = turtle.Turtle()
food.speed(0)
food.shape("circle")
food.color("red")
food.penup()
food.goto(0, 100)

segments = []

# Score
pen = turtle.Turtle()
pen.speed(0)
pen.shape("square")
pen.color("white")
pen.penup()
pen.hideturtle()
pen.goto(0, 260)
pen.write("Score: 0", align="center", font=("Courier", 24, "normal"))

# Functions
def go_up():
    if head.direction != "down":
        head.direction = "up"

def go_down():
    if head.direction != "up":
        head.direction = "down"

def go_left():
    if head.direction != "right":
        head.direction = "left"

def go_right():
    if head.direction != "left":
        head.direction = "right"

def move():
    if head.direction == "up":
        y = head.ycor()
        head.sety(y + 20)

    if head.direction == "down":
        y = head.ycor()
        head.sety(y - 20)

    if head.direction == "left":
        x = head.xcor()
        head.setx(x - 20)

    if head.direction == "right":
        x = head.xcor()
        head.setx(x + 20)

# Keyboard bindings
wn.listen()
wn.onkeypress(go_up, "w")
wn.onkeypress(go_down, "s")
wn.onkeypress(go_left, "a")
wn.onkeypress(go_right, "d")

# Main game loop
while True:
    wn.update()

    # Check for collision with the border
    if head.xcor() > 290 or head.xcor() < -290 or head.ycor() > 290 or head.ycor() < -290:
        time.sleep(1)
        head.goto(0, 0)
        head.direction = "stop"

        # Hide the segments
        for segment in segments:
            segment.goto(1000, 1000)

        # Clear the segments list
        segments.clear()

        # Reset the score
        score = 0
        pen.clear()
        pen.write("Score: {}".format(score), align="center", font=("Courier", 24, "normal"))

    # Check for collision with the food
    if head.distance(food) < 20:
        # Move the food to a random spot
        x = random.randint(-290, 290)
        y = random.randint(-290, 290)
        food.goto(x, y)

        # Add a segment
        new_segment = turtle.Turtle()
        new_segment.speed(0)
        new_segment.shape("square")
        new_segment.color("grey")
        new_segment.penup()
        segments.append(new_segment)

        # Increase the score
        score += 10
        pen.clear()
        pen.write("Score: {}".format(score), align="center", font=("Courier", 24, "normal"))

    # Move the end segments first in reverse order
    for index in range(len(segments) - 1, 0, -1):
        x = segments[index - 1].xcor()
        y = segments[index - 1].ycor()
        segments[index].goto(x, y)

    # Move segment 0 to where the head is
    if len(segments) > 0:
        x = head.xcor()
        y = head.ycor()
        segments[0].goto(x, y)

    move()

    # Check for head collision with the body segments
    for segment in segments:
        if segment.distance(head) < 20:
            time.sleep(1)
            head.goto(0, 0)
            head.direction = "stop"

            # Hide the segments
            for segment in segments:
                segment.goto(1000, 1000)

            # Clear the segments list
            segments.clear()

            # Reset the score
            score = 0
            pen.clear()
            pen.write("Score: {}".format(score), align="center", font=("Courier", 24, "normal"))

    time.sleep(0.1)

wn.mainloop()`;

    return `I've created a complete Snake game for you! This game includes:

🐍 **Features:**
- Snake movement with WASD keys
- Food collection and score tracking
- Collision detection with walls and body
- Growing snake body
- Game reset functionality

🎮 **Controls:**
- W: Move up
- S: Move down  
- A: Move left
- D: Move right

The game uses the turtle graphics library and will run in our enhanced execution environment. Click the run button to start playing!`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your AI coding assistant. I can help you write, debug, and explain Python code. What would you like to work on today?";
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `I can help you with:

🔧 **Code Generation**: Create new Python programs, games, and applications
🐛 **Debugging**: Find and fix errors in your code
📚 **Explanations**: Explain how code works and teach concepts
⚡ **Optimization**: Improve code performance and efficiency
🎮 **Games**: Build interactive games like Snake, Pong, or Tetris
📊 **Data Analysis**: Create visualizations and data processing scripts
🌐 **Web Development**: Build APIs, web scrapers, and automation tools

Just ask me what you'd like to build or learn about!`;
  }

  if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('fix')) {
    return "I'd be happy to help you fix any errors! Please share your code and describe the issue you're experiencing. I can analyze the problem and provide a solution.";
  }

  return "I'm here to help with your Python coding needs! I can write code, explain concepts, debug issues, and create games or applications. What would you like to work on?";
};


// Initialize default user
const defaultUser: User = {
  id: 'user_1',
  email: 'user@example.com',
  name: 'Demo User',
  subscription: 'free',
  credits: 100,
  creditLimit: 100,
  codeRuns: 0,
  aiQueries: 0,
  createdAt: new Date(),
  lastActive: new Date(),
  isActive: true,
  profileComplete: false,
};

// Helper function to save project to database
const saveProjectToDatabase = async (projectId: string, name: string, description: string | undefined, fileTree: Folder) => {
  try {
    // Validate fileTree structure before saving
    if (!fileTree || !fileTree.name) {
      console.error('[saveProjectToDatabase] Invalid fileTree structure:', fileTree);
      return false;
    }

    // Serialize fileTree to check size
    const fileTreeJson = JSON.stringify(fileTree);
    const fileTreeSize = new Blob([fileTreeJson]).size;

    console.log(`[saveProjectToDatabase] Saving project ${projectId}, fileTree size: ${(fileTreeSize / 1024).toFixed(2)} KB`);

    if (fileTreeSize > 16 * 1024 * 1024) { // 16MB limit for MySQL JSON
      console.warn('[saveProjectToDatabase] Warning: fileTree size exceeds 16MB, may cause issues');
    }

    const response = await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name,
        description: description || '',
        fileTree
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[saveProjectToDatabase] Failed to save project:', response.status, response.statusText, errorText);
      return false;
    }

    console.log(`[saveProjectToDatabase] Successfully saved project ${projectId}`);
    return true;
  } catch (error: any) {
    console.error('[saveProjectToDatabase] Error saving project to database:', error);
    console.error('[saveProjectToDatabase] Error stack:', error?.stack);
    return false;
  }
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  currentProject: null,
  fileTree: initialFileTree,
  openFiles: [initialFile],
  activeFile: initialFile,
  output: ``,
  chatHistory: [],
  isAiLoading: false,
  isCodeRunning: false,
  quickActions: [],
  codeContext: '',
  projects: [],
  currentUser: null,
  users: [],
  adminStats: {
    totalUsers: 1,
    totalProjects: 0,
    totalCodeRuns: 0,
    totalAiQueries: 0,
    activeUsers: 1,
    premiumUsers: 0,
  },
  isAdmin: false,
  dailyCodeRuns: 0,
  dailyAiQueries: 0,

  openFile: (file) => set(produce((state: EditorState) => {
    if (!state.openFiles.find(f => f.name === file.name)) {
      state.openFiles.push(file);
    }
    state.activeFile = file;
  })),

  closeFile: (fileName) => set(produce((state: EditorState) => {
    const fileIndex = state.openFiles.findIndex(f => f.name === fileName);
    if (fileIndex !== -1) {
      state.openFiles.splice(fileIndex, 1);
      if (state.activeFile?.name === fileName) {
        state.activeFile = state.openFiles[Math.max(0, fileIndex - 1)] || state.openFiles[0] || null;
      }
    }
  })),

  setActiveFile: (fileName) => set(produce((state: EditorState) => {
    const file = get().openFiles.find(f => f.name === fileName);
    if (file) {
      state.activeFile = file;
    }
  })),

  updateFileContent: (fileName, content) => set(produce((state: EditorState) => {
    const findAndUpdate = (items: FileOrFolder[]) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === 'file' && item.name === fileName) {
          item.content = content;
          return true;
        }
        if (item.type === 'folder') {
          if (findAndUpdate(item.children)) return true;
        }
      }
      return false;
    };
    findAndUpdate(state.fileTree.children);

    const openFile = state.openFiles.find(f => f.name === fileName);
    if (openFile) {
      openFile.content = content;
    }
    if (state.activeFile?.name === fileName) {
      state.activeFile.content = content;
    }

    // Auto-save project to database
    if (state.currentProject) {
      // Update current project's fileTree
      state.currentProject.fileTree = state.fileTree;
      state.currentProject.updatedAt = new Date();

      // Update in projects array
      const projectIndex = state.projects.findIndex(p => p.id === state.currentProject!.id);
      if (projectIndex !== -1) {
        state.projects[projectIndex] = { ...state.currentProject! };
      }

      // Save to localStorage (for quick access)
      localStorage.setItem('pycode-projects', JSON.stringify(state.projects));

      // Save to database (async, don't block UI)
      saveProjectToDatabase(
        state.currentProject.id,
        state.currentProject.name,
        state.currentProject.description,
        state.fileTree
      ).catch(error => {
        console.error('Error auto-saving project to database:', error);
      });
    }
  })),

  updateCurrentUser: (updates) => set(produce((state: EditorState) => {
    if (state.currentUser) {
      state.currentUser = { ...state.currentUser, ...updates };
    }
  })),

  runCode: async () => {
    const { activeFile, checkCreditLimit, incrementCodeRun, fileTree } = get();
    if (!activeFile) {
      set({ output: `[${new Date().toLocaleTimeString()}] No active file to run.` });
      return;
    }

    // Check credit limit
    if (checkCreditLimit()) {
      set({ output: `[${new Date().toLocaleTimeString()}] Credit limit reached! Please upgrade to premium to continue running code.` });
      return;
    }

    set({ isCodeRunning: true, output: `[${new Date().toLocaleTimeString()}] Running ${activeFile.name}...\n\n` });

    try {
      // Get all files in the project to include in execution context
      const getAllFiles = (items: FileOrFolder[]): File[] => {
        const files: File[] = [];
        for (const item of items) {
          if (item.type === 'file') {
            files.push(item as File);
          } else if (item.type === 'folder' && item.children) {
            files.push(...getAllFiles(item.children));
          }
        }
        return files;
      };

      const projectFiles = getAllFiles(fileTree.children);

      // Create a wrapper that includes all project files
      let wrappedCode = activeFile.content;

      // Add file creation code for all project files (including uploaded files)
      if (projectFiles.length > 0) {
        const fileCreationCode = projectFiles
          .filter(file => file.name !== activeFile.name) // Don't recreate the current file
          .map(file => {
            // Handle uploaded files - use their content from the file tree
            let fileContent = file.content;

            // If file has uploadPath but content is available, use the content
            // Otherwise, if it's an uploaded file without content, try to read it
            if (file.uploadPath && !fileContent) {
              // For uploaded files without content in memory, we'll need to fetch it
              // But since we're in execution context, we'll use the content from fileTree
              fileContent = file.content || '';
            }

            // Escape content properly for Python string
            const escapedContent = fileContent
              .replace(/\\/g, '\\\\')  // Escape backslashes first
              .replace(/"/g, '\\"')     // Escape double quotes
              .replace(/\$/g, '\\$')     // Escape dollar signs (for f-strings)
              .replace(/\n/g, '\\n')     // Escape newlines
              .replace(/\r/g, '\\r')     // Escape carriage returns
              .replace(/\t/g, '\\t');    // Escape tabs

            // Use triple quotes to handle multiline content better
            return `# Create ${file.name} file
import os
if not os.path.exists('${file.name}'):
    with open('${file.name}', 'w', encoding='utf-8') as f:
        f.write("""${escapedContent}""")
`;
          })
          .join('\n');

        if (fileCreationCode) {
          wrappedCode = `${fileCreationCode}\n\n# Original code:\n${activeFile.content}`;
        }
      }

      // Execute code in project directory so created files are saved there
      const { currentProject } = get();

      const result = await runPythonCode({
        code: wrappedCode,
        projectId: currentProject?.id // Pass projectId, server will handle path
      });

      // After code execution, detect and add newly created files
      if (currentProject && get().currentUser && result.output && !result.error) {
        try {
          // Get list of existing files from fileTree
          const getAllFileNames = (items: FileOrFolder[]): string[] => {
            const names: string[] = [];
            items.forEach(item => {
              if (item.type === 'file') {
                names.push(item.name);
              } else if (item.type === 'folder') {
                names.push(...getAllFileNames(item.children));
              }
            });
            return names;
          };
          const existingFiles = getAllFileNames(fileTree.children);

          // Call API to detect new files
          const filesResponse = await fetch('/api/files/detect-new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: currentProject.id,
              userId: get().currentUser!.id,
              existingFiles
            })
          });

          if (filesResponse.ok) {
            const filesData = await filesResponse.json();
            const newFiles = filesData.newFiles || [];

            if (newFiles.length > 0) {
              // Add new files to fileTree
              set(produce((state: EditorState) => {
                newFiles.forEach((file: any) => {
                  // Check if file already exists
                  const fileExists = (items: FileOrFolder[]): boolean => {
                    return items.some(item => {
                      if (item.type === 'file' && item.name === file.name) {
                        return true;
                      }
                      if (item.type === 'folder') {
                        return fileExists(item.children);
                      }
                      return false;
                    });
                  };

                  if (!fileExists(state.fileTree.children)) {
                    // Add new file to fileTree
                    state.fileTree.children.push({
                      name: file.name,
                      type: 'file',
                      content: file.content || '',
                      uploadPath: file.path
                    });

                    // Update current project's fileTree
                    if (state.currentProject) {
                      state.currentProject.fileTree = state.fileTree;

                      // Save to database
                      fetch('/api/projects', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          projectId: state.currentProject.id,
                          name: state.currentProject.name,
                          description: state.currentProject.description,
                          fileTree: state.fileTree
                        })
                      }).catch(error => {
                        console.error('Error saving new files to project:', error);
                      });
                    }
                  }
                });

                // Add message about new files to output
                const filesList = newFiles.map((f: any) => f.name).join(', ');
                result.output += `\n[INFO] New files created: ${filesList}`;
              }));
            }
          }
        } catch (error) {
          console.error('Error detecting new files:', error);
        }
      }

      set(produce((state: EditorState) => {
        state.output += result.output;
        if (result.error) {
          state.output += `\nError:\n${result.error}`;
        }
      }));

      // Increment code run counter
      incrementCodeRun();
    } catch (error) {
      console.error("Code execution error:", error);
      set(produce((state: EditorState) => {
        state.output += "An unexpected error occurred during execution.";
      }));
    } finally {
      set({ isCodeRunning: false });
    }
  },

  clearOutput: () => set({ output: '' }),

  sendMessage: async (message, attachCode, provider?: 'gemini' | 'openai') => {
    if (!message.trim()) return;

    const { checkCreditLimit, incrementAiQuery } = get();

    // Check credit limit
    if (checkCreditLimit()) {
      set(produce((state: EditorState) => {
        state.chatHistory.push({ role: 'user', message });
        state.chatHistory.push({ role: 'assistant', message: 'Credit limit reached! Please upgrade to premium to continue using AI assistance.' });
      }));
      return;
    }

    set(produce((state: EditorState) => {
      state.chatHistory.push({ role: 'user', message });
      state.isAiLoading = true;
    }));

    try {
      const { activeFile, updateFileContent, addNewFile } = get();

      const instruction = message.toLowerCase();
      const isCreatingFile = instruction.includes('create a file') || instruction.includes('make a file');

      // Get all files in the project for context
      const getAllFiles = (items: FileOrFolder[]): File[] => {
        const files: File[] = [];
        for (const item of items) {
          if (item.type === 'file') {
            files.push(item as File);
          } else if (item.type === 'folder' && item.children) {
            files.push(...getAllFiles(item.children));
          }
        }
        return files;
      };

      const projectFiles = getAllFiles(get().fileTree.children);
      const uploadedFiles = projectFiles.map(file => ({
        name: file.name,
        content: file.content,
        type: file.name.split('.').pop() || 'text'
      }));

      const input: AiCodeAssistanceInput = {
        instruction: message,
        code: (attachCode && activeFile) ? activeFile.content : (isCreatingFile ? '' : 'No code attached.'),
        quickActions: get().quickActions,
        uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        provider: (provider as 'gemini' | 'openai') || 'gemini',
      };

      const result = await aiCodeAssistance(input);
      const { response, code: newCode, fileName: newFileName } = result;

      console.log('[AI Response]', {
        hasCode: !!newCode,
        hasFileName: !!newFileName,
        codeLength: newCode?.length,
        fileName: newFileName
      });

      set(produce((state: EditorState) => {
        state.chatHistory.push({ role: 'assistant', message: response });
      }));

      if (newCode !== undefined && newCode !== null) {
        if (newFileName) {
          // Check if file already exists in openFiles
          const existingFile = get().openFiles.find((f: File) => f.name === newFileName);

          if (existingFile) {
            // File exists - update it
            console.log('[AI] Updating existing file:', newFileName);
            updateFileContent(newFileName, newCode);
          } else {
            // File doesn't exist - create it
            console.log('[AI] Creating new file:', newFileName);
            addNewFile(newFileName, newCode);
          }
        } else if (activeFile) {
          // AI is updating the currently active file
          console.log('[AI] Updating active file:', activeFile.name);
          updateFileContent(activeFile.name, newCode);
        }
      }
    } catch (error: any) {
      console.error("AI assistance error:", error);

      // Check if it's an API error that wasn't handled by the flow
      const errorMessage = error?.message || String(error);
      const isQuotaError = errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('exceeded your current quota');

      const isApiError = errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('Failed to fetch') ||
        isQuotaError;

      if (isQuotaError) {
        // Extract wait time from error message if available
        const waitTimeMatch = errorMessage.match(/Please retry in ([\d.]+)s/i) ||
          errorMessage.match(/retry in ([\d.]+)s/i);
        const waitTime = waitTimeMatch ? Math.ceil(parseFloat(waitTimeMatch[1])) : null;

        // Extract quota limit if available
        const quotaMatch = errorMessage.match(/limit: (\d+)/i);
        const quotaLimit = quotaMatch ? quotaMatch[1] : null;

        let message = `⚠️ ** AI Quota Limit Reached **

          You've exceeded the free tier quota limit for the Gemini API.`;

        if (quotaLimit) {
          message += `\n\n**Quota Limit:** ${quotaLimit} requests per day (free tier)`;
        }

        if (waitTime) {
          message += `\n\n**Please wait ${waitTime} seconds before trying again.**`;
        } else {
          message += `\n\n**Please wait before your next request.**`;
        }

        message += `\n\n**Solutions:**
1. **Wait** - The quota resets daily. Try again after the reset period.
2. **Upgrade your plan** - Visit [Google AI Studio](https://ai.google.dev/) to check your quota and upgrade options.
3. **Continue manually** - You can still write and run code without AI assistance.`;

        set(produce((state: EditorState) => {
          state.chatHistory.push({
            role: 'assistant',
            message
          });
        }));
        return;
      }

      if (isApiError) {
        set(produce((state: EditorState) => {
          state.chatHistory.push({
            role: 'assistant',
            message: `⚠️ **AI Service Unavailable**

The AI service is temporarily overloaded. 

**What happened:**
- The AI service (Gemini) is experiencing high demand
- Your request couldn't be processed right now

**Solutions:**
1. **Wait and retry** - Try again in 30-60 seconds
2. **Continue coding manually** - You can still write code without AI assistance
3. **Check back later** - The service typically recovers quickly

The system will automatically retry your request when capacity becomes available.`
          });
        }));
        return;
      }

      // Fallback response for common requests
      const fallbackResponse = getFallbackResponse(message, get().activeFile?.content || '');

      set(produce((state: EditorState) => {
        state.chatHistory.push({ role: 'assistant', message: fallbackResponse });
      }));

      // Handle complex project creation requests
      const lowerMessage = message.toLowerCase();
      const { addNewFile, addNewFolder, updateFileContent, activeFile } = get();

      if (lowerMessage.includes('snake game') || lowerMessage.includes('make a snake game')) {
        // Create a complete snake game project structure
        addNewFolder('snake_game');
        addNewFile('snake_game/game.py', `import turtle
import time
import random

class SnakeGame:
    def __init__(self):
        self.setup_screen()
        self.setup_snake()
        self.setup_food()
        self.setup_score()
        self.segments = []
        self.setup_controls()
    
    def setup_screen(self):
        self.wn = turtle.Screen()
        self.wn.title("Snake Game")
        self.wn.bgcolor("black")
        self.wn.setup(width=600, height=600)
        self.wn.tracer(0)
    
    def setup_snake(self):
        self.head = turtle.Turtle()
        self.head.speed(0)
        self.head.shape("square")
        self.head.color("white")
        self.head.penup()
        self.head.goto(0, 0)
        self.head.direction = "stop"
    
    def setup_food(self):
        self.food = turtle.Turtle()
        self.food.speed(0)
        self.food.shape("circle")
        self.food.color("red")
        self.food.penup()
        self.food.goto(0, 100)
    
    def setup_score(self):
        self.pen = turtle.Turtle()
        self.pen.speed(0)
        self.pen.shape("square")
        self.pen.color("white")
        self.pen.penup()
        self.pen.hideturtle()
        self.pen.goto(0, 260)
        self.score = 0
        self.pen.write("Score: 0", align="center", font=("Courier", 24, "normal"))
    
    def setup_controls(self):
        self.wn.listen()
        self.wn.onkeypress(self.go_up, "w")
        self.wn.onkeypress(self.go_down, "s")
        self.wn.onkeypress(self.go_left, "a")
        self.wn.onkeypress(self.go_right, "d")
    
    def go_up(self):
        if self.head.direction != "down":
            self.head.direction = "up"
    
    def go_down(self):
        if self.head.direction != "up":
            self.head.direction = "down"
    
    def go_left(self):
        if self.head.direction != "right":
            self.head.direction = "left"
    
    def go_right(self):
        if self.head.direction != "left":
            self.head.direction = "right"
    
    def move(self):
        if self.head.direction == "up":
            y = self.head.ycor()
            self.head.sety(y + 20)
        elif self.head.direction == "down":
            y = self.head.ycor()
            self.head.sety(y - 20)
        elif self.head.direction == "left":
            x = self.head.xcor()
            self.head.setx(x - 20)
        elif self.head.direction == "right":
            x = self.head.xcor()
            self.head.setx(x + 20)
    
    def check_collision(self):
        # Check border collision
        if (self.head.xcor() > 290 or self.head.xcor() < -290 or 
            self.head.ycor() > 290 or self.head.ycor() < -290):
            self.reset_game()
            return True
        
        # Check self collision
        for segment in self.segments:
            if segment.distance(self.head) < 20:
                self.reset_game()
                return True
        
        return False
    
    def check_food_collision(self):
        if self.head.distance(self.food) < 20:
            # Move food to random location
            x = random.randint(-290, 290)
            y = random.randint(-290, 290)
            self.food.goto(x, y)
            
            # Add segment
            new_segment = turtle.Turtle()
            new_segment.speed(0)
            new_segment.shape("square")
            new_segment.color("grey")
            new_segment.penup()
            self.segments.append(new_segment)
            
            # Update score
            self.score += 10
            self.pen.clear()
            self.pen.write(f"Score: {self.score}", align="center", font=("Courier", 24, "normal"))
    
    def reset_game(self):
        time.sleep(1)
        self.head.goto(0, 0)
        self.head.direction = "stop"
        
        # Hide segments
        for segment in self.segments:
            segment.goto(1000, 1000)
        
        self.segments.clear()
        self.score = 0
        self.pen.clear()
        self.pen.write("Score: 0", align="center", font=("Courier", 24, "normal"))
    
    def update_segments(self):
        # Move segments
        for index in range(len(self.segments) - 1, 0, -1):
            x = self.segments[index - 1].xcor()
            y = self.segments[index - 1].ycor()
            self.segments[index].goto(x, y)
        
        if len(self.segments) > 0:
            x = self.head.xcor()
            y = self.head.ycor()
            self.segments[0].goto(x, y)
    
    def run(self):
        while True:
            self.wn.update()
            
            if not self.check_collision():
                self.check_food_collision()
                self.update_segments()
                self.move()
            
            time.sleep(0.1)

if __name__ == "__main__":
    game = SnakeGame()
    game.run()
    print("Turtle graphics completed (headless mode)")`);

        addNewFile('snake_game/README.md', `# Snake Game

A classic Snake game built with Python Turtle graphics.

## Features
- Snake movement with WASD keys
- Food collection and score tracking
- Collision detection with walls and body
- Growing snake body
- Game reset functionality

## Controls
- W: Move up
- S: Move down
- A: Move left
- D: Move right

## How to Run
Run the game.py file to start playing!

## Game Logic
The game uses object-oriented programming with a SnakeGame class that handles:
- Screen setup and configuration
- Snake head and body management
- Food placement and collision detection
- Score tracking and display
- Game state management`);

        addNewFile('snake_game/config.py', `# Game Configuration

# Screen settings
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 600
SCREEN_TITLE = "Snake Game"
BACKGROUND_COLOR = "black"

# Snake settings
SNAKE_COLOR = "white"
SNAKE_SHAPE = "square"
SNAKE_SPEED = 0
MOVE_DISTANCE = 20

# Food settings
FOOD_COLOR = "red"
FOOD_SHAPE = "circle"
FOOD_SPEED = 0

# Game settings
GAME_SPEED = 0.1
SCORE_INCREMENT = 10
BORDER_SIZE = 290

# Colors
SNAKE_HEAD_COLOR = "white"
SNAKE_BODY_COLOR = "grey"
SCORE_COLOR = "white"`);

        // Update main.py to import and run the game
        if (activeFile) {
          updateFileContent(activeFile.name, `from snake_game.game import SnakeGame

if __name__ == "__main__":
    print("Starting Snake Game...")
    game = SnakeGame()
    game.run()`);
        }
      }

      else if (lowerMessage.includes('web scraper') || lowerMessage.includes('scraper')) {
        // Create a web scraper project
        addNewFolder('web_scraper');
        addNewFile('web_scraper/scraper.py', `import requests
from bs4 import BeautifulSoup
import json
import csv
from urllib.parse import urljoin, urlparse
import time

class WebScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.scraped_data = []
    
    def get_page(self, url):
        """Fetch a web page and return BeautifulSoup object"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def scrape_links(self, url):
        """Scrape all links from a page"""
        soup = self.get_page(url)
        if not soup:
            return []
        
        links = []
        for link in soup.find_all('a', href=True):
            absolute_url = urljoin(url, link['href'])
            links.append({
                'text': link.get_text(strip=True),
                'url': absolute_url,
                'domain': urlparse(absolute_url).netloc
            })
        
        return links
    
    def scrape_text(self, url):
        """Scrape text content from a page"""
        soup = self.get_page(url)
        if not soup:
            return None
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def save_to_json(self, filename):
        """Save scraped data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data, f, indent=2, ensure_ascii=False)
    
    def save_to_csv(self, filename):
        """Save scraped data to CSV file"""
        if not self.scraped_data:
            return
        
        fieldnames = self.scraped_data[0].keys()
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.scraped_data)

# Example usage
if __name__ == "__main__":
    scraper = WebScraper("https://example.com")
    
    # Scrape links
    links = scraper.scrape_links("https://example.com")
    print(f"Found {len(links)} links")
    
    # Scrape text content
    text = scraper.scrape_text("https://example.com")
    if text:
        print(f"Scraped text length: {len(text)} characters")
    
    # Save results
    scraper.scraped_data = links
    scraper.save_to_json('scraped_data.json')
    scraper.save_to_csv('scraped_data.csv')
    
    print("Scraping completed!")`);

        addNewFile('web_scraper/requirements.txt', `requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3`);

        addNewFile('web_scraper/config.py', `# Web Scraper Configuration

# Request settings
REQUEST_TIMEOUT = 10
REQUEST_DELAY = 1  # Delay between requests in seconds
MAX_RETRIES = 3

# Headers
DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
}

# File settings
OUTPUT_DIR = 'output'
JSON_FILENAME = 'scraped_data.json'
CSV_FILENAME = 'scraped_data.csv'

# Scraping settings
MAX_PAGES = 100
FOLLOW_LINKS = True
RESPECT_ROBOTS_TXT = True`);

        addNewFile('web_scraper/README.md', `# Web Scraper

A Python web scraper built with requests and BeautifulSoup.

## Features
- Scrape links from web pages
- Extract text content
- Save data to JSON and CSV formats
- Configurable request settings
- Error handling and retry logic

## Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage
\`\`\`python
from scraper import WebScraper

scraper = WebScraper("https://example.com")
links = scraper.scrape_links("https://example.com")
text = scraper.scrape_text("https://example.com")
\`\`\`

## Configuration
Edit \`config.py\` to customize:
- Request timeouts and delays
- User agent strings
- Output file names
- Scraping limits

## Legal Notice
Always respect robots.txt and website terms of service when scraping.`);

        if (activeFile) {
          updateFileContent(activeFile.name, `from web_scraper.scraper import WebScraper

# Example: Scrape a website
scraper = WebScraper("https://httpbin.org")

# Scrape links
links = scraper.scrape_links("https://httpbin.org")
print(f"Found {len(links)} links")

# Scrape text content
text = scraper.scrape_text("https://httpbin.org")
if text:
    print(f"Scraped text length: {len(text)} characters")

print("Web scraping completed!")`);
        }
      }
    } finally {
      set({ isAiLoading: false });
      // Increment AI query counter
      incrementAiQuery();
    }
  },

  runQuickAction: (action) => {
    get().sendMessage(action.replace(/_/g, ' '), true);
  },

  fetchQuickActions: async () => {
    const { activeFile } = get();
    if (activeFile && activeFile.content) {
      try {
        const { actions, codeContext } = await decideCodeAssistanceActions({ code: activeFile.content });
        set({ quickActions: actions, codeContext });
      } catch (error) {
        console.error("Error fetching quick actions:", error);
      }
    } else {
      set({ quickActions: [], codeContext: 'Open a file to see AI suggestions.' });
    }
  },

  addNewFile: (name, content = '') => set(produce((state: EditorState) => {
    const fileExists = (items: FileOrFolder[]): boolean => {
      return items.some(item => {
        if (item.type === 'file' && item.name === name) return true;
        if (item.type === 'folder') return fileExists(item.children);
        return false;
      });
    };

    if (fileExists(state.fileTree.children)) {
      // Don't alert, just open the existing file.
      const fileToOpen = get().openFiles.find(f => f.name === name);
      if (fileToOpen) {
        state.activeFile = fileToOpen;
      }
      return;
    }

    const newFile: File = { name, type: 'file', content: content || `# ${name}\n\n` };
    state.fileTree.children.push(newFile);

    // Open the new file
    if (!state.openFiles.find(f => f.name === newFile.name)) {
      state.openFiles.push(newFile);
    }
    state.activeFile = newFile;

    // Save to database if there's a current project
    if (state.currentProject) {
      state.currentProject.fileTree = state.fileTree;
      state.currentProject.updatedAt = new Date();

      // Update in projects array
      const projectIndex = state.projects.findIndex(p => p.id === state.currentProject!.id);
      if (projectIndex !== -1) {
        state.projects[projectIndex] = { ...state.currentProject! };
      }

      // Save to localStorage
      localStorage.setItem('pycode-projects', JSON.stringify(state.projects));

      // Save to database
      saveProjectToDatabase(
        state.currentProject.id,
        state.currentProject.name,
        state.currentProject.description,
        state.fileTree
      ).catch(error => {
        console.error('Error saving new file to database:', error);
      });
    }
  })),

  addNewFileFromUpload: (name: string, path: string, content: string) => set(produce((state: EditorState) => {
    const newFile: File = {
      name,
      type: 'file',
      content,
      uploadPath: path // Store the upload path for reference
    };
    state.fileTree.children.push(newFile);

    // Open the new file
    if (!state.openFiles.find(f => f.name === newFile.name)) {
      state.openFiles.push(newFile);
    }
    state.activeFile = newFile;

    // Auto-save project to database
    if (state.currentProject) {
      state.currentProject.fileTree = state.fileTree;
      state.currentProject.updatedAt = new Date();

      // Update in projects array
      const projectIndex = state.projects.findIndex(p => p.id === state.currentProject!.id);
      if (projectIndex !== -1) {
        state.projects[projectIndex] = state.currentProject!;
      }

      // Save to localStorage
      localStorage.setItem('pycode-projects', JSON.stringify(state.projects));

      // Save to database
      saveProjectToDatabase(
        state.currentProject.id,
        state.currentProject.name,
        state.currentProject.description,
        state.fileTree
      ).catch(error => {
        console.error('Error auto-saving project after file upload:', error);
      });
    }
  })),

  deleteFile: (path) => set(produce((state: EditorState) => {
    let currentLevel: FileOrFolder[] = state.fileTree.children;
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      const nextLevel = currentLevel.find(item => item.name === segment && item.type === 'folder') as Folder;
      if (nextLevel) {
        currentLevel = nextLevel.children;
      } else {
        return; // Path not found
      }
    }

    const fileNameToDelete = path[path.length - 1];
    const fileIndex = currentLevel.findIndex(item => item.name === fileNameToDelete);

    if (fileIndex !== -1) {
      currentLevel.splice(fileIndex, 1);

      // Close the tab if it's open
      const openFileIndex = state.openFiles.findIndex(f => f.name === fileNameToDelete);
      if (openFileIndex !== -1) {
        state.openFiles.splice(openFileIndex, 1);
        if (state.activeFile?.name === fileNameToDelete) {
          state.activeFile = state.openFiles[Math.max(0, openFileIndex - 1)] || state.openFiles[0] || null;
        }
      }

      // Save to database if there's a current project
      if (state.currentProject) {
        state.currentProject.fileTree = state.fileTree;
        state.currentProject.updatedAt = new Date();

        // Update in projects array
        const projectIndex = state.projects.findIndex(p => p.id === state.currentProject!.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = { ...state.currentProject! };
        }

        // Save to localStorage
        localStorage.setItem('pycode-projects', JSON.stringify(state.projects));

        // Save to database
        saveProjectToDatabase(
          state.currentProject.id,
          state.currentProject.name,
          state.currentProject.description,
          state.fileTree
        ).catch(error => {
          console.error('Error saving file deletion to database:', error);
        });
      }
    }
  })),

  downloadProjectAsZip: () => {
    const zip = new JSZip();
    const projectFolder = zip.folder(get().fileTree.name.replace(/\s/g, '_'));

    const addFilesToZip = (folder: JSZip | null, items: FileOrFolder[]) => {
      if (!folder) return;
      items.forEach(item => {
        if (item.type === 'file') {
          folder.file(item.name, item.content);
        } else if (item.type === 'folder') {
          const subFolder = folder.folder(item.name);
          addFilesToZip(subFolder, item.children);
        }
      });
    };

    addFilesToZip(projectFolder, get().fileTree.children);

    zip.generateAsync({ type: "blob" }).then(content => {
      saveAs(content, `${get().fileTree.name.replace(/\s/g, '_')}.zip`);
    });
  },

  addNewFolder: (name: string) => {
    const newFolder: Folder = {
      name,
      type: 'folder',
      children: [],
    };

    set(produce((state: EditorState) => {
      state.fileTree.children.push(newFolder);

      // Update current project if exists
      if (state.currentProject) {
        state.currentProject.fileTree = state.fileTree;
        state.currentProject.updatedAt = new Date();

        // Update in projects array
        const projectIndex = state.projects.findIndex(p => p.id === state.currentProject!.id);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = { ...state.currentProject! };
        }

        // Save to localStorage
        localStorage.setItem('pycode-projects', JSON.stringify(state.projects));

        // Save to database
        saveProjectToDatabase(
          state.currentProject.id,
          state.currentProject.name,
          state.currentProject.description,
          state.fileTree
        ).catch(error => {
          console.error('Error saving new folder to database:', error);
        });
      }
    }));
  },

  createProject: async (name: string, description?: string) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('[createProject] No current user');
      return;
    }

    console.log('[createProject] Creating project for user:', currentUser.id, 'name:', name);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name,
          description: description || '',
          fileTree: {
            name,
            type: 'folder',
            children: [{
              name: 'main.py',
              type: 'file',
              content: `print("Hello from ${name}!")\n`
            }]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[createProject] Project created successfully:', data.projectId);

        const newProject: Project = {
          id: data.projectId,
          name,
          description: description || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          fileTree: {
            name,
            type: 'folder',
            children: [{
              name: 'main.py',
              type: 'file',
              content: `print("Hello from ${name}!")\n`
            }]
          }
        };

        set(produce((state: EditorState) => {
          state.projects.push(newProject);
          state.currentProject = newProject;
          state.fileTree = newProject.fileTree;
          state.openFiles = [newProject.fileTree.children[0] as File];
          state.activeFile = newProject.fileTree.children[0] as File;
          state.chatHistory = [];
          state.output = '';
        }));
      } else {
        let errorMessage = 'Failed to create project'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          const textContent = await response.text()
          errorMessage = textContent || errorMessage
        }
        console.error('[createProject] Project creation failed:', errorMessage)
      }
    } catch (error) {
      console.error('[createProject] Error creating project:', error);
    }
  },

  loadUserProjects: async () => {
    try {
      const { currentUser } = get();
      if (!currentUser || !currentUser.id) {
        console.log('[loadUserProjects] No current user or user ID');
        return;
      }

      console.log('[loadUserProjects] Loading projects for user:', currentUser.id);
      const response = await fetch(`/api/projects?userId=${currentUser.id}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[loadUserProjects] Raw response:', data.projects?.length || 0, 'projects');

        if (!data.projects || !Array.isArray(data.projects)) {
          console.warn('[loadUserProjects] Invalid projects data received:', data);
          set(produce((state: EditorState) => {
            state.projects = [];
          }));
          return [];
        }

        const loadedProjects = data.projects.map((project: any) => {
          let fileTree: Folder;
          try {
            // Handle different JSON formats from MySQL
            let rawFileTree = project.file_tree;

            // MySQL JSON columns can return as string, object, or null
            if (rawFileTree === null || rawFileTree === undefined) {
              console.warn(`[loadUserProjects] Project ${project.id} has null file_tree, creating default`);
              rawFileTree = JSON.stringify({
                name: project.name,
                type: 'folder',
                children: [{
                  name: 'main.py',
                  type: 'file',
                  content: `# ${project.name}\nprint("Hello from ${project.name}!")\n`
                }]
              });
            }

            if (typeof rawFileTree === 'string') {
              // Try parsing the string
              if (rawFileTree.trim() === '') {
                throw new Error('Empty file_tree string');
              }
              fileTree = JSON.parse(rawFileTree);
            } else if (typeof rawFileTree === 'object') {
              // Already parsed (shouldn't happen with mysql2, but handle it)
              fileTree = rawFileTree;
            } else {
              throw new Error(`Unexpected file_tree type: ${typeof rawFileTree}`);
            }

            // Validate fileTree structure
            if (!fileTree || typeof fileTree !== 'object' || !fileTree.name) {
              throw new Error('Invalid fileTree structure after parsing');
            }

            // Validate it has children array
            if (!Array.isArray(fileTree.children)) {
              console.warn(`[loadUserProjects] Project ${project.id} has invalid children, initializing empty array`);
              fileTree.children = [];
            }

            console.log(`[loadUserProjects] Successfully loaded project ${project.id} with ${fileTree.children.length} items`);
          } catch (error: any) {
            console.error(`[loadUserProjects] Error parsing file_tree for project ${project.id}:`, error.message);
            // Fallback to default file tree structure
            fileTree = {
              name: project.name,
              type: 'folder',
              children: [{
                name: 'main.py',
                type: 'file',
                content: `# ${project.name}\nprint("Hello from ${project.name}!")\n`
              }]
            };
          }

          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            fileTree,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at)
          };
        });

        console.log('[loadUserProjects] Successfully loaded', loadedProjects.length, 'projects');

        set(produce((state: EditorState) => {
          state.projects = loadedProjects;
        }));

        return loadedProjects;
      } else {
        // Get error details from response
        let errorData: any;
        try {
          const text = await response.text();
          if (text) {
            try {
              errorData = JSON.parse(text);
            } catch (parseError) {
              // If JSON parsing fails, use text as error message
              errorData = {
                error: `HTTP ${response.status}: ${response.statusText}`,
                details: text.substring(0, 500) // Limit text length
              };
            }
          } else {
            errorData = {
              error: `HTTP ${response.status}: ${response.statusText}`,
              details: 'Empty response body'
            };
          }
        } catch (parseError: any) {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: parseError?.message || 'Failed to parse error response'
          };
        }

        console.error('[loadUserProjects] Failed to load projects:', response.status);
        console.error('[loadUserProjects] Error data:', errorData);

        // Show user-friendly error message if available
        if (errorData?.details || errorData?.error) {
          console.error('[loadUserProjects] Error:', errorData.details || errorData.error);
        }

        // Set empty projects array on error
        set(produce((state: EditorState) => {
          state.projects = [];
        }));
      }
    } catch (error: any) {
      console.error('[loadUserProjects] Error loading projects:', error);
      console.error('[loadUserProjects] Error stack:', error?.stack);

      // Set empty projects array on error
      set(produce((state: EditorState) => {
        state.projects = [];
      }));
    }
  },

  loadProject: async (projectId: string) => {
    try {
      console.log('[loadProject] Loading project:', projectId);

      // First, try to fetch directly from database to get the latest data
      const projectResponse = await fetch(`/api/projects?projectId=${projectId}`);

      let project: Project | null = null;

      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        if (projectData.project) {
          let fileTree: Folder;
          try {
            // Handle different JSON formats from MySQL
            let rawFileTree = projectData.project.file_tree;

            // MySQL JSON columns can return as string, object, or null
            if (rawFileTree === null || rawFileTree === undefined) {
              console.warn(`[loadProject] Project ${projectId} has null file_tree, creating default`);
              rawFileTree = JSON.stringify({
                name: projectData.project.name,
                type: 'folder',
                children: [{
                  name: 'main.py',
                  type: 'file',
                  content: `# ${projectData.project.name}\nprint("Hello from ${projectData.project.name}!")\n`
                }]
              });
            }

            if (typeof rawFileTree === 'string') {
              if (rawFileTree.trim() === '') {
                throw new Error('Empty file_tree string');
              }
              fileTree = JSON.parse(rawFileTree);
            } else if (typeof rawFileTree === 'object') {
              fileTree = rawFileTree;
            } else {
              throw new Error(`Unexpected file_tree type: ${typeof rawFileTree}`);
            }

            // Validate fileTree structure
            if (!fileTree || typeof fileTree !== 'object' || !fileTree.name) {
              throw new Error('Invalid fileTree structure after parsing');
            }

            // Validate it has children array
            if (!Array.isArray(fileTree.children)) {
              console.warn(`[loadProject] Project ${projectId} has invalid children, initializing empty array`);
              fileTree.children = [];
            }

            console.log(`[loadProject] Successfully loaded project ${projectId} with ${fileTree.children.length} items`);
          } catch (error: any) {
            console.error(`[loadProject] Error parsing file_tree for project ${projectId}:`, error.message);
            // Fallback to default file tree structure
            fileTree = {
              name: projectData.project.name,
              type: 'folder',
              children: [{
                name: 'main.py',
                type: 'file',
                content: `# ${projectData.project.name}\nprint("Hello from ${projectData.project.name}!")\n`
              }]
            };
          }

          project = {
            id: projectData.project.id,
            name: projectData.project.name,
            description: projectData.project.description || '',
            fileTree,
            createdAt: new Date(projectData.project.created_at),
            updatedAt: new Date(projectData.project.updated_at)
          };

          console.log('[loadProject] Successfully loaded project from database');
        }
      } else {
        console.warn('[loadProject] Failed to fetch project from database, trying in-memory fallback');
      }

      // Fallback to in-memory array if database fetch fails
      if (!project) {
        project = get().projects.find(p => p.id === projectId) || null;
      }

      if (!project) {
        console.error('Project not found:', projectId);
        return;
      }

      // Load uploaded files from database and merge with fileTree
      try {
        const filesResponse = await fetch(`/api/files/project?projectId=${projectId}`);
        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          const uploadedFiles = filesData.files || [];

          // Merge uploaded files into fileTree
          const projectFileTree = { ...project.fileTree };

          // Ensure children array exists
          if (!projectFileTree.children) {
            projectFileTree.children = [];
          }

          // Check if uploaded files are already in fileTree
          uploadedFiles.forEach((uploadedFile: any) => {
            const fileName = uploadedFile.originalName;
            // Check if file already exists in fileTree
            const fileExists = (items: FileOrFolder[]): boolean => {
              return items.some(item => {
                if (item.type === 'file' && item.name === fileName) {
                  return true;
                }
                if (item.type === 'folder') {
                  return fileExists(item.children);
                }
                return false;
              });
            };

            if (!fileExists(projectFileTree.children)) {
              // Add uploaded file to fileTree
              projectFileTree.children.push({
                name: fileName,
                type: 'file',
                content: uploadedFile.content || '',
                uploadPath: uploadedFile.filePath
              });
            } else {
              // Update existing file content
              const updateFile = (items: FileOrFolder[]): boolean => {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type === 'file' && items[i].name === fileName) {
                    (items[i] as File).content = uploadedFile.content || '';
                    (items[i] as File).uploadPath = uploadedFile.filePath;
                    return true;
                  }
                  if (items[i].type === 'folder') {
                    if (updateFile((items[i] as Folder).children)) return true;
                  }
                }
                return false;
              };
              updateFile(projectFileTree.children);
            }
          });

          // Update projects array with latest project
          set(produce((state: EditorState) => {
            const projectIndex = state.projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
              state.projects[projectIndex] = { ...project, fileTree: projectFileTree };
            } else {
              state.projects.push({ ...project, fileTree: projectFileTree });
            }

            state.currentProject = { ...project, fileTree: projectFileTree };
            state.fileTree = projectFileTree;

            // Get all files from the fileTree (including nested ones)
            const getAllFiles = (items: FileOrFolder[]): File[] => {
              const files: File[] = [];
              for (const item of items) {
                if (item.type === 'file') {
                  files.push(item as File);
                } else if (item.type === 'folder' && item.children) {
                  files.push(...getAllFiles(item.children));
                }
              }
              return files;
            };

            const allFiles = getAllFiles(projectFileTree.children);
            state.openFiles = allFiles;
            state.activeFile = allFiles[0] || null;
            state.chatHistory = [];
            state.output = '';
          }));
          return;
        }
      } catch (error) {
        console.error('Error loading uploaded files:', error);
      }

      // Fallback: load project without uploaded files if API call fails
      set(produce((state: EditorState) => {
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = project;
        } else {
          state.projects.push(project);
        }

        state.currentProject = project;
        state.fileTree = project.fileTree;

        // Get all files from the fileTree (including nested ones)
        const getAllFiles = (items: FileOrFolder[]): File[] => {
          const files: File[] = [];
          for (const item of items) {
            if (item.type === 'file') {
              files.push(item as File);
            } else if (item.type === 'folder' && item.children) {
              files.push(...getAllFiles(item.children));
            }
          }
          return files;
        };

        const allFiles = getAllFiles(project.fileTree.children);
        state.openFiles = allFiles;
        state.activeFile = allFiles[0] || null;
        state.chatHistory = [];
        state.output = '';
      }));
    } catch (error) {
      console.error('Error loading project:', error);
    }
  },

  saveProject: async () => {
    const { currentProject } = get();
    if (!currentProject) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          name: currentProject.name,
          description: currentProject.description,
          fileTree: get().fileTree
        })
      });

      if (response.ok) {
        set(produce((state: EditorState) => {
          state.currentProject!.fileTree = state.fileTree;
          state.currentProject!.updatedAt = new Date();

          // Update in projects array
          const projectIndex = state.projects.findIndex(p => p.id === currentProject.id);
          if (projectIndex !== -1) {
            state.projects[projectIndex] = state.currentProject!;
          }
        }));
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  },

  // User registration
  registerUser: async (name: string, email: string, password: string, subscription: 'free' | 'pro' | 'team' = 'free') => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, subscription })
      });

      if (response.ok) {
        const data = await response.json();
        // Create user object for the store
        const newUser: User = {
          id: data.userId,
          email,
          name,
          subscription,
          credits: subscription === 'free' ? 100 : subscription === 'pro' ? 1000 : 5000,
          creditLimit: subscription === 'free' ? 100 : subscription === 'pro' ? 1000 : 5000,
          codeRuns: 0,
          aiQueries: 0,
          createdAt: new Date(),
          lastActive: new Date(),
          isActive: true,
        };

        set(produce((state: EditorState) => {
          state.currentUser = newUser;
          state.users.push(newUser);
        }));

        return { success: true, user: newUser };
      }
      return { success: false, error: 'Failed to create user' };
    } catch (error) {
      console.error('User registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  },

  // User login
  loginUser: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();

        // Store token and user data
        localStorage.setItem('pycode-user-token', data.token);

        set(produce((state: EditorState) => {
          // Clear old project state first
          state.projects = [];
          state.currentProject = null;
          state.fileTree = initialFileTree;
          state.openFiles = [initialFile];
          state.activeFile = initialFile;
          state.output = '';
          state.chatHistory = [];

          // Set new user (ensure profileComplete is included)
          state.currentUser = {
            ...data.user,
            profileComplete: data.user.profileComplete || false
          };
          // Update user in users array if exists, otherwise add
          const userIndex = state.users.findIndex(u => u.id === data.user.id);
          if (userIndex >= 0) {
            state.users[userIndex] = data.user;
          } else {
            state.users.push(data.user);
          }
        }));

        // Load user's projects from database after login
        try {
          console.log('[loginUser] Loading projects for user:', data.user.id);
          await get().loadUserProjects();
          console.log('[loginUser] Projects loaded successfully');
        } catch (error) {
          console.error('[loginUser] Error loading projects after login:', error);
          // Don't fail login if projects fail to load
        }

        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  // User logout
  logoutUser: async () => {
    try {
      // Save all projects to database before logout
      const { projects, currentProject, fileTree } = get();

      // Save current project if it exists
      if (currentProject && fileTree) {
        console.log('[logoutUser] Saving current project before logout');
        await saveProjectToDatabase(
          currentProject.id,
          currentProject.name,
          currentProject.description,
          fileTree
        );
      }

      // Save all other projects
      for (const project of projects) {
        if (project.id !== currentProject?.id && project.fileTree) {
          console.log(`[logoutUser] Saving project ${project.id} before logout`);
          await saveProjectToDatabase(
            project.id,
            project.name,
            project.description,
            project.fileTree
          );
        }
      }

      const token = localStorage.getItem('pycode-user-token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and reset user state
      localStorage.removeItem('pycode-user-token');
      localStorage.removeItem('pycode-projects'); // Clear cached projects

      set(produce((state: EditorState) => {
        // Reset user to demo
        state.currentUser = {
          id: 'demo_1',
          email: 'user@example.com',
          name: 'Demo User',
          subscription: 'free',
          credits: 100,
          creditLimit: 100,
          codeRuns: 0,
          aiQueries: 0,
          createdAt: new Date(),
          lastActive: new Date(),
          isActive: true,
          profileComplete: false,
        };
        // Clear all project-related state
        state.projects = [];
        state.currentProject = null;
        state.fileTree = initialFileTree;
        state.openFiles = [initialFile];
        state.activeFile = initialFile;
        state.output = '';
        state.chatHistory = [];
      }));
    }
  },

  // Admin functions
  adminLogin: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        set({ isAdmin: true });
        localStorage.setItem('pycode-admin-token', data.sessionToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  },

  adminLogout: async () => {
    try {
      const token = localStorage.getItem('pycode-admin-token');
      if (token) {
        await fetch(`/api/admin/auth?token=${token}`, { method: 'DELETE' });
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      set({ isAdmin: false });
      localStorage.removeItem('pycode-admin-token');
    }
  },

  getAllUsers: async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        set({ users: data.users });
        return data.users;
      }
      return get().users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return get().users;
    }
  },

  updateUserCredits: async (userId: string, credits: number) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits })
      });

      if (response.ok) {
        set(produce((state: EditorState) => {
          const userIndex = state.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            state.users[userIndex].credits = credits;
          }
          if (state.currentUser?.id === userId) {
            state.currentUser.credits = credits;
          }
        }));
      }
    } catch (error) {
      console.error('Error updating user credits:', error);
    }
  },

  updateUserSubscription: async (userId: string, subscription: 'free' | 'pro' | 'team') => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription })
      });

      if (response.ok) {
        const creditLimits = { free: 100, pro: 1000, team: 5000 };
        set(produce((state: EditorState) => {
          const userIndex = state.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            state.users[userIndex].subscription = subscription;
            state.users[userIndex].creditLimit = creditLimits[subscription];
          }
          if (state.currentUser?.id === userId) {
            state.currentUser.subscription = subscription;
            state.currentUser.creditLimit = creditLimits[subscription];
          }
        }));
      }
    } catch (error) {
      console.error('Error updating user subscription:', error);
    }
  },

  getUserStats: async () => {
    try {
      const response = await fetch('/api/stats', { method: 'PUT' });
      if (response.ok) {
        const data = await response.json();
        set({ adminStats: data.stats });
        return data.stats;
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }

    // Fallback to local calculation
    const { users, projects } = get();
    const totalCodeRuns = users.reduce((sum, user) => sum + user.codeRuns, 0);
    const totalAiQueries = users.reduce((sum, user) => sum + user.aiQueries, 0);
    const activeUsers = users.filter(user => {
      const daysSinceActive = (Date.now() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7;
    }).length;
    const premiumUsers = users.filter(user => user.subscription !== 'free').length;

    return {
      totalUsers: users.length,
      totalProjects: projects.length,
      totalCodeRuns,
      totalAiQueries,
      activeUsers,
      premiumUsers,
    };
  },

  incrementCodeRun: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type: 'code_run' })
      });

      if (response.ok) {
        set(produce((state: EditorState) => {
          state.dailyCodeRuns += 1;
          if (state.currentUser) {
            state.currentUser.codeRuns += 1;
            state.currentUser.credits -= 1;
            state.currentUser.lastActive = new Date();
          }
        }));
      }
    } catch (error) {
      console.error('Error incrementing code run:', error);
    }
  },

  incrementAiQuery: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type: 'ai_query' })
      });

      if (response.ok) {
        set(produce((state: EditorState) => {
          state.dailyAiQueries += 1;
          if (state.currentUser) {
            state.currentUser.aiQueries += 1;
            state.currentUser.credits -= 1;
            state.currentUser.lastActive = new Date();
          }
        }));
      }
    } catch (error) {
      console.error('Error incrementing AI query:', error);
    }
  },

  checkCreditLimit: () => {
    const { currentUser } = get();
    if (!currentUser) return false;
    return currentUser.credits <= 0;
  },

}));
