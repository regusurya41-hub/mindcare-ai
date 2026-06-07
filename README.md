# MindCare AI

MindCare AI is a privacy-first emotional wellness platform with anonymous AI chat, mood tracking, journaling, supportive resources, and anonymous community posts.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Recharts
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- AI: OpenAI API with crisis-aware safety guardrails

## Project Structure

```txt
mindcare-ai/
  frontend/
  backend/
  README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Environment

Backend variables:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: strong signing secret
- `OPENAI_API_KEY`: OpenAI API key
- `CLIENT_URL`: frontend URL for CORS

Frontend variables:

- `VITE_API_URL`: backend API base URL

## Deployment

### Frontend on Vercel

You can deploy from either the repository root or the `frontend/` folder.

Root deployment is already configured by `vercel.json`:

- Build command: `cd frontend && npm install && npm run build`
- Output directory: `frontend/dist`

Frontend-folder deployment is configured by `frontend/vercel.json`:

- Build command: `npm run build`
- Output directory: `dist`

Add `VITE_API_URL` in Vercel, pointing to the Render backend URL, for example:

```txt
VITE_API_URL=https://your-render-api.onrender.com/api
```

### Backend on Render

1. Create a Web Service using `backend/` as the root.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, and `CLIENT_URL`.

## Safety Note

MindCare AI is supportive wellness software, not medical care. Crisis detection routes users toward emergency support, trusted people, and professional resources.
Trigger redeploy 
