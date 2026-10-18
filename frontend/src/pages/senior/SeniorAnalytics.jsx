import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useReports } from '../../context/ReportsContext';
import StatusChart from '../../components/StatusChart';
import SeverityChart from '../../components/SeverityChart';
import TypeChart from '../../components/TypeChart';
import TrendChart from '../../components/TrendChart';

export default function SeniorAnalytics() {
  const { reports } = useReports();

  return (
    <>
      <div className="topbar-header">
        <div>
          <h1 className="page-title">Analytics & Intelligence</h1>
          <p className="page-description">Statistical distribution of civic defects, department workloads, and resolution SLAs</p>
        </div>
      </div>

      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Defect Distribution by Type</span>
            </div>
            <div className="panel-body">
              <TypeChart reports={reports} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Severity Level Ratio</span>
            </div>
            <div className="panel-body">
              <SeverityChart reports={reports} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)' }}>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">7-Day Detection Trend</span>
            </div>
            <div className="panel-body">
              <TrendChart reports={reports} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Status Breakdown</span>
            </div>
            <div className="panel-body">
              <StatusChart reports={reports} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
