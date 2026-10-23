const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`
  : "http://127.0.0.1:8000/api/v1";


function getHeaders() {
  const token = localStorage.getItem("cityeye_token");
  const headers = { "Content-Type": "application/json" };
  if (token && !token.startsWith("mock-")) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password");
  }
  return res.json();
}

export async function apiGetReports() {
  const res = await fetch(`${API_BASE}/reports`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function apiReviewReport(id, decision, reason) {
  const res = await fetch(`${API_BASE}/reports/${id}/review`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ decision, rejection_reason: reason || undefined }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update review status");
  }
  return res.json();
}

export async function apiAssignReport(id, teamId) {
  const res = await fetch(`${API_BASE}/reports/${id}/assign`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ assigned_team: teamId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to assign report");
  }
  return res.json();
}

export async function apiProgressReport(id) {
  const res = await fetch(`${API_BASE}/reports/${id}/progress`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to start progress");
  }
  return res.json();
}

export async function apiResolveReport(id, notes) {
  const formData = new FormData();
  formData.append("resolution_notes", notes || "Repairs completed.");
  const token = localStorage.getItem("cityeye_token");
  const headers = {};
  if (token && !token.startsWith("mock-")) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/reports/${id}/resolve`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to resolve report");
  }
  return res.json();
}

export async function apiGetCameras() {
  const res = await fetch(`${API_BASE}/cameras`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cameras");
  return res.json();
}

export async function apiAddCamera(data) {
  const res = await fetch(`${API_BASE}/cameras`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: data.name,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      address: data.address || "",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to register camera");
  }
  return res.json();
}

export async function apiUploadProblem(file, cameraId, locationName) {
  const formData = new FormData();
  formData.append("file", file);
  if (cameraId) formData.append("camera_id", cameraId);
  if (locationName) formData.append("location_name", locationName);

  const token = localStorage.getItem("cityeye_token");
  const headers = {};
  if (token && !token.startsWith("mock-")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/reports/upload-problem`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to analyze and detect problem");
  }
  return res.json();
}

