import { api, setToken, getToken } from "./api.js";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h2>Connexion</h2>
        <form id="login-form">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" name="username" required />

          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">Se connecter</button>
        </form>
        <p class="auth-switch">Pas encore inscrit ? <a href="#/register">Créer un compte</a></p>
      </div>
    </div>

  `;
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      username: e.target.username.value,
      password: e.target.password.value,
    };
    try {
      const res = await api("/auth/login", "POST", payload, false);
      setToken(res["response"]);   // ✅ stocker le vrai token
      await fetchUserInfo();        // ✅ récupérer infos utilisateur
      location.hash = "#/groups";
    } catch (err) {
      alert(err.message);
    }
  });
}

export function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="auth-card">
        <h2>Inscription</h2>
        <form id="register-form">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" name="username" required />

          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">S'inscrire</button>
        </form>
        <p class="auth-switch">Déjà un compte ? <a href="#/login">Connecter vous!</a></p>
      </div>
    </div>

  `;
  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      username: e.target.username.value,
      password: e.target.password.value,
    };
    try {
      await api("/auth/register", "POST", payload, false);
      alert("Compte créé, connecte-toi !");
      location.hash = "#/login";
    } catch (err) {
      alert(err.message);
    }
  });
}

// ✅ Nouvelle fonction pour récupérer les infos du user
export async function fetchUserInfo() {
  if (!getToken()) return null;
  try {
    const user = await api("/auth/me", "GET"); // backend doit renvoyer {id, username, email}
    const userInfo = document.getElementById("user-info");
    localStorage.setItem("id", user.id)
    if (userInfo) {
      userInfo.textContent = `Connecté : ${user.username} ${user.id}`;
    }
    return user;
  } catch (err) {
    console.error("Erreur fetchUserInfo:", err.message);
    return null;
  }
}
