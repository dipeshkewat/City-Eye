import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerReports from './pages/officer/OfficerReports';
import OfficerCameras from './pages/officer/OfficerCameras';

// Work Team Pages
import WorkTeamDashboard from './pages/workteam/WorkTeamDashboard';
import WorkTeamAssignments from './pages/workteam/WorkTeamAssignments';

// Senior Pages
import SeniorDashboard from './pages/senior/SeniorDashboard';
import SeniorReports from './pages/senior/SeniorReports';
import SeniorMap from './pages/senior/SeniorMap';
import SeniorAnalytics from './pages/senior/SeniorAnalytics';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const routes = {
    officer: '/officer',
    work_team: '/workteam',
    senior_officer: '/senior',
  };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReportsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              {/* Senior Officer Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['senior_officer']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/senior" element={<SeniorDashboard />} />
                <Route path="/senior/map" element={<SeniorMap />} />
                <Route path="/senior/reports" element={<SeniorReports />} />
                <Route path="/senior/analytics" element={<SeniorAnalytics />} />
              </Route>

              {/* Officer Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['officer']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/officer" element={<OfficerDashboard />} />
                <Route path="/officer/reports" element={<OfficerReports />} />
                <Route path="/officer/cameras" element={<OfficerCameras />} />
              </Route>

              {/* Work Team Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['work_team']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/workteam" element={<WorkTeamDashboard />} />
                <Route path="/workteam/assignments" element={<WorkTeamAssignments />} />
              </Route>

              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ReportsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
