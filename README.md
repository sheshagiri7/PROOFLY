# 🎯 PROOFLY — Evidence-First Recruitment Intelligence Platform

PROOFLY is an explainable, evidence-first AI recruitment platform designed to eliminate bias and surface verified skill evidence from candidate resumes.

---

## 🚀 Quick Start (Any Operating System)

PROOFLY runs seamlessly across **macOS**, **Windows**, and **Linux**.

### Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes bundled with Node.js)

---

## 🛠️ Setup & Installation

1. **Clone the Repository**
   ```bash
   git clone git@github.com:sheshagiri7/PROOFLY.git
   cd PROOFLY
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   *Note: `npm install` automatically triggers postinstall hooks to install client dependencies and build native SQLite bindings for your operating system.*

3. **Configure Environment (Optional)**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

---

## 🏃 Running the Application

### Development Mode (Backend + Frontend)
Run both the Express API server (port `5001`) and Vite React frontend (port `5173`) concurrently:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

### Independent Services
- **Backend API Server**: `npm run server`
- **Frontend Client**: `npm run client`

---

## 🧪 Testing

Run automated tests using Vitest:
```bash
npm test
```

---

## 🏗️ Production Build

Build the React client for production distribution:
```bash
npm run build
```

---

## 🔐 Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Candidate** | `alex.rivera@example.com` | `Candidate123!` |
| **Recruiter** | `recruiter@proofly.ai` | `Recruiter123!` |
| **Admin** | `admin@proofly.ai` | `Admin123!` |

---

## 📂 Project Architecture

```
PROOFLY/
├── client/              # Vite + React + TypeScript + Tailwind CSS Frontend
│   ├── src/             # UI Components, Pages, and Context Providers
│   └── vite.config.ts   # Vite Configuration & Proxy Rules
├── server/              # Express + TypeScript + SQLite Backend
│   ├── db/              # SQLite Database Schema & Seed Data
│   ├── routes/          # API Routes (Auth, Resumes, Jobs, Candidates, Lab)
│   └── services/        # AI Scoring, Parsing, Evidence & Audit Engines
├── tests/               # Vitest Test Suites
└── data/                # SQLite Database Storage (Auto-created)
```

---

## 📄 License
ISC License. Designed for universal cross-platform execution.
