const TEMALAR = [{ id: "tema-01-wohnen", file: "content/temalar/tema-01-wohnen.json" }];

const App = (() => {
  const app = document.getElementById("app");
  const themeToggle = document.getElementById("themeToggle");
  const cache = {};

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀" : "☽";
  }

  function initTheme() {
    const theme = Storage.getTheme();
    applyTheme(theme);
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      Storage.setTheme(next);
      applyTheme(next);
    });
  }

  async function loadTema(entry) {
    if (cache[entry.id]) return cache[entry.id];
    const res = await fetch(entry.file);
    const data = await res.json();
    cache[entry.id] = data;
    return data;
  }

  function stepCount() {
    return 7;
  }

  async function renderDashboard() {
    app.innerHTML = "";
    const h = document.createElement("h2");
    h.textContent = "Temalar";
    app.appendChild(h);

    for (const entry of TEMALAR) {
      const data = await loadTema(entry);
      const progress = Storage.getProgress(entry.id);
      const pct = Math.round((progress.completedSteps.length / stepCount()) * 100);

      const card = document.createElement("div");
      card.className = "card tema-card";
      card.innerHTML = `
        <div>
          <h3>${data.temaNo}. ${data.baslik}</h3>
          <p>${data.handlungsfeld}</p>
          <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        </div>
        <div>${pct}%</div>
      `;
      card.addEventListener("click", () => openTema(entry, data));
      app.appendChild(card);
    }
  }

  function openTema(entry, data) {
    TemaModu.start(app, data, renderDashboard);
  }

  function init() {
    initTheme();
    renderDashboard();
  }

  return { init };
})();

App.init();
