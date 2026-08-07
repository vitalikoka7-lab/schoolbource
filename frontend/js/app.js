// Injecte la barre latérale commune à toutes les pages internes.
function renderSidebar(active) {
  const links = [
    ["dashboard.html", "🏠", "Accueil"],
    ["scholarships.html", "🎓", "Bourses"],
    ["universities.html", "🏫", "Universités / Écoles"],
    ["dossiers.html", "🗂️", "Mes Dossiers"],
    ["profile.html", "👤", "Profil"],
    ["cv.html", "📄", "Mon Profil / CV"],
    ["forces.html", "💬", "Forces & Objectifs"],
  ];

  const el = document.getElementById("sidebar");
  if (!el) return;

  el.innerHTML = `
    <div class="logo"><img src="assets/logo.svg" alt="ScholarPass" height="28"/></div>
    <nav>
      ${links
        .map(
          ([href, icon, label]) =>
            `<a class="nav-link ${active === href ? "active" : ""}" href="${href}">
              <span>${icon}</span><span>${label}</span>
            </a>`
        )
        .join("")}
    </nav>
    <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:12px;">
      <p style="font-size:13px;font-weight:700;margin:0 0 4px;">Passe Premium</p>
      <p style="font-size:12px;color:#64748b;margin:0 0 10px;">Accédez à plus de bourses et d'outils exclusifs.</p>
      <button class="btn-primary" style="width:100%;">Passer Premium</button>
    </div>
    <button class="btn-secondary" style="width:100%;margin-top:16px;" onclick="Auth.logout()">Se déconnecter</button>
  `;
}

// --- Widget de chat "Nova" (agent coach conversationnel) ---
let novaHistory = [];

function initNova() {
  const fab = document.getElementById("nova-fab");
  const panel = document.getElementById("nova-panel");
  if (!fab || !panel) return;

  fab.addEventListener("click", () => {
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
  });

  if (novaHistory.length === 0) {
    addNovaMessage(
      "nova",
      "Bonjour 👋 Je suis Nova. Mon objectif est de t'aider à obtenir une bourse. Dis-moi : quelle vie aimerais-tu avoir dans 10 ans ?"
    );
  }

  document.getElementById("nova-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("nova-input");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addNovaMessage("user", text);
    novaHistory.push({ role: "user", content: text });

    try {
      const { reply } = await Api.novaChat(text, novaHistory.slice(0, -1));
      addNovaMessage("nova", reply);
      novaHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      addNovaMessage("nova", "⚠️ Je n'ai pas pu répondre (vérifie que le backend et la clé API sont configurés).");
    }
  });
}

function addNovaMessage(role, text) {
  const box = document.getElementById("nova-messages");
  const div = document.createElement("div");
  div.className = `msg ${role === "user" ? "user" : "nova"}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function novaWidgetHTML() {
  return `
    <button id="nova-fab" title="Discuter avec Nova">💬</button>
    <div id="nova-panel">
      <div style="padding:14px;border-bottom:1px solid #e2e8f0;font-weight:700;">✨ Nova - ton conseiller</div>
      <div id="nova-messages"></div>
      <form id="nova-form" style="display:flex;gap:8px;padding:10px;border-top:1px solid #e2e8f0;">
        <input id="nova-input" class="input" placeholder="Écris un message..." autocomplete="off"/>
        <button class="btn-primary" type="submit">➤</button>
      </form>
    </div>
  `;
}
