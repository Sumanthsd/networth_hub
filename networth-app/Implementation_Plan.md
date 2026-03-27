## Net Worth Dashboard – Implementation Plan

### 1. System Architecture

**Overview**

- **Frontend**: React + Vite SPA, communicates with backend via REST (JSON).
- **Backend**: Node.js + Express, structured with controllers/services/models.
- **Database**: SQLite (local file, e.g. `networth.db`).
- **Integration**: Google Sheets via `googleapis` (Sheets API v4).
- **Communication**: Frontend uses `axios` for all HTTP requests.

#### 1.1 Frontend Architecture

- **Framework**: React (functional components, hooks).
- **Build Tool**: Vite (fast dev server, optimized builds).
- **Routing**: Single main dashboard page (can be extended later with React Router).
- **State Management**:
  - Local state via `useState` / `useEffect` in page-level component.
  - Optionally extract into `useNetWorthData` custom hook if logic grows.
- **Data Fetching**:
  - REST calls through `axios` instance configured with `VITE_API_BASE_URL`.
  - Services layer on the frontend (`services/*.js`) abstracts API endpoints.
- **UI Components**:
  - Dashboard layout, summary cards, tables, forms, and charts.
  - Clean separation between presentational components and data-fetching logic.

#### 1.2 Backend Architecture

- **Framework**: Express app with layered structure:
  - `routes` → map URL paths to controllers.
  - `controllers` → HTTP-level logic (parse/validate requests, call services, shape responses).
  - `services` → business logic (CRUD orchestration, calculations, Google Sheets import).
  - `models` → database access (SQLite queries).
  - `config` → database and Google API configuration, environment handling.
- **Middleware**:
  - JSON body parsing (`express.json()`).
  - CORS enabled to allow frontend dev server access.
  - Central error handler for consistent error responses.
- **Database Access**:
  - Simple wrapper using `sqlite3` or `better-sqlite3`.
  - Initialization script to create tables if they do not exist at startup.

#### 1.3 Database

- **Engine**: SQLite file `networth.db` located in backend directory (configurable via `DATABASE_URL`).
- **Usage**:
  - Sufficient for local development and small personal dashboards.
  - Single-writer, multi-reader model fits this use case.
- **Migration Strategy**:
  - On server startup, run schema initialization (CREATE TABLE IF NOT EXISTS).
  - All schema definitions live in a single `schemaInit.js` file for simplicity.

#### 1.4 Google Sheets Integration

- **Library**: `googleapis` (Sheets v4).
- **Auth**:
  - Use Google Service Account credentials from environment (`GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`).
  - Backend owns the integration; frontend never sees credentials.
  - The user must share their Google Sheet with the service account email.
- **Flow**:
  1. User pastes Google Sheet URL (and optional sheet name) into frontend form.
  2. Frontend calls backend `POST /api/import/google-sheet` with the URL (and optional sheet name).
  3. Backend parses spreadsheet ID from the URL, constructs Sheets API client, fetches values.
  4. Backend converts rows into `Asset` or `Liability` entities.
  5. Backend clears existing asset/liability records (replace mode) and inserts imported records.
  6. Backend returns import counts and updated net worth summary.
- **Security**:
  - All secrets kept in backend `.env`.
  - Proper handling of `GOOGLE_PRIVATE_KEY` newlines.

#### 1.5 API Design

- **Base URL**: `/api`
- **Resources**:
  - `/assets` – CRUD for assets.
  - `/liabilities` – CRUD for liabilities.
  - `/networth` – summary and charts data.
  - `/import` – Google Sheets import endpoint.
- **Conventions**:
  - JSON request/response bodies.
  - Standard HTTP verbs and status codes.
  - Consistent error shape: `{ message, details? }`.

---

### 2. Features & Mapping

#### 2.1 Import Data from Google Sheet

- **Frontend**:
  - `ImportSheetForm` component with:
    - Text input for Google Sheet URL.
    - Optional text input for sheet name.
    - Import button.
  - Displays loading indicator and success/error messages.
  - On success, triggers refresh of assets, liabilities, summary, and charts.
- **Backend**:
  - `POST /api/import/google-sheet`
    - Body: `{ sheetUrl: string; sheetName?: string }`.
    - Steps:
      1. Validate that `sheetUrl` is present.
      2. Extract `spreadsheetId` from the URL.
      3. Determine range (default `Sheet1!A:E` or first sheet).
      4. Call Google Sheets API to get rows.
      5. Parse rows into typed `Asset` and `Liability` objects.
      6. Truncate `assets` and `liabilities` tables.
      7. Insert new records.
      8. Compute and return import counts and net worth summary.

