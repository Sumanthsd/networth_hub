import { useState } from 'react';

export default function ImportSheetForm({ onImport, onImportCsv, onLoadSample }) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!sheetUrl.trim()) {
      setError('Please paste a Google Sheet URL.');
      return;
    }
    try {
      setLoading(true);
      const result = await onImport({
        sheetUrl: sheetUrl.trim(),
        sheetName: sheetName.trim() || undefined,
      });
      setInfo(
        `Imported ${result.assetsImported} assets and ${result.liabilitiesImported} liabilities.`
      );
    } catch (err) {
      setError(err?.message || 'Failed to import sheet.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCsvImport(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!csvFile) {
      setError('Please choose a CSV file.');
      return;
    }
    try {
      setLoading(true);
      const result = await onImportCsv(csvFile);
      setInfo(
        `Imported ${result.assetsImported} assets and ${result.liabilitiesImported} liabilities from CSV.`
      );
    } catch (err) {
      setError(err?.message || 'Failed to import CSV.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadSample() {
    setError('');
    setInfo('');
    try {
      setLoading(true);
      const result = await onLoadSample();
      setInfo(
        `Loaded sample data: ${result.assetsImported} assets and ${result.liabilitiesImported} liabilities.`
      );
    } catch (err) {
      setError(err?.message || 'Failed to load sample data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mt-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="card-title">Import</div>
          <div className="card-sub">
            Import from Google Sheets (later) or upload CSV now.
          </div>
        </div>
        <button
          className="btn btn-outline"
          type="button"
          onClick={handleLoadSample}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load sample data'}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center gap-sm">
          <div style={{ flex: 1 }}>
            <label className="label">Google Sheet URL</label>
            <input
              className="input"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <div style={{ width: 160 }}>
            <label className="label">Sheet name (optional)</label>
            <input
              className="input"
              type="text"
              placeholder="Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>
          <div style={{ marginTop: '1.35rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
        {error && <div className="error mt-sm">{error}</div>}
        {info && (
          <div className="mt-sm" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
            {info}
          </div>
        )}
        <div className="mt-sm" style={{ fontSize: '0.75rem' }}>
          <span className="muted">
            Share the sheet with your service account email, and ensure the first
            row has columns: Type, Category, Name, Amount, Notes.
          </span>
        </div>
      </form>

      <div className="mt-md" style={{ borderTop: '1px solid #1f2937', paddingTop: '1rem' }}>
        <form onSubmit={handleCsvImport}>
          <div className="flex justify-between items-center gap-sm">
            <div style={{ flex: 1 }}>
              <label className="label">Or upload CSV</label>
              <input
                className="input"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <div className="muted mt-sm" style={{ fontSize: '0.75rem' }}>
                CSV headers should be: Type, Category, Name, Amount, Notes
              </div>
            </div>
            <div style={{ marginTop: '1.35rem' }}>
              <button className="btn btn-outline" type="submit" disabled={loading}>
                {loading ? 'Importing...' : 'Upload & Import'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

