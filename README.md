# 🐍 PyCodeAI — AI-Powered Python Code Runner

> An intelligent, browser-based Python coding environment powered by Google Gemini AI. Write, execute, and get AI assistance for Python code directly in your browser — no local Python setup headaches.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Genkit](https://img.shields.io/badge/Google%20Genkit-1.27-orange?logo=google)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Features

- **🤖 AI Code Assistance** — Powered by Google Gemini via Genkit. Get intelligent suggestions, debugging help, and code explanations in real-time.
- **▶️ Live Python Execution** — Run Python code directly from the browser. The backend spawns a secure Python subprocess and streams back stdout/stderr.
- **📦 Auto Package Installation** — Missing packages? The runner automatically detects and installs required packages (numpy, pandas, matplotlib, seaborn, scikit-learn, etc.) via `pip`.
- **🖼️ Graphical App Support** — Supports graphical libraries like `matplotlib`, `pygame`, `plotly`, `seaborn`, and `bokeh` (Agg backend for headless environments).
- **📁 Project File Management** — Organize code into projects. Files created during execution are stored in isolated per-project directories.
- **🔐 Authentication** — Secure user authentication with Supabase Auth and Firebase.
- **📊 Dashboard** — A full-featured user dashboard to manage your Python projects and execution history.
- **🌙 Dark Mode** — Sleek dark/light mode support powered by `next-themes`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) with TypeScript |
| **AI / LLM** | [Google Genkit](https://firebase.google.com/docs/genkit) + Gemini |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Auth** | Supabase Auth + Firebase |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS](https://tailwindcss.com/) |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10 (must be available in PATH as `python` on Windows / `python3` on Linux/Mac)
- **npm** or **yarn**
- A [Supabase](https://supabase.com/) project
- A [Google AI API Key](https://aistudio.google.com/) (for Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/Atharv1136/py-app.git
cd py-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root (see `.env` for reference):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google AI (Gemini)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key

# Firebase (optional, for additional auth)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 4. Set Up the Database

Run the Supabase migration scripts:

```bash
# Apply the schema
psql -h your_supabase_host -U postgres -d postgres -f supabase_schema.sql

# Apply admin roles
psql -h your_supabase_host -U postgres -d postgres -f supabase_admin.sql
```

Or use the Supabase Dashboard SQL editor to run `supabase_schema.sql` and `supabase_admin.sql`.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

---

## 📂 Project Structure

```
pyapp/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API route handlers
│   │   ├── dashboard/        # User dashboard
│   │   ├── editor/           # Python code editor page
│   │   ├── admin/            # Admin panel
│   │   ├── login/            # Auth pages
│   │   └── signup/
│   ├── ai/
│   │   ├── flows/            # Genkit AI flows
│   │   │   ├── run-python-code.ts        # Python execution engine
│   │   │   └── decide-code-assistance-actions.ts  # AI assistance logic
│   │   └── genkit.ts         # Genkit configuration
│   ├── components/           # Reusable UI components
│   ├── lib/                  # Utilities & Supabase client
│   └── middleware.ts          # Auth middleware
├── db/
│   └── migrations/           # Database migration files
├── scripts/                  # Setup & utility scripts
├── uploads/                  # Per-project file storage
├── supabase_schema.sql        # Full DB schema
├── supabase_admin.sql         # Admin roles & policies
├── requirements.txt           # Python dependencies (for execution env)
├── render.yaml                # Render.com deployment config
└── apphosting.yaml            # Firebase App Hosting config
```

---

## 🧠 How Python Execution Works

1. User writes Python code in the Monaco editor.
2. Code is sent to the **Genkit AI flow** (`runPythonCodeFlow`).
3. The flow spawns a **Python subprocess** (via Node.js `child_process.spawn`).
4. It automatically detects missing packages and installs them via `pip`.
5. stdout/stderr are captured and returned to the frontend.
6. Files created during execution are stored in `uploads/<projectId>/`.

> **Note:** For production multi-tenant use, additional sandboxing (Docker, gVisor, etc.) is recommended.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server on port 9002 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run setup-db` | Run database setup script |
| `npm run genkit:dev` | Start Genkit developer UI |

---

## 🌐 Deployment

The project is configured for multiple deployment targets:

- **Firebase App Hosting** — See `apphosting.yaml`
- **Render.com** — See `render.yaml`

For Firebase App Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Deploy
firebase deploy
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Built with ❤️ using Next.js, Google Gemini, and Supabase</p>