#### 2.2 Display User's Net Worth

- **Backend**:
  - `NetWorthService.getSummary()`:
    - Computes:
      - `totalAssets = SUM(assets.amount)`
      - `totalLiabilities = SUM(liabilities.amount)`
      - `netWorth = totalAssets - totalLiabilities`
  - Endpoint: `GET /api/networth/summary` → returns `NetWorthSummary`.
- **Frontend**:
  - `SummaryCards` component shows:
    - Total Net Worth.
    - Total Assets.
    - Total Liabilities.
  - Fetches summary on initial load and after CRUD/import operations.

#### 2.3 Show Assets and Liabilities

- **Backend**:
  - `GET /api/assets` → list all assets.
  - `GET /api/liabilities` → list all liabilities.
- **Frontend**:
  - `AssetsTable` and `LiabilitiesTable` components:
    - Columns: Category, Name, Amount, Notes, Created At, Actions.
    - Uses simple HTML table with responsive styling.

#### 2.4 Add New Entries

- **Backend**:
  - `POST /api/assets`
  - `POST /api/liabilities`
  - Validates required fields (`category`, `name`, `amount`).
  - Inserts new row and returns created entity.
- **Frontend**:
  - `AssetFormModal` / `LiabilityFormModal`:
    - Mode `"create"`:
      - Empty initial values.
      - On submit, call respective POST endpoint.
    - On success:
      - Close modal.
      - Refresh list and summary / charts.

#### 2.5 Edit Existing Entries

- **Backend**:
  - `PUT /api/assets/:id`
  - `PUT /api/liabilities/:id`
  - Validates payload, updates DB, and returns updated entity.
- **Frontend**:
  - Edit button in each row opens modal in `"edit"` mode with prefilled values.
  - On submit, call PUT endpoint and refresh state on success.

#### 2.6 Delete Entries

- **Backend**:
  - `DELETE /api/assets/:id`
  - `DELETE /api/liabilities/:id`
- **Frontend**:
  - Delete button with confirmation prompt.
  - On confirm, call DELETE endpoint, then refresh list and summary.

#### 2.7 Automatic Net Worth Calculation

- **Backend**:
  - Net worth computation centralized in `NetWorthService`.
  - Reused by summary endpoint and import result.
- **Frontend**:
  - Never calculates totals itself.
  - Always fetches summary from backend after data changes.

#### 2.8 Dashboard with Charts

- **Asset Allocation Pie Chart**:
  - Backend:
    - `GET /api/networth/asset-allocation`
    - Returns `{ category: string; totalAmount: number }[]` grouped by asset category.
  - Frontend:
    - `AssetAllocationChart` component using `recharts` or `chart.js` to render pie chart.
- **Net Worth Summary Chart**:
  - Backend:
    - Uses `GET /api/networth/summary`.
  - Frontend:
    - `NetWorthBarChart` component:
      - Renders bar chart with three bars: Total Assets, Total Liabilities, Net Worth.
      - Simple visualization without historical data (can be extended later).

---

### 3. Data Model

#### 3.1 Domain Models

- **Asset**
  - `id: number`
  - `category: string`
  - `name: string`
  - `amount: number`
  - `notes?: string | null`
  - `createdAt: string` (ISO timestamp)

- **Liability**
  - `id: number`
  - `category: string`
  - `name: string`
  - `amount: number`
  - `notes?: string | null`
  - `createdAt: string` (ISO timestamp)

- **NetWorthSummary**
  - `totalAssets: number`
  - `totalLiabilities: number`
  - `netWorth: number`

- **AssetAllocationEntry**
  - `category: string`
  - `totalAmount: number`

#### 3.2 SQLite Schema

- **Table `assets`**
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `category TEXT NOT NULL`
  - `name TEXT NOT NULL`
  - `amount REAL NOT NULL`
  - `notes TEXT`
  - `created_at TEXT NOT NULL`

- **Table `liabilities`**
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `category TEXT NOT NULL`
  - `name TEXT NOT NULL`
  - `amount REAL NOT NULL`
  - `notes TEXT`
  - `created_at TEXT NOT NULL`

- **Optional Table `settings`**
  - `key TEXT PRIMARY KEY`
  - `value TEXT`
  - Used to store metadata like last imported sheet URL (future enhancement).

