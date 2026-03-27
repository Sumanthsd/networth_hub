import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#22c55e', '#eab308', '#ec4899', '#f97316'];

export default function AssetAllocationChart({ data }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Asset Allocation</div>
        <span className="chip">By category</span>
      </div>
      <div className="chart-container">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="totalAmount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                value.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

