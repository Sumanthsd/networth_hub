import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function buildData(summary) {
  const totalAssets = summary?.totalAssets || 0;
  const totalLiabilities = summary?.totalLiabilities || 0;
  const netWorth = summary?.netWorth || 0;
  return [
    { name: 'Assets', value: totalAssets },
    { name: 'Liabilities', value: totalLiabilities },
    { name: 'Net Worth', value: netWorth },
  ];
}

export default function NetWorthBarChart({ summary }) {
  const data = buildData(summary);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Net Worth Snapshot</div>
        <span className="chip">Current totals</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis
              stroke="#9ca3af"
              tickFormatter={(v) => `${Math.round(v / 100000)}L`}
            />
            <Tooltip
              formatter={(value) =>
                value.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })
              }
            />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

