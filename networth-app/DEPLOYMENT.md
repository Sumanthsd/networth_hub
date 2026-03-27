# NetWorth Hub Deployment

## Stack

- Frontend: Vercel
- Backend: Render
- Database: SQLite on a Render persistent disk

## 1. Push This Project To GitHub

Create a GitHub repository and push the `networth-app` folder contents.

## 2. Deploy Backend On Render

Use the `render.yaml` file in this repo or create the service manually.

Manual settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`

Environment variables to set on Render:

- `DATABASE_URL=/opt/render/project/src/data/networth.db`
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`
- `JWT_SECRET=your-long-random-secret`
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASS=your-google-app-password`
- `MAIL_FROM=NetWorth Hub <your-email@gmail.com>`
- `GOOGLE_CLIENT_EMAIL=...`
- `GOOGLE_PRIVATE_KEY=...`
- `GOOGLE_SHEETS_SCOPES=https://www.googleapis.com/auth/spreadsheets.readonly`

Attach a persistent disk:

- Mount Path: `/opt/render/project/src/data`
- Size: `1 GB` or more

After deploy, note the backend URL, for example:

- `https://networth-hub-api.onrender.com`

Check health:

- `https://networth-hub-api.onrender.com/health`

## 3. Deploy Frontend On Vercel

Import the same GitHub repo into Vercel.

Project settings:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

- `VITE_API_BASE_URL=https://your-backend-name.onrender.com`

After deploy, note the frontend URL, for example:

- `https://networth-hub.vercel.app`

## 4. Final Step

Once the frontend URL is live, update Render:

- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

Then redeploy the backend if needed.

## Important

- A real public website link is created only after you connect your GitHub repo to your own Render and Vercel accounts.
- I can prepare the project here, but I cannot create the hosted public URL from inside this local workspace without your deployment accounts.
