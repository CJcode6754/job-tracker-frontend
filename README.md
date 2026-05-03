# HireSight — Job Application Tracker

> The high-performance workspace for elite job seekers. Organize, automate, and dominate your career transition.

HireSight is a full-featured job application tracking platform built for serious job seekers. It replaces messy spreadsheets with a visual Kanban pipeline, AI-powered tools, and real-time analytics — all in a clean, modern interface.

**Live Demo:** [hire-sight-track.vercel.app](https://hire-sight-track.vercel.app)
**Demo Account:** demo@example.com / password

---

## What is HireSight?

HireSight gives you complete visibility into your job search. Every application you submit lives on a visual board where you can track its progress from wishlist to offer. You get AI tools to write cover letters, analyze your pipeline, and chat with an assistant that knows your entire job history. You can import your existing applications from Excel, export them anytime, and see your performance broken down in charts.

It's built for people who treat their job search like a project — with data, structure, and strategy.

---

## Features

### 🎯 Visual Kanban Board
- Drag-and-drop applications across pipeline stages
- Stages: Wishlist → Applied → Phone Screen → Interview → Offer → Rejected
- Archive applications to keep your board clean
- Toggle visibility of rejected and archived entries
- Load more pagination without leaving the board

### 📋 Application Management
- Add applications with full details: company, role, job URL, location, work type, employment type, salary range, applied date, deadline, priority, and notes
- Edit any field inline
- View full application detail page with all information
- Priority levels: High, Medium, Low with color-coded badges
- Status badges with distinct colors per stage

### 🗓️ Interview Round Tracking
- Log multiple interview rounds per application
- Round types: Technical, HR, System Design, Take Home
- Track date, interviewer name, personal notes, and self-rating (1–5 stars)
- Edit or delete rounds directly from the detail page
- Interview schedule only appears when application is in "Interview" stage

### 📊 Dashboard & Analytics
- Total applications, active pipeline count, and offer count at a glance
- Status distribution bar chart
- Weekly application activity chart
- Interview activity panel: active interviews, average self-rating
- Round type breakdown pie chart

### 🤖 AI Features (Powered by Gemini 2.5 Flash)
- **Chat Assistant** — Ask questions about your applications. "Which companies haven't responded in 2 weeks?" or "What's my interview success rate?" The AI has full context of your pipeline
- **Cover Letter Generator** — Generate a tailored, professional cover letter from company name, role, job description, and your background
- **Pipeline Insights** — Get 5 detailed AI-generated insights: pipeline health, follow-up reminders, upcoming deadlines, wins, and one concrete recommendation
- **Job Description Auto-Tagger** — Paste a job description and get back structured data: role title, company, location, seniority, tech stack, key requirements, salary range, and estimated priority

### 📥 Import & Export
- Import applications from Excel (.xlsx) files
- Download a pre-formatted Excel template to fill in
- Export all current applications to Excel
- CSV/Excel support via PapaParse and SheetJS

### 🎨 Themes
- 14 built-in themes via DaisyUI: light, dark, cupcake, emerald, corporate, lofi, luxury, dracula, business, night, winter, dim, nord, sunset
- Theme persists across sessions via localStorage
- Theme switcher accessible from the login page and navbar

### 🔐 Authentication
- Secure registration with password complexity requirements (uppercase, lowercase, numbers, special characters, 12+ characters)
- Login with email and password
- Auth token stored in HttpOnly cookie — not accessible to JavaScript
- Automatic token refresh 5 minutes before expiry
- Auto-logout on 401 responses

### 🔍 Filtering & Search
- Search applications by company name or role
- Filter by status and priority
- Control how many results to show per page (20, 50, 100)
- Debounced search — no button needed, results update as you type

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 + DaisyUI 5 |
| State Management | Zustand |
| Routing | React Router v7 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Charts | Recharts |
| Drag & Drop | dnd-kit |
| Rich Text | Tiptap |
| Animations | Framer Motion |
| Notifications | Sonner |
| Import/Export | PapaParse + SheetJS (xlsx) |
| Deployment | Vercel |

---

## Requirements

- Node.js 18+
- npm
- HireSight API running (see [job-tracker-api](../job-tracker-api/README.md))

---

## Local Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

```bash
# Start development server
npm run dev
```

App runs at `http://localhost:5173`

---

## Scripts

```bash
npm run dev        # Start dev server with HMR at localhost:5173
npm run build      # Type-check and build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   ├── AiChat.tsx           # Chat assistant panel
│   │   ├── CoverLetter.tsx      # Cover letter generator
│   │   └── Insights.tsx         # Pipeline insights panel
│   ├── board/
│   │   ├── KanbanBoard.tsx      # Main drag-and-drop board
│   │   ├── KanbanColumn.tsx     # Individual pipeline column
│   │   ├── ApplicationCard.tsx  # Draggable application card
│   │   └── FilterBar.tsx        # Search and filter controls
│   ├── forms/
│   │   ├── ApplicationForm.tsx      # Add/edit application form
│   │   └── InterviewRoundForm.tsx   # Add/edit interview round form
│   └── layout/
│       └── Navbar.tsx           # Top navigation bar
├── hooks/
│   ├── useAi.ts       # AI feature hooks (chat, cover letter, insights)
│   ├── useExport.tsx  # Excel export logic
│   └── useImport.tsx  # Excel import logic
├── lib/
│   └── axios.ts       # Axios instance — withCredentials, interceptors
├── pages/
│   ├── Login.tsx              # Login + register tabs
│   ├── Dashboard.tsx          # Stats, charts, AI insights
│   ├── Board.tsx              # Kanban board page
│   ├── ApplicationDetail.tsx  # Full application detail view
│   ├── About.tsx              # About page
│   └── ErrorPage.tsx          # 404 / error boundary
├── router/
│   ├── index.tsx           # Route definitions
│   ├── ProtectedRoute.tsx  # Redirects to login if not authenticated
│   └── GuestRoute.tsx      # Redirects to dashboard if already logged in
├── store/
│   ├── useAuthStore.ts        # Auth state — login, logout, refresh
│   ├── useApplicationStore.ts # Application CRUD, pagination, filters
│   └── useThemeStore.ts       # Theme selection and persistence
└── types/
    └── index.ts    # Shared TypeScript interfaces
```

---

## Authentication Flow

1. User logs in → API sets `auth_token` as an HttpOnly cookie
2. Axios sends the cookie automatically on every request (`withCredentials: true`)
3. Token refresh is scheduled automatically 35 minutes after login (5 min before expiry)
4. On 401 response → `clearAuth()` is called → user is redirected to login
5. No tokens are stored in `localStorage` — immune to XSS

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set the root directory to `job-tracker-frontend`
4. Add environment variable: `VITE_API_URL=https://your-render-api-url.onrender.com`
5. Deploy

**Important:** Make sure your API has the following set correctly:
- `SANCTUM_STATEFUL_DOMAINS` includes your Vercel domain (e.g. `hire-sight-track.vercel.app`)
- `FRONTEND_URL` is set to your Vercel URL for CORS

---

## Application Statuses

| Status | Description |
|--------|-------------|
| `wishlist` | Saved for later, not yet applied |
| `applied` | Application submitted |
| `phone_screen` | Initial screening call scheduled |
| `interview` | Active interview process |
| `offer` | Received a job offer |
| `rejected` | Application was rejected |
| `archived` | Manually archived, hidden from main board |

---

## Built By

**Ceejay Ibabiosa** — Built HireSight to end the chaos of manual job tracking and give job seekers an enterprise-grade dashboard with full pipeline visibility and AI-powered insights.
