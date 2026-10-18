import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  pothole: '#DC2626',
  garbage: '#D97706',
  waterlogging: '#359B73',
};

export default function TypeChart({ reports = [] }) {
  const counts = reports.reduce((acc, r) => {
    const t = r.detection?.problem_type || 'pothole';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Pothole', value: counts.pothole || 0, color: COLORS.pothole },
    { name: 'Garbage', value: counts.garbage || 0, color: COLORS.garbage },
    { name: 'Waterlogging', value: counts.waterlogging || 0, color: COLORS.waterlogging },
  ];

  return (
    <div style={{ height: 260, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
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
