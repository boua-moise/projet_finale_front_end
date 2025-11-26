import { getToken, clearToken } from "./api.js";
import { renderLogin, renderRegister } from "./auth.js";
import { renderGroups } from "./groups.js";
import { renderTasks } from "./tasks.js";
import { fetchUserInfo } from "./auth.js";
import  { renderInvite } from "./invite.js"

export function initRouter() {
  // écoute les changements de hash
  window.addEventListener("hashchange", () => {
    renderRoute();
    updateNav();
  });

  // bouton déconnexion
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      location.hash = "#/login";
      updateNav();
    });
  }

  // premier rendu
  renderRoute();
  updateNav();
}

function renderRoute() {
  const container = document.getElementById("app");
  const hash = location.hash || "#/login";
  const [_, route, param] = hash.split("/");

  // si pas connecté → forcer login sauf pour register
  if (!getToken() && route !== "login" && route !== "register") {
    return renderLogin(container);
  }
  
  // rafraîchir infos utilisateur si connecté
  if (getToken()) {
    fetchUserInfo();
  }

  switch (route) {
    case "login":
      renderLogin(container);
      break;
    case "register":
      renderRegister(container);
      break;
    case "groups":
      renderGroups(container, param);
      break;
    case "invite": 
      renderInvite(container, param); 
      break;
    case "tasks":
      renderTasks(container);
      break;
    default:
      renderLogin(container);
  }
}

function updateNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const loginLink = nav.querySelector("a[href^='#/login']");
  const registerLink = nav.querySelector("a[href^='#/register']");
  const logoutBtn = document.getElementById("logout-btn");

  if (getToken()) {
    // connecté → cacher login/register, montrer logout
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    // invité → montrer login/register, cacher logout
    if (loginLink) loginLink.style.display = "inline-block";
    if (registerLink) registerLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}
