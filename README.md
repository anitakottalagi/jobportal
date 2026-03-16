# JobPortal — Full Stack Job Portal

React 17 + Node/Express + PostgreSQL job portal with auth, job matching, and application tracking.

---

## Run Locally

### 1. PostgreSQL setup
```sql
CREATE DATABASE jobportal;
```

### 2. Backend
```bash
cd backend
npm install
# Edit .env with your DB credentials
npm start
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## Deploy Live (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/jobportal.git
git push -u origin main
```

---

### Step 2 — Free PostgreSQL on Neon

1. Go to https://neon.tech and sign up (free)
2. Create a new project → copy the **Connection string**
   - Looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

---

### Step 3 — Deploy Backend on Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo → select the `backend` folder as root directory
3. Set these fields:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | your Neon connection string |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `INDIAN_API_KEY` | `sk-live-DE89UuFNVSpdSJLOt5GflFAm9IF1Pikl3jXPPCo9` |
   | `INDIAN_API_URL` | `https://jobs.indianapi.in` |
   | `FRONTEND_URL` | *(fill in after Vercel deploy)* |
5. Deploy → copy your Render URL e.g. `https://jobportal-backend.onrender.com`

---

### Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | your Render backend URL (no trailing slash) |
4. Deploy → copy your Vercel URL e.g. `https://jobportal.vercel.app`

---

### Step 5 — Connect them

Go back to Render → your backend service → Environment → update `FRONTEND_URL` to your Vercel URL → Save (auto-redeploys).

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | Login |
| GET | /auth/me | ✅ | Get current user |
| GET | /jobs | ❌ | List all jobs (sorted by match %) |
| POST | /jobs/fetch-from-api | ❌ | Refresh jobs from external API |
| GET | /profile | ✅ | Get user profile |
| POST | /profile | ✅ | Create profile |
| PUT | /profile/:id | ✅ | Update profile |
| GET | /applications | ✅ | List my applications |
| POST | /applications | ✅ | Submit application |
| DELETE | /applications/:id | ✅ | Remove application |
