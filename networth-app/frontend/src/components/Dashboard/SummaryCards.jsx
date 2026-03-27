function formatCurrency(value) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export default function SummaryCards({ summary }) {
  const totalAssets = summary?.totalAssets || 0;
  const totalLiabilities = summary?.totalLiabilities || 0;
  const netWorth = summary?.netWorth || 0;

  const netClass = netWorth >= 0 ? 'tag-positive' : 'tag-negative';

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Net Worth</div>
            <div className={`card-value ${netClass}`}>
              {formatCurrency(netWorth)}
            </div>
          </div>
          <span className="badge">
            {netWorth >= 0 ? 'Healthy' : 'Leverage'}
          </span>
        </div>
        <div className="card-sub">
          Difference between total assets and total liabilities.
        </div>
      </div>

      <div className="card grid grid-2">
        <div>
          <div className="card-title">Total Assets</div>
          <div className="card-value tag-positive">
            {formatCurrency(totalAssets)}
          </div>
          <div className="card-sub">Sum of all asset positions.</div>
        </div>
        <div>
          <div className="card-title">Total Liabilities</div>
          <div className="card-value tag-negative">
            {formatCurrency(totalLiabilities)}
          </div>
          <div className="card-sub">Outstanding loans and obligations.</div>
        </div>
      </div>
    </div>
  );
}

