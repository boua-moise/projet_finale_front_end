const API_BASE = "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}

export async function api(path, method = "GET", body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json().catch(() => ({}));
}
