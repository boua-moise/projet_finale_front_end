const API_BASE = "https://projet-finale-back-end.onrender.com";

export function getToken() {
  return localStorage.getItem("token");
}
export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function hideLoaderDelayed() {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 3000); // ✅ attendre 3 secondes
  }
}

export async function api(path, method = "GET", body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }

  showLoader(); // ✅ afficher loader avant la requête

  try {
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
  } finally {
    // ⚠️ ne pas cacher directement → attendre une redirection
    const oldHash = location.hash;
    const observer = new MutationObserver(() => {
      if (location.hash !== oldHash) {
        hideLoaderDelayed(); // ✅ cacher après 3 secondes
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