---

### 4. Google Sheets Integration Details

#### 4.1 Expected Sheet Format

- Columns (header row):
  - `Type` | `Category` | `Name` | `Amount` | `Notes`
- Example rows:
  - `Asset | Equity | Zerodha | 500000 | Stocks`
  - `Asset | Bank | Savings Account | 200000 |`
  - `Liability | Loan | Home Loan | 2500000 |`

#### 4.2 Parsing Logic

- Skip the first row as headers.
- For each subsequent row:
  - `type = row[0]?.trim()` (case-insensitive).
    - If `"asset"` → create Asset.
    - If `"liability"` → create Liability.
    - Otherwise, skip row or log warning.
  - `category = row[1]?.trim() || "Uncategorized"`
  - `name = row[2]?.trim()` (required).
  - `amount = parseFloat(row[3])` (required; default to 0 if invalid, with validation).
  - `notes = row[4]?.trim() || null`
  - `created_at = current timestamp` (import time).

#### 4.3 Import Strategy

- **Mode**: Replace existing data by default.
  - Truncate `assets` and `liabilities` tables before inserting new data.
  - Guarantees the dashboard matches the current state of the Google Sheet.
- **Endpoint**: `POST /api/import/google-sheet`
  - Request:
    - `sheetUrl: string`
    - `sheetName?: string` (optional; default to `Sheet1` or first sheet).
  - Response:
    - `assetsImported: number`
    - `liabilitiesImported: number`
    - `summary: NetWorthSummary`
- **Error Handling**:
  - Invalid URL → 400 with clear message.
  - Unauthorized / sheet not shared → 400/500 with user-friendly message.
  - Format issues (missing headers/columns) → 400 with explanation.

#### 4.4 Backend Google Client

