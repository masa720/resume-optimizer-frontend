# Resume Optimizer Frontend

A web app that analyzes your resume against job descriptions and provides actionable feedback — match scores, skill gaps, section-by-section feedback, format checks, and rewrite suggestions.

Built for the Vancouver job market.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth:** Supabase
- **State:** TanStack Query
- **Backend:** [resume-optimizer-backend](https://github.com/masa720/resume-optimizer-backend) (Go)

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- The backend API running

### Setup

```bash
git clone https://github.com/masa720/resume-optimizer-frontend.git
cd resume-optimizer-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Features

- Resume vs. job description analysis with overall match score and sub-scores
- Structured skill matching (hard/soft, required/preferred)
- Section-by-section feedback with scores
- Format/ATS checks
- Rewrite suggestions with before/after diffs
- Analysis versioning (re-analyze with updated resume)
- Application status tracking with custom statuses
- Search, filter, sort, and pagination on the history page
- Signup / login with Supabase Auth
