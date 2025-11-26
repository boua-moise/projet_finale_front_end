import { api } from "./api.js";

export async function renderTasks(container) {
  // Récupération des tâches depuis le backend
  const tasks = await api("/tasks", "GET");

  // Structure HTML
  container.innerHTML = `
    <div class="panel">
      <h2>Mes tâches</h2>
      <form id="create-task-form">
        <input name="titre" placeholder="Titre" required/>
        <input type="datetime-local" name="deadline"/>
        <button type="submit">Créer</button>
      </form>
    </div>

    <div class="panel">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th><th>Titre</th><th>Statut</th><th>Deadline</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="tasks-body"></tbody>
      </table>
    </div>

    <div id="edit-panel" class="panel" style="display:none;">
      <h3>Modifier la tâche</h3>
      <form id="edit-task-form">
        <input type="hidden" name="id"/>
        <input name="titre" placeholder="Titre"/>
        <input name="description" placeholder="Description"/>
        <select name="status">
          <option value="false">En cours</option>
          <option value="true">Terminée</option>
        </select>
        <input type="datetime-local" name="deadline"/>
        <button type="submit">Enregistrer</button>
        <button type="button" id="edit-cancel">Annuler</button>
      </form>
    </div>
  `;

  // Création d’une tâche
  document.getElementById("create-task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      titre: f.titre.value.trim(),
      deadline: f.deadline.value ? new Date(f.deadline.value).toISOString().replace('Z', '') : null,
      owner_id: localStorage.getItem("id"),
    };
    try {
      await api("/tasks", "POST", payload);
      alert("Tâche créée !");
      location.hash = "#/tasks"; // refresh
    } catch (err) {
      alert(err.message);
    }
  });

  // Affichage des tâches
  renderTaskRows(tasks);

  // Gestion du panneau d’édition
  const editPanel = document.getElementById("edit-panel");
  const editForm = document.getElementById("edit-task-form");
  document.getElementById("edit-cancel").addEventListener("click", () => {
    editPanel.style.display = "none";
  });

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      id: parseInt(f.id.value, 10),
      titre: f.titre.value || null,
      description: f.description.value || null,
      status: f.status.value === "true",
      deadline: f.deadline.value ? new Date(f.deadline.value).toISOString() : null,
    };
    try {
      await api("/tasks", "PUT", payload);
      alert("Tâche mise à jour !");
      editPanel.style.display = "none";
      location.hash = "#/tasks"; // refresh
    } catch (err) {
      alert(err.message);
    }
  });

  // Fonction pour afficher les lignes du tableau
  function renderTaskRows(list) {
    const tbody = document.getElementById("tasks-body");
    tbody.innerHTML = list.map(t => `
      <tr>
        <td>${t.id}</td>
        <td>${t.titre}</td>
        <td>${t.status ? "✅" : "⏳"}</td>
        <td>${t.deadline ? new Date(t.deadline).toLocaleString() : "-"}</td>
        <td>
          <button class="btn-secondary" data-edit="${t.id}">Modifier</button>
          <button class="btn-danger" data-del="${t.id}">Supprimer</button>
        </td>
      </tr>
    `).join("");

    // Boutons modifier
    tbody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        const task = list.find(x => x.id === parseInt(btn.dataset.edit, 10));
        openEditForm(task);
      });
    });

    // Boutons supprimer
    tbody.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Supprimer cette tâche ?")) return;
        try {
          await api(`/tasks/${btn.dataset.del}`, "DELETE");
          alert("Tâche supprimée");
          location.hash = "#/tasks";
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  // Ouvrir le formulaire d’édition
  function openEditForm(task) {
    const editPanel = document.getElementById("edit-panel");
    const f = document.getElementById("edit-task-form");
    f.id.value = task.id;
    f.titre.value = task.titre || "";
    f.description.value = task.description || "";
    f.status.value = task.status ? "true" : "false";
    f.deadline.value = task.deadline ? new Date(task.deadline).toISOString().slice(0,16) : "";
    editPanel.style.display = "block";
  }
}
