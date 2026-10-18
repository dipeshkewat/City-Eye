import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SEVERITY_COLORS = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#359B73',
};

export default function SeverityChart({ reports = [] }) {
  const counts = reports.reduce((acc, r) => {
    const s = r.detection?.severity_label || 'medium';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'High Severity', value: counts.high || 0, color: SEVERITY_COLORS.high },
    { name: 'Medium Severity', value: counts.medium || 0, color: SEVERITY_COLORS.medium },
    { name: 'Low Severity', value: counts.low || 0, color: SEVERITY_COLORS.low },
  ];

  return (
    <div style={{ height: 260, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#0A223D" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#0A223D', borderColor: '#1B4573', borderRadius: 6, color: '#FFFFFF' }} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
