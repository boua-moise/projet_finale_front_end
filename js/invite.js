import { api, getToken } from "./api.js";
import { renderLogin } from "./auth.js";

export async function renderInvite(container, groupId) {
  // Vérifier si connecté
  if (!getToken()) {
    return renderLogin(container);
  }

  // Récupérer infos du groupe
  let group;
  try {
    group = await api(`/groups/${groupId}`, "GET"); // backend doit exposer GET /groups/{id}
  } catch (err) {
    container.innerHTML = `<div class="panel">Erreur: ${err.message}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="panel" style="text-align:center;">
      <h2>Invitation à rejoindre un groupe</h2>
      <p>Vous êtes invité à rejoindre le groupe <strong>${group.nom}</strong>.</p>
      <div style="margin-top:1rem;">
        <button id="btn-accept" class="btn">Accepter</button>
        <button id="btn-refuse" class="btn-secondary">Refuser</button>
      </div>
    </div>
  `;

  // Bouton accepter
  document.getElementById("btn-accept").addEventListener("click", async () => {
    try {
      // current_user est injecté côté backend via le token
      const payload = { group_id: groupId, user_id: localStorage.getItem("id") }; 
      // ⚠️ user_id peut être ignoré si backend utilise current_user
      await api("/groups/users", "POST", payload);
      alert("Vous avez rejoint le groupe !");
      location.hash = `#/groups/${groupId}`;
    } catch (err) {
      alert(err.message);
    }
  });

  // Bouton refuser
  document.getElementById("btn-refuse").addEventListener("click", () => {
    location.hash = "#/groups"; // retour à l’accueil
  });
}
