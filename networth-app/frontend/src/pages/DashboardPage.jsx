import { useEffect, useRef, useState } from 'react';
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
import {
  importFromGoogleSheet,
  importFromCsvFile,
  importSampleData,
} from '../services/importService.js';
import { changePassword, updateProfile } from '../services/authService.js';
import { openImageReport, openPrintableReport } from '../utils/pdfExport.js';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

function buildDraft(user) {
  return {
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    profilePic: user?.profilePic || '',
  };
}

export default function DashboardPage({ user, onUserChange, onLogout }) {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [allocation, setAllocation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [profileDraft, setProfileDraft] = useState(buildDraft(user));
  const [editableFields, setEditableFields] = useState({});
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const menuRef = useRef(null);
  const allocationRef = useRef(null);
  const snapshotRef = useRef(null);

  const hasAssetData = assets.length > 0;
  const hasLiabilityData = liabilities.length > 0;
  const hasSummaryData =
    (summary?.totalAssets || 0) !== 0 ||
    (summary?.totalLiabilities || 0) !== 0 ||
    (summary?.netWorth || 0) !== 0;
  const hasAllocationData = allocation.length > 0;

  useEffect(() => {
    setProfileDraft(buildDraft(user));
  }, [user]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

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

  function openProfileScreen() {
    setProfileDraft(buildDraft(user));
    setEditableFields({});
    setProfileError('');
    setActiveScreen('profile');
    setMenuOpen(false);
  }

  function openPasswordScreen() {
    setPasswordError('');
    setActiveScreen('password');
    setMenuOpen(false);
  }

  function handleProfileFieldChange(field, value) {
    setProfileDraft((current) => ({ ...current, [field]: value }));
  }

  function handleProfileImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleProfileFieldChange('profilePic', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileError('');

    try {
      const result = await updateProfile(profileDraft);
      onUserChange(result.user);
      setEditableFields({});
      setActiveScreen('dashboard');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get('newPassword') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password must match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    try {
      await changePassword({
        currentPassword: formData.get('currentPassword'),
        newPassword,
      });
      setActiveScreen('dashboard');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
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

  function renderProfileField(label, field, options = {}) {
    const isEditing = Boolean(editableFields[field]);
    const value = profileDraft[field];

    return (
      <div className="profile-row" key={field}>
        <div>
          <div className="profile-label">{label}</div>
          {!isEditing && (
            <div className="profile-value">
              {value || options.emptyLabel || 'Not added yet'}
            </div>
          )}
          {isEditing && options.type === 'select' && (
            <select
              className="input profile-input"
              value={value}
              onChange={(event) => handleProfileFieldChange(field, event.target.value)}
            >
              <option value="">Select</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          )}
          {isEditing && options.type !== 'select' && (
            <input
              className="input profile-input"
              type={options.type || 'text'}
              value={value}
              required={Boolean(options.required)}
              onChange={(event) => handleProfileFieldChange(field, event.target.value)}
            />
          )}
        </div>
        <button
          className="btn btn-outline"
          type="button"
          onClick={() =>
            setEditableFields((current) => ({
              ...current,
              [field]: !current[field],
            }))
          }
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>
    );
  }

  function renderProfileScreen() {
    return (
      <section className="dashboard-tile profile-screen">
        <div className="tile-header">
          <div>
            <div className="tile-title">Profile</div>
            <div className="card-sub">
              Review your details first, then edit only the fields you want to change.
            </div>
          </div>
          <button className="btn btn-outline" type="button" onClick={() => setActiveScreen('dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="profile-layout">
          <div className="profile-card-main">
            <div className="profile-photo-section">
              {profileDraft.profilePic ? (
                <img
                  alt={user.name}
                  className="profile-photo"
                  src={profileDraft.profilePic}
                />
              ) : (
                <div className="profile-photo profile-photo-fallback">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="profile-photo-actions">
                <label className="btn btn-outline" htmlFor="profile-photo-upload">
                  {profileDraft.profilePic ? 'Change Picture' : 'Upload Picture'}
                </label>
                <input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>

            <div className="profile-fields">
              {renderProfileField('Name', 'name', { required: true })}
              {renderProfileField('Email', 'email', { type: 'email', required: true })}
              {renderProfileField('Mobile Number', 'mobile')}
              {renderProfileField('Date of Birth', 'dob', { type: 'date' })}
              {renderProfileField('Gender', 'gender', { type: 'select' })}
            </div>

            {profileError && <div className="error">{profileError}</div>}

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleProfileSave}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderPasswordScreen() {
    return (
      <section className="dashboard-tile profile-screen">
        <div className="tile-header">
          <div>
            <div className="tile-title">Change Password</div>
            <div className="card-sub">
              Update your password from a dedicated account screen.
            </div>
          </div>
          <button className="btn btn-outline" type="button" onClick={() => setActiveScreen('dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="profile-card-main">
          <form className="form-grid password-screen-form" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="label">Current password</label>
              <input className="input" name="currentPassword" type="password" required />
            </div>
            <div>
              <label className="label">New password</label>
              <input className="input" name="newPassword" type="password" minLength="8" required />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                className="input"
                name="confirmPassword"
                type="password"
                minLength="8"
                required
              />
            </div>
            {passwordError && <div className="error">{passwordError}</div>}
            <button className="btn btn-primary" type="submit" disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  function renderDashboard() {
    return (
      <>
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
            <span className="brand-name">NetWorth Hub</span>
          </div>
          <div className="profile-menu-wrap" ref={menuRef}>
            <button
              className="profile-trigger"
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
            >
              {user.profilePic ? (
                <img className="avatar-image" alt={user.name} src={user.profilePic} />
              ) : (
                <div className="avatar-circle">{user.name?.charAt(0) || 'U'}</div>
              )}
              <span className="profile-trigger-name">{user.name}</span>
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-head">
                  <div className="profile-dropdown-title">{user.name}</div>
                  <div className="profile-dropdown-email">{user.email}</div>
                </div>
                <button className="profile-dropdown-item" type="button" onClick={openProfileScreen}>
                  Profile
                </button>
                <button className="profile-dropdown-item" type="button" onClick={openPasswordScreen}>
                  Change Password
                </button>
                <button className="profile-dropdown-item danger" type="button" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center gap-sm auth-header-stack">
          <div>
            <div className="app-header-title">
              {activeScreen === 'dashboard' && 'Welcome to your NetWorth Hub'}
              {activeScreen === 'profile' && 'Manage Your Profile'}
              {activeScreen === 'password' && 'Update Your Password'}
            </div>
            <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {activeScreen === 'dashboard' &&
                'Build financial discipline by tracking your assets, liabilities, and net worth regularly.'}
              {activeScreen === 'profile' &&
                'Keep your account details up to date and personalize how your profile looks.'}
              {activeScreen === 'password' &&
                'Use a strong password and update it whenever you need to improve account security.'}
            </div>
          </div>
        </div>
      </header>
      <main className="app-main">
        {activeScreen === 'dashboard' && renderDashboard()}
        {activeScreen === 'profile' && renderProfileScreen()}
        {activeScreen === 'password' && renderPasswordScreen()}
        {error && <div className="error mt-md">{error}</div>}
      </main>
    </div>
  );
}
