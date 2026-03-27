# NetWorth Hub

NetWorth Hub is a full-stack personal finance dashboard for tracking assets, liabilities, and overall net worth in one place. It includes secure authentication with email OTP verification, profile management, import tools for CSV and Google Sheets, visual analytics, and PDF export for reports.

## Features

- User registration, login, and email OTP verification
- JWT-based authenticated API
- Add, edit, and delete assets and liabilities
- Net worth summary with total assets, liabilities, and current net worth
- Asset allocation and net worth charts
- Import data from CSV files
- Import data from Google Sheets
- Load built-in sample data for quick testing
- Profile management with picture, DOB, gender, and mobile number
- Change password flow
- Export entries, summary, and analytics views as PDF

## Tech Stack

### Frontend

- React 18
- Vite
- Axios
- Recharts
- jsPDF

### Backend

- Node.js
- Express
- SQLite
- JWT
- Nodemailer
- Google Sheets API
- Multer

## Project Structure

```text
networth_hub/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── charts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── DEPLOYMENT.md
├── render.yaml
└── README.md
```

## How It Works

1. Users register with name, email, and password.
2. The backend sends an OTP to verify the email address.
3. After verification or login, users can manage assets and liabilities.
4. The dashboard calculates totals and net worth automatically.
5. Users can import portfolio data from CSV or Google Sheets.
6. Charts and downloadable PDF reports help summarize financial position.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/`:

```env
PORT=4000
DATABASE_URL=./data/networth.db
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-long-random-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=NetWorth Hub <your-email@gmail.com>

GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SCOPES=https://www.googleapis.com/auth/spreadsheets.readonly
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 4. Start the backend

```bash
cd backend
npm run dev
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` by default and connects to the backend on `http://localhost:4000`.

## CSV Import Format

CSV uploads should follow this header format:

```csv
Type,Category,Name,Amount,Notes
Asset,Mutual Funds,Axis ELSS,89043.62,Long term investment
Liability,Loan,Car Loan,250000,Monthly EMI
```

- `Type` should be `Asset` or `Liability`
- `Amount` should be numeric
- `Notes` is optional

## API Overview

### Public routes

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `GET /health`

### Protected routes

- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`
- `GET /api/assets`
- `POST /api/assets`
- `PUT /api/assets/:id`
- `DELETE /api/assets/:id`
- `GET /api/assets/:id`
- `GET /api/liabilities`
- `POST /api/liabilities`
- `PUT /api/liabilities/:id`
- `DELETE /api/liabilities/:id`
- `GET /api/liabilities/:id`
- `GET /api/networth/summary`
- `GET /api/networth/asset-allocation`
- `POST /api/import/google-sheet`
- `POST /api/import/csv`
- `POST /api/import/sample`

## Deployment

This repo is already structured for:

- Frontend deployment on Vercel
- Backend deployment on Render
- SQLite persistence using a Render disk

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment details.

## Notes

- The backend creates the SQLite schema automatically on startup.
- CORS is controlled through the `CORS_ORIGIN` environment variable.
- The frontend stores the auth token in browser local storage.
- Google Sheets import requires service account credentials.
- Email OTP requires a working SMTP configuration.

## Scripts

### Backend

- `npm start` - start production server
- `npm run dev` - start backend with nodemon

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build locally

## Future Improvements

- Net worth history over time
- Recurring liabilities and cash flow tracking
- Better category analytics and filters
- Automated tests
- Multi-currency support

## License

This project is available for personal or educational use. Add your preferred license here before publishing publicly.
