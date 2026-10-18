import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_CONFIG = {
  pending_officer_review: { label: 'Pending', color: '#D97706' },
  approved: { label: 'Approved', color: '#359B73' },
  assigned: { label: 'Assigned', color: '#4F46E5' },
  in_progress: { label: 'In Progress', color: '#0284C7' },
  resolved: { label: 'Resolved', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#DC2626' },
};

export default function StatusChart({ reports = [] }) {
  const counts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(STATUS_CONFIG).map((key) => ({
    status: STATUS_CONFIG[key].label,
    count: counts[key] || 0,
    color: STATUS_CONFIG[key].color,
  }));

  return (
    <div style={{ height: 260, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="status" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
          <Tooltip contentStyle={{ background: '#0A223D', borderColor: '#1B4573', borderRadius: 6, color: '#FFFFFF' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
