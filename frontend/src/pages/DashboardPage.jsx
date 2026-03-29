import { useEffect, useRef, useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import SummaryCards from '../components/Dashboard/SummaryCards.jsx';
import ImportSheetForm from '../components/Dashboard/ImportSheetForm.jsx';
import AssetsTable from '../components/Dashboard/AssetsTable.jsx';
import LiabilitiesTable from '../components/Dashboard/LiabilitiesTable.jsx';
import AssetAllocationChart from '../charts/AssetAllocationChart.jsx';
import NetWorthBarChart from '../charts/NetWorthBarChart.jsx';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../services/assetService.js';
import {
  getLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
} from '../services/liabilityService.js';
import {
  getSummary,
  getAssetAllocation,
} from '../services/netWorthService.js';
import { updateProfile } from '../services/authService.js';
import {
  importFromGoogleSheet,
  importFromCsvFile,
  importSampleData,
} from '../services/importService.js';
import { openImageReport, openPrintableReport } from '../utils/pdfExport.js';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

function DetailsIcon() {
  return (
    <span className="clerk-custom-page-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M8 6.75A1.25 1.25 0 1 1 8 9.25A1.25 1.25 0 0 1 8 6.75Z" />
        <path d="M8 10.75A1.25 1.25 0 1 1 8 13.25A1.25 1.25 0 0 1 8 10.75Z" />
        <path d="M8 14.75A1.25 1.25 0 1 1 8 17.25A1.25 1.25 0 0 1 8 14.75Z" />
        <path d="M11.5 8H16.75" />
        <path d="M11.5 12H16.75" />
        <path d="M11.5 16H16.75" />
      </svg>
    </span>
  );
}

export default function DashboardPage({ user, onUserChange }) {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allocation, setAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    mobile: user.mobile || '',
    dob: user.dob || '',
    gender: user.gender || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const allocationRef = useRef(null);
  const snapshotRef = useRef(null);

  const hasAssetData = assets.length > 0;
  const hasLiabilityData = liabilities.length > 0;
  const hasSummaryData =
    (summary?.totalAssets || 0) !== 0 ||
    (summary?.totalLiabilities || 0) !== 0 ||
    (summary?.netWorth || 0) !== 0;
  const hasAllocationData = allocation.length > 0;

  async function loadAll() {
    try {
      setError('');
      setLoading(true);
      const [assetsRes, liabilitiesRes, summaryRes, allocationRes] =
        await Promise.all([
          getAssets(),
          getLiabilities(),
          getSummary(),
          getAssetAllocation(),
        ]);
      setAssets(assetsRes);
      setLiabilities(liabilitiesRes);
      setSummary(summaryRes);
      setAllocation(allocationRes);
    } catch (err) {
      setError(err?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    setProfileForm({
      mobile: user.mobile || '',
      dob: user.dob || '',
      gender: user.gender || '',
    });
  }, [user]);

  async function handleImport(payload) {
    const result = await importFromGoogleSheet(payload);
    await loadAll();
    return result;
  }

  async function handleImportCsv(file) {
    const result = await importFromCsvFile(file);
    await loadAll();
    return result;
  }

  async function handleLoadSample() {
    const result = await importSampleData();
    await loadAll();
    return result;
  }

  async function handleCreateAsset(payload) {
    await createAsset(payload);
    await loadAll();
  }

  async function handleUpdateAsset(id, payload) {
    await updateAsset(id, payload);
    await loadAll();
  }

  async function handleDeleteAsset(id) {
    await deleteAsset(id);
    await loadAll();
  }

  async function handleCreateLiability(payload) {
    await createLiability(payload);
    await loadAll();
  }

  async function handleUpdateLiability(id, payload) {
    await updateLiability(id, payload);
    await loadAll();
  }

  async function handleDeleteLiability(id) {
    await deleteLiability(id);
    await loadAll();
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMessage('');

      const response = await updateProfile(profileForm);
      onUserChange(response.user);
      setProfileMessage('Profile details saved.');
    } catch (err) {
      setProfileMessage(err?.message || 'Failed to save profile details.');
    } finally {
      setProfileSaving(false);
    }
  }

  function exportEntriesPdf() {
    openPrintableReport('NetWorth Hub - Assets and Liabilities', [
      {
        title: 'Assets',
        type: 'table',
        columns: ['Category', 'Name', 'Amount', 'Notes'],
        rows: assets.map((asset) => [
          asset.category,
          asset.name,
          formatCurrency(asset.amount),
          asset.notes || '-',
        ]),
      },
      {
        title: 'Liabilities',
        type: 'table',
        columns: ['Category', 'Name', 'Amount', 'Notes'],
        rows: liabilities.map((liability) => [
          liability.category,
          liability.name,
          formatCurrency(liability.amount),
          liability.notes || '-',
        ]),
      },
    ]);
  }

  function exportSummaryPdf() {
    openPrintableReport('NetWorth Hub - Summary', [
      {
        title: 'Financial Summary',
        type: 'list',
        items: [
          `Net Worth: ${formatCurrency(summary?.netWorth)}`,
          `Total Assets: ${formatCurrency(summary?.totalAssets)}`,
          `Total Liabilities: ${formatCurrency(summary?.totalLiabilities)}`,
        ],
      },
    ]);
  }

  async function exportAnalyticsPdf() {
    await openImageReport('NetWorth Hub - Allocation and Snapshot', [
      {
        title: 'Asset Allocation',
        element: allocationRef.current,
      },
      {
        title: 'Net Worth Snapshot',
        element: snapshotRef.current,
      },
    ]);
  }

  function renderProfileDetailsPage() {
    return (
      <form className="profile-panel" onSubmit={handleProfileSave}>
        <div className="profile-panel-copy">
          <div className="profile-panel-title">Additional profile details</div>
          <div className="card-sub">
            Add optional details for your NetWorth Hub profile. Your email and account security remain managed by Clerk.
          </div>
        </div>
        <div className="profile-grid">
          <label className="label profile-field">
            <span>Mobile</span>
            <input
              className="input profile-input"
              placeholder="Optional mobile number"
              type="tel"
              value={profileForm.mobile}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  mobile: event.target.value,
                }))
              }
            />
          </label>

          <label className="label profile-field">
            <span>Date of Birth</span>
            <input
              className="input profile-input"
              type="date"
              value={profileForm.dob}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  dob: event.target.value,
                }))
              }
            />
          </label>

          <label className="label profile-field">
            <span>Gender</span>
            <select
              className="select profile-input"
              value={profileForm.gender}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  gender: event.target.value,
                }))
              }
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>
        <div className="profile-actions">
          <button className="btn btn-primary" disabled={profileSaving} type="submit">
            {profileSaving ? 'Saving...' : 'Save Details'}
          </button>
          {profileMessage && <div className="card-sub profile-message">{profileMessage}</div>}
        </div>
      </form>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <div className="hero-kicker">Financial command center</div>
            <h1>{`Welcome back, ${user.name?.split(' ')[0] || 'there'}.`}</h1>
            <p>
              Track assets, liabilities, imports, and net worth from one calm workspace with
              faster account handling through Clerk.
            </p>
            <div className="hero-inline-stats">
              <div className="hero-stat">
                <span className="hero-stat-label">Net worth</span>
                <span className="hero-stat-value">{formatCurrency(summary?.netWorth)}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Assets</span>
                <span className="hero-stat-value">{assets.length}</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-label">Liabilities</span>
                <span className="hero-stat-value">{liabilities.length}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-tile">
          <div className="tile-header">
            <div>
              <div className="tile-title">Add Assets and Liabilities</div>
              <div className="card-sub">
                Start here by adding the data that powers the rest of the dashboard.
              </div>
            </div>
            <button
              className="btn btn-outline"
              type="button"
              onClick={exportEntriesPdf}
              disabled={!hasAssetData && !hasLiabilityData}
            >
              Export PDF
            </button>
          </div>
          <div className="grid grid-2">
            <AssetsTable
              assets={assets}
              onCreate={handleCreateAsset}
              onUpdate={handleUpdateAsset}
              onDelete={handleDeleteAsset}
              loading={loading}
            />
            <LiabilitiesTable
              liabilities={liabilities}
              onCreate={handleCreateLiability}
              onUpdate={handleUpdateLiability}
              onDelete={handleDeleteLiability}
              loading={loading}
            />
          </div>
        </section>

        <section className="dashboard-tile mt-md">
          <div className="tile-header">
            <div>
              <div className="tile-title">Net Worth Summary</div>
              <div className="card-sub">
                A quick summary of your current assets, liabilities, and overall worth.
              </div>
            </div>
            <button
              className="btn btn-outline"
              type="button"
              onClick={exportSummaryPdf}
              disabled={!hasSummaryData}
            >
              Export PDF
            </button>
          </div>
          <SummaryCards summary={summary} />
        </section>

        <section className="dashboard-tile mt-md">
          <div className="tile-header">
            <div>
              <div className="tile-title">Allocation and Snapshot</div>
              <div className="card-sub">
                Visual insights into how your money is distributed right now.
              </div>
            </div>
            <button
              className="btn btn-outline"
              type="button"
              onClick={exportAnalyticsPdf}
              disabled={!hasAllocationData && !hasSummaryData}
            >
              Export PDF
            </button>
          </div>
          <div className="grid grid-2">
            <div ref={allocationRef}>
              <AssetAllocationChart data={allocation} />
            </div>
            <div ref={snapshotRef}>
              <NetWorthBarChart summary={summary} />
            </div>
          </div>
        </section>

        <section className="dashboard-tile mt-md">
          <div className="tile-header">
            <div>
              <div className="tile-title">Upload and Sheets</div>
              <div className="card-sub">
                Import your data from CSV or pull it in from Google Sheets.
              </div>
            </div>
          </div>
          <ImportSheetForm
            onImport={handleImport}
            onImportCsv={handleImportCsv}
            onLoadSample={handleLoadSample}
          />
        </section>
      </>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="top-nav">
          <div className="brand-mark">
            <span className="brand-icon">N</span>
            <div>
              <div className="brand-name">NetWorth Hub</div>
              <div className="brand-subtitle">Personal net worth cockpit</div>
            </div>
          </div>
          <div className="account-shell">
            <div className="clerk-button-wrap">
              <UserButton
                userProfileMode="modal"
                appearance={{
                  elements: {
                    avatarBox: 'clerk-avatar-box',
                  },
                }}
                userProfileProps={{
                  apiKeysProps: {
                    hide: true,
                  },
                  appearance: {
                    elements: {
                      modalContent: 'clerk-profile-modal',
                      cardBox: 'clerk-profile-card',
                      navbar: 'clerk-profile-navbar',
                      pageScrollBox: 'clerk-profile-scroll',
                    },
                  },
                }}
              >
                <UserButton.UserProfilePage
                  label="Additional details"
                  labelIcon={<DetailsIcon />}
                  url="additional-details"
                >
                  {renderProfileDetailsPage()}
                </UserButton.UserProfilePage>
              </UserButton>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-sm auth-header-stack">
          <div>
            <div className="app-header-title">A sharper view of your money</div>
            <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Bring together balances, obligations, imports, and snapshots in one polished workspace.
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        {renderDashboard()}
        {error && <div className="error mt-md">{error}</div>}
      </main>
    </div>
  );
}
