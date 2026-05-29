# ATS Resume Analyzer

<p align="center">
  <b>AI-powered resume analysis that helps you beat the bots.</b>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API</a> •
  <a href="#screenshots">Screenshots</a>
</p>

---

## What is this?

ATS Resume Analyzer is a full-stack web application that helps job seekers optimize their resumes for **Applicant Tracking Systems (ATS)**. Upload your resume as a PDF, paste a job description, and get:

- A **compatibility score** based on keyword matching
- A **skill gap analysis** — what the job wants vs. what your resume has
- **AI-powered suggestions** via Google Gemini to improve bullet points and formatting
- **ATS optimization tips** tailored to your specific resume and target role

Built with a clean React frontend, a secure Express API, MongoDB for persistence, and Google's Gemini 2.0 Flash model for intelligent analysis.

---

## Features

| Feature | Description |
|---------|-------------|
| **🔐 JWT Authentication** | Secure register / login with bcrypt-hashed passwords and stateless JWT sessions |
| **📄 PDF Parsing** | Extracts raw text from uploaded PDF resumes using Mozilla's `pdfjs-dist` |
| **🎯 ATS Scoring** | Calculates a keyword-match score between your resume and the job description |
| **🤖 AI Analysis** | Google Gemini generates structured feedback: missing skills, bullet improvements, and overall assessment |
| **🧠 Skill Gap Detection** | Side-by-side comparison of resume skills vs. job description requirements |
| **📊 Rich Report Modal** | Clean, scrollable modal with categorized suggestions and a compatibility percentage |
| **⚡ Zero Config Dev** | Webpack dev server with built-in API proxy — no CORS headaches |

---

## Tech Stack

### Frontend
- **React 18** — UI library
- **React Router DOM v6** — Client-side routing (`/login`, `/register`, `/`)
- **Webpack 5** — Module bundler (custom config, no CRA)
- **Babel** — JSX / ES6+ transpilation
- **CSS3** — Component-scoped styles (no external UI framework)

### Backend
- **Node.js + Express 4** — REST API server
- **MongoDB + Mongoose 8** — User data persistence
- **Multer** — In-memory file upload handling
- **pdfjs-dist** — Server-side PDF text extraction
- **jsonwebtoken + bcrypt** — Auth layer
- **Google Gemini API** — Generative AI for resume analysis

---

## Architecture

```
ATS-Analyzer/
├── client/                     # React SPA
│   ├── components/
│   │   ├── Login/              # Auth screen
│   │   ├── Register/           # Sign-up screen
│   │   └── YourResumes/        # Upload + analysis dashboard
│   ├── App.jsx                 # Router setup
│   ├── main.jsx                # React 18 createRoot entry
│   ├── index.html              # HTML template
│   └── webpack.config.js       # Dev + build config with API proxy
│
└── server/                     # Express API
    ├── controllers/
    │   ├── authController.js   # Register / Login handlers
    │   └── resumeController.js # Upload + analyze handlers
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification guard
    │   └── upload.js           # Multer memoryStorage config
    ├── models/
    │   └── user.js             # Mongoose User schema
    ├── routes/
    │   ├── authRoutes.js       # POST /auth/register, /auth/login
    │   └── resumeRoutes.js     # POST /resume/upload, /resume/analyze
    ├── utils/
    │   ├── resumeParser.js     # PDF → text (pdfjs-dist)
    │   ├── keywordExtractor.js # Regex tokenization
    │   ├── atsScore.js         # Jaccard-style keyword match %
    │   └── aiAnalyzer.js       # Gemini API prompt + response parsing
    ├── .env.example            # Required env vars template
    └── server.js               # Express app bootstrap + DB connection
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (or a MongoDB Atlas URI)
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/Avila-Princy-M01/ATS-Analyzer.git
cd ATS-Analyzer
npm install
```

### 2. Environment Variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/ats-analyser
JWT_SECRET=replace_with_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Development Servers

**Terminal 1 — Backend:**
```bash
npm run server:dev
# Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
npm run client
# Webpack dev server on port 3000
```

The React dev server proxies `/auth` and `/resume` requests to `http://localhost:5000` automatically, so everything just works.

### 4. Production Build

```bash
npm run client:build
# Outputs to client/dist/
```

---

## API Reference

### Authentication

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/auth/register` | `{ name, email, password }` | `{ message: "Registered successfully" }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ token: "<jwt>" }` |

### Resume Analysis *(requires `Authorization: Bearer <token>`)*

| Method | Endpoint | Body / FormData | Response |
|--------|----------|-----------------|----------|
| `POST` | `/resume/upload` | `FormData` with `resume` (PDF file) | `{ success, preview, text }` |
| `POST` | `/resume/analyze` | `{ resumeText, jobDescription }` | `{ success, score, suggestions }` |

### Gemini Analysis Response Schema

The AI returns a structured JSON object:

```json
{
  "analysis": {
    "resume_skills": ["react", "node.js", "mongodb"],
    "job_description_skills": ["react", "typescript", "aws"],
    "missing_skills": {
      "from_resume_for_job_description": ["typescript", "aws"],
      "from_job_description_for_resume": []
    },
    "ats_optimized_bullet_point_improvements": [
      {
        "original_summary": "Built a website",
        "suggested_bullets": [
          "Developed a responsive React frontend serving 10,000+ monthly users"
        ],
        "reasoning": "Quantified impact and specified technology stack"
      }
    ],
    "ats_optimization_tips": ["Add a Skills section", "Use standard job titles"],
    "compatibility_score": 65,
    "overall_assessment": "Strong frontend background..."
  }
}
```

---

## How It Works

1. **Upload** — User selects a PDF resume. Multer buffers it in memory.
2. **Parse** — `pdfjs-dist` extracts plain text from every page of the PDF.
3. **Analyze (local)** — `keywordExtractor.js` tokenizes both the resume and a hardcoded job description. `atsScore.js` computes a simple overlap percentage.
4. **Analyze (AI)** — The full resume text + job description are sent to **Google Gemini 2.0 Flash** with a strict JSON-structured prompt.
5. **Report** — The frontend renders a modal with the compatibility score, skill lists, missing keywords, bullet rewrites, and actionable tips.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |

---

## Project Scripts

```bash
npm run server        # Start production server
npm run server:dev    # Start server with --watch (Node 18+)
npm run client        # Start webpack dev server (port 3000)
npm run client:build  # Production build (client/dist/)
```

---

## Future Roadmap

- [ ] Support `.docx` resume uploads
- [ ] Dynamic job description input (currently hardcoded for demo)
- [ ] Persistent analysis history per user
- [ ] Resume storage in MongoDB GridFS
- [ ] Enhanced keyword extraction with NLP (spaCy / natural)
- [ ] Dark mode toggle

---

## License

MIT — feel free to fork, adapt, and improve.

---

<p align="center">
  Built with ☕ + React + Node + Gemini
</p>
