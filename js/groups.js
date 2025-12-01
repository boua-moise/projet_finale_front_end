import { api } from "./api.js";
import { fetchUserInfo } from "./auth.js";

export async function renderGroups(container, groupId) {
  if (groupId) {
    return renderGroupDetail(container, parseInt(groupId, 10));
  }

  const groups = await api("/groups", "GET");

  container.innerHTML = `
    <div class="panel">
      <h2>Groupes</h2>
      <form id="create-group-form" style="margin-bottom:1rem;">
        <input name="nom" placeholder="Nom du groupe" required/>
        <button type="submit">Créer</button>
      </form>
      <div id="groups-list" class="grid"></div>
    </div>
  `;

  const list = document.getElementById("groups-list");
  list.innerHTML = groups.map(g => `
    <div class="card">
      <h3>${g.nom}</h3>
      <p>ID: ${g.id}</p>
      <button onclick="location.hash='#/groups/${g.id}'">Voir détails</button>
    </div>
  `).join("");

  document.getElementById("create-group-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = { nom: e.target.nom.value, creator_id: localStorage.getItem('id') };
    try {
      const group = await api("/groups", "POST", payload);
      alert("Groupe créé !");
      location.hash = `#/groups/${group.id}`;
    } catch (err) {
      alert(err.message);
    }
  });
}

async function renderGroupDetail(container, groupId) {
  container.innerHTML = `
    <div class="panel">
      <h2>Détail du groupe #${groupId}</h2>
      <div style="margin-bottom:1rem;">
        <button id="btn-tasks">Voir les tâches</button>
        <button id="btn-users">Voir les membres</button>
      </div>
      <div id="group-content"></div>
    </div>
  `;

  document.getElementById("btn-tasks").addEventListener("click", () => renderGroupTasks(groupId));
  document.getElementById("btn-users").addEventListener("click", () => renderGroupUsers(groupId));

  // Par défaut → afficher les tâches
  renderGroupTasks(groupId);
}

async function renderGroupTasks(groupId) {
  const group = await api(`/groups/${groupId}`, "GET"); // doit renvoyer creator_id
  const currentUser = await fetchUserInfo();
  const tasks = await api(`/groups/${groupId}/tasks`, "GET");
  const content = document.getElementById("group-content");

  const isCreator = currentUser.id === group.creator_id;

  content.innerHTML = `
    <h3>Tâches du groupe</h3>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Titre</th>
          <th>Deadline</th>
          <th>Statut</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${tasks.map(t => `
          <tr>
            <td>${t.id}</td>
            <td>${t.titre}</td>
            <td>${t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</td>
            <td>${t.status ? "✅ Terminée" : "⏳ En cours"}</td>
            <td>
              ${!t.status ? `<button class="btn-validate" data-id="${t.id}">Valider</button>` : ""}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // ✅ Formulaire visible seulement pour le créateur
  if (isCreator) {
    content.innerHTML += `
      <form id="assign-task-form" style="margin-top:1rem;">
        <input name="task_id" type="number" placeholder="ID de la tâche" required/>
        <button type="submit">Associer</button>
      </form>

      <form id="disocy-task-form" style="margin-top:1rem;">
        <input name="task_id" type="number" placeholder="ID de la tâche" required/>
        <button type="submit">Dissocier</button>
      </form>
    `;

    document.getElementById("assign-task-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const payload = { group_id: groupId, task_id: parseInt(f.task_id.value, 10) };
      try {
        await api("/groups/tasks", "POST", payload);
        alert("Tâche associée !");
        renderGroupTasks(groupId); // refresh
      } catch (err) {
        alert(err.message);
      }
    });

    document.getElementById("disocy-task-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      try {
        await api(`/tasks/remove/${parseInt(f.task_id.value)}`, "PUT");
        alert("Tâche dissociée !");
        renderGroupTasks(groupId); // refresh
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ✅ Boutons “Valider” visibles par tous
  document.querySelectorAll(".btn-validate").forEach(btn => {
    btn.addEventListener("click", async () => {
      const taskId = parseInt(btn.dataset.id, 10);
      try {
        await api("/tasks", "PUT", { id: taskId, status: true });
        alert("Tâche validée !");
        renderGroupTasks(groupId); // refresh
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function renderGroupUsers(groupId) {
  const group = await api(`/groups/users/${groupId}`, "GET"); // doit renvoyer creator_id et members
  const currentUser = await fetchUserInfo();
  const content = document.getElementById("group-content");

  const isCreator = currentUser.id === group.creator_id;

  // Générer le lien d’invitation
  const inviteLink = `${window.location.origin}${window.location.pathname}#/invite/${groupId}`;

  content.innerHTML = `
    <h3>Membres du groupe</h3>
    <table class="table">
      <thead>
        <tr>
          <th>User ID</th>
          <th>User</th>
        </tr>
      </thead>
      <tbody>
        ${group.members.map(m => `<tr><td>${m.id}</td><td>${m.nom}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  // ✅ Formulaires visibles seulement pour le créateur
  if (isCreator) {
    content.innerHTML += `
      <div class="panel" style="margin-top:1rem;">
        <p>Inviter un utilisateur via ce lien :</p>
        <input type="text" value="${inviteLink}" readonly style="width:60%;"/>
        <button id="onclick">Copier</button>
      </div>

      <form id="remove-member-form" style="margin-top:1rem;">
        <input name="user_id" type="number" placeholder="ID utilisateur" required/>
        <button type="submit">Retirer</button>
      </form>
    `;

    document.getElementById("onclick").addEventListener("click", (e) => {
      
      navigator.clipboard.writeText(e.target.previousElementSibling.value);
      e.target.textContent = "Copié"
      setTimeout(() => {
        e.target.textContent = "Copier"
      }, 1000)

    })

    // Retirer un membre
    document.getElementById("remove-member-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const payload = { group_id: groupId, user_id: parseInt(f.user_id.value, 10) };
      try {
        await api("/groups/users", "DELETE", payload);
        alert("Membre retiré !");
        renderGroupUsers(groupId); // refresh
      } catch (err) {
        alert(err.message);
      }
    });
  }
}
