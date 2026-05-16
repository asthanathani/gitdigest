# GitDigest

An AI-powered developer tool that explains any GitHub repository in plain English.

## What it does

Paste any GitHub repo URL and instantly get:
- Plain English summary of what the project does
- Tech stack used
- How the codebase is structured
- How to contribute as a beginner
- Difficulty level

## Tech Stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **AI:** Groq API (LLaMA 3.3)
- **Data:** GitHub REST API

## Run Locally

### Backend
```bash
cd server
npm install
cp .env.example .env
# Add your API keys to .env
node index.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables

Create `server/.env` with:
