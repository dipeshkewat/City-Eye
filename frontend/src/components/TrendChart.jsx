import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TREND_DATA = [
  { day: 'Mon', detections: 6 },
  { day: 'Tue', detections: 9 },
  { day: 'Wed', detections: 8 },
  { day: 'Thu', detections: 14 },
  { day: 'Fri', detections: 11 },
  { day: 'Sat', detections: 15 },
  { day: 'Sun', detections: 10 },
];

export default function TrendChart() {
  return (
    <div style={{ height: 260, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
          <Tooltip contentStyle={{ background: '#0A223D', borderColor: '#1B4573', borderRadius: 6, color: '#FFFFFF' }} />
          <Line type="monotone" dataKey="detections" stroke="#359B73" strokeWidth={3} dot={{ r: 4, fill: '#359B73' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
