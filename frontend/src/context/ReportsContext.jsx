import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_REPORTS, MOCK_CAMERAS, MOCK_USERS } from '../data/mockData';
import {
  apiGetReports,
  apiGetCameras,
  apiReviewReport,
  apiAssignReport,
  apiProgressReport,
  apiResolveReport,
  apiAddCamera,
} from '../api';

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('cityeye_reports_state');
    return saved ? JSON.parse(saved) : MOCK_REPORTS;
  });

  const [cameras, setCameras] = useState(() => {
    const saved = localStorage.getItem('cityeye_cameras_state');
    return saved ? JSON.parse(saved) : MOCK_CAMERAS;
  });

  // Fetch live data from backend on mount or token change
  useEffect(() => {
    const token = localStorage.getItem('cityeye_token');
    if (!token || token.startsWith('mock-')) return;

    let isMounted = true;
    apiGetReports()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Normalise backend reports to match UI format
          const formatted = data.map((r) => ({
            ...r,
            location_name: r.location_name || (r.camera ? r.camera.address || r.camera.name : 'Unknown Location'),
            gps: {
              lat: r.gps_lat || (r.camera ? r.camera.latitude : 19.076),
              lng: r.gps_lng || (r.camera ? r.camera.longitude : 72.8777),
            },
            evidence_photo: r.evidence_photo_path || '/evidence/pothole-001.svg',
          }));
          setReports(formatted);
        }
      })
      .catch(() => {
        // Fall back gracefully to local state
      });

    apiGetCameras()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCameras(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('cityeye_reports_state', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('cityeye_cameras_state', JSON.stringify(cameras));
  }, [cameras]);

  const approveReport = async (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'approved',
              reviewed_by: 'usr-001',
              reviewed_at: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await apiReviewReport(id, 'approved');
    } catch (e) {
      console.warn('API review sync warning:', e.message);
    }
  };

  const rejectReport = async (id, reason) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'rejected',
              rejection_reason: reason,
              reviewed_by: 'usr-001',
              reviewed_at: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await apiReviewReport(id, 'rejected', reason);
    } catch (e) {
      console.warn('API review sync warning:', e.message);
    }
  };

  const assignReport = async (id, teamId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'assigned',
              assigned_team: teamId,
              assigned_at: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await apiAssignReport(id, teamId);
    } catch (e) {
      console.warn('API assign sync warning:', e.message);
    }
  };

  const startWork = async (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'in_progress',
              in_progress_at: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await apiProgressReport(id);
    } catch (e) {
      console.warn('API progress sync warning:', e.message);
    }
  };

  const resolveReport = async (id, { notes, photoPath }) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'resolved',
              resolution_notes: notes || 'Repairs completed and verified on site.',
              resolution_photo_path: photoPath || '/evidence/res-001.svg',
              resolved_by: r.assigned_team || 'usr-002',
              resolved_at: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await apiResolveReport(id, notes);
    } catch (e) {
      console.warn('API resolve sync warning:', e.message);
    }
  };

  const addCamera = async (newCam) => {
    const cam = {
      id: `cam-${String(cameras.length + 1).padStart(3, '0')}`,
      name: newCam.name,
      latitude: parseFloat(newCam.latitude),
      longitude: parseFloat(newCam.longitude),
      address: newCam.address,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setCameras((prev) => [cam, ...prev]);
    try {
      const created = await apiAddCamera(newCam);
      if (created && created.id) {
        setCameras((prev) => prev.map((c) => (c.id === cam.id ? created : c)));
      }
    } catch (e) {
      console.warn('API add camera sync warning:', e.message);
    }
  };

  const addUploadedReport = (newReport) => {
    const formatted = {
      ...newReport,
      location_name: newReport.location_name || (newReport.camera ? newReport.camera.address || newReport.camera.name : 'SV Road Demonstration Point'),
      gps: {
        lat: newReport.camera ? newReport.camera.latitude : 19.0596,
        lng: newReport.camera ? newReport.camera.longitude : 72.8295,
      },
      evidence_photo: newReport.evidence_image_path || '/evidence/pothole-001.svg',
    };
    setReports((prev) => [formatted, ...prev.filter((r) => r.id !== formatted.id)]);
  };

  const resetData = () => {
    setReports(MOCK_REPORTS);
    setCameras(MOCK_CAMERAS);
    localStorage.removeItem('cityeye_reports_state');
    localStorage.removeItem('cityeye_cameras_state');
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        cameras,
        users: MOCK_USERS,
        approveReport,
        rejectReport,
        assignReport,
        startWork,
        resolveReport,
        addCamera,
        addUploadedReport,
        resetData,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within ReportsProvider');
  return ctx;
}