- Config module `googleClient.js`:
  - Reads `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
  - Creates JWT auth client with Sheets scope.
  - Exposes an initialized `sheets` client instance for services.

---

### 5. Backend Design

#### 5.1 Directory Structure

- `backend/`
  - `server.js` – Express app entry point.
  - `config/`
    - `db.js` – SQLite connection and helper.
    - `env.js` – environment variable loading and validation.
    - `googleClient.js` – Google Sheets API client configuration.
  - `models/`
    - `assetModel.js` – CRUD + truncate for assets.
    - `liabilityModel.js` – CRUD + truncate for liabilities.
    - `schemaInit.js` – creates tables on startup.
  - `services/`
    - `assetService.js`
    - `liabilityService.js`
    - `netWorthService.js`
    - `googleSheetService.js`
  - `controllers/`
    - `assetController.js`
    - `liabilityController.js`
    - `netWorthController.js`
    - `importController.js`
  - `routes/`
    - `assetRoutes.js`
    - `liabilityRoutes.js`
    - `netWorthRoutes.js`
    - `importRoutes.js`
    - `index.js` – mounts all route modules under `/api`.
  - `middleware/`
    - `errorHandler.js`
  - `.env.example`
  - `package.json`

#### 5.2 Express Endpoints

- **Assets**
  - `GET /api/assets` – list assets.
  - `GET /api/assets/:id` – get single asset.
  - `POST /api/assets` – create asset.
  - `PUT /api/assets/:id` – update asset.
  - `DELETE /api/assets/:id` – delete asset.

- **Liabilities**
  - `GET /api/liabilities`
  - `GET /api/liabilities/:id`
  - `POST /api/liabilities`
  - `PUT /api/liabilities/:id`
  - `DELETE /api/liabilities/:id`

- **Net Worth**
  - `GET /api/networth/summary` – returns `NetWorthSummary`.
  - `GET /api/networth/asset-allocation` – returns asset allocation by category.

- **Import**
  - `POST /api/import/google-sheet` – imports data from Google Sheet.

#### 5.3 Services Responsibilities

- **AssetService**
  - Calls `assetModel` for DB operations.
  - Validates inputs for create/update.
- **LiabilityService**
  - Same pattern as `AssetService`.
- **NetWorthService**
  - Provides `getSummary()` and `getAssetAllocation()`.
  - Uses aggregate queries on `assets` and `liabilities`.
- **GoogleSheetService**
  - `importFromSheet({ sheetUrl, sheetName? })`:
    - Parses sheet URL.
    - Fetches values via Sheets API.
    - Converts rows into domain models.
    - Truncates and bulk-inserts into DB.
    - Returns import results and summary.

#### 5.4 Error Handling

- Central `errorHandler` middleware:
  - Catches thrown errors from controllers/services.
  - Maps known errors (validation, Google API) to appropriate HTTP codes.
  - Returns JSON with message and optional details.

---

### 6. Frontend Design

#### 6.1 Directory Structure

- `frontend/`
  - `src/`
    - `main.jsx` – React entry.
    - `App.jsx` – high-level layout + routing.
    - `pages/`
      - `DashboardPage.jsx`
    - `components/`
      - `Layout/`
        - `Header.jsx`
        - `Container.jsx`
      - `Dashboard/`
        - `SummaryCards.jsx`
        - `ImportSheetForm.jsx`
        - `AssetsTable.jsx`
        - `LiabilitiesTable.jsx`
        - `AssetFormModal.jsx`
        - `LiabilityFormModal.jsx`
        - `DeleteConfirmDialog.jsx`
    - `charts/`
      - `AssetAllocationChart.jsx`
      - `NetWorthBarChart.jsx`
    - `services/`
      - `apiClient.js`
      - `assetService.js`
      - `liabilityService.js`
      - `netWorthService.js`
      - `importService.js`
    - `styles/`
      - `globals.css`
  - `vite.config.js`
  - `.env.example`
  - `package.json`

#### 6.2 Dashboard Layout & UX

- **Header**
  - Title: “Net Worth Dashboard”.
  - Optional description/subtitle.

- **Main Content Sections**
  - **Top**: `SummaryCards` + `ImportSheetForm`.
  - **Middle**: charts row with `AssetAllocationChart` and `NetWorthBarChart`.
  - **Bottom**: two-column layout:
    - Left: `AssetsTable` with “Add Asset” button.
    - Right: `LiabilitiesTable` with “Add Liability” button.

- **Modals**
  - `AssetFormModal` / `LiabilityFormModal`:
    - Controlled open/close state.
    - Reused for create and edit.
  - `DeleteConfirmDialog`:
    - Simple confirmation for deletions.

#### 6.3 Data Flow

- `DashboardPage` component:
  - State:
    - `assets`, `liabilities`, `summary`, `allocationData`.
    - Loading flags and error messages.
    - Modal state (`isAssetModalOpen`, `editingAsset`, etc.).
  - Effects:
    - On mount, fetch:
      - `getAssets()`
      - `getLiabilities()`
      - `getSummary()`
      - `getAssetAllocation()`
  - Handlers:
    - `handleImport` → call `importService.importFromGoogleSheet`, then refresh data.
    - `handleCreateAsset`, `handleUpdateAsset`, `handleDeleteAsset` → call backend services, then refresh data.
    - Same pattern for liabilities.

---

### 7. Frontend API Services

- **`apiClient.js`**
  - Creates an `axios` instance with:
    - `baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"`
  - Optional response interceptor to normalize errors.

- **`assetService.js`**
  - `getAssets()`
  - `createAsset(data)`
  - `updateAsset(id, data)`
  - `deleteAsset(id)`

- **`liabilityService.js`**
  - `getLiabilities()`
  - `createLiability(data)`
  - `updateLiability(id, data)`
  - `deleteLiability(id)`

- **`netWorthService.js`**
  - `getSummary()`
  - `getAssetAllocation()`

- **`importService.js`**
  - `importFromGoogleSheet({ sheetUrl, sheetName })`

---

### 8. Environment & Configuration

#### 8.1 Backend `.env.example`

- `PORT=4000`
- `DATABASE_URL=./networth.db`
- `GOOGLE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com`
- `GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"`
- `GOOGLE_SHEETS_SCOPES=https://www.googleapis.com/auth/spreadsheets.readonly`

#### 8.2 Frontend `.env.example`

- `VITE_API_BASE_URL=http://localhost:4000`

---

### 9. Running the Project (Planned)

- **Backend**
  - `cd backend`
  - `npm install`
  - `npm run dev` (using `nodemon` or similar).

- **Frontend**
  - `cd frontend`
  - `npm install`
  - `npm run dev`

---

### 10. Quality & Extension Considerations

- **Code Quality**
  - Layered architecture, clear boundaries between concerns.
  - Clean, modern React patterns (hooks, small components).
  - Minimal but meaningful comments for non-obvious logic (e.g., sheet parsing).
- **Future Extensions**
  - Add authentication and multi-user support.
  - Track historical net worth snapshots for time-series charts.
  - Support multiple sheets or multiple portfolios.

