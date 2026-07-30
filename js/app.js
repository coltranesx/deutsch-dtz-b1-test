const TEMALAR = [
  { id: "tema-01-wohnen", file: "content/temalar/tema-01-wohnen.json" },
  { id: "tema-02-arbeit", file: "content/temalar/tema-02-arbeit.json" },
  { id: "tema-03-arbeitssuche", file: "content/temalar/tema-03-arbeitssuche.json" },
  { id: "tema-04-mediennutzung", file: "content/temalar/tema-04-mediennutzung.json" },
  { id: "tema-05-mobilitaet", file: "content/temalar/tema-05-mobilitaet.json" },
  { id: "tema-06-gesundheit", file: "content/temalar/tema-06-gesundheit.json" },
  { id: "tema-07-ausbildung", file: "content/temalar/tema-07-ausbildung.json" },
  { id: "tema-08-kinderbetreuung", file: "content/temalar/tema-08-kinderbetreuung.json" },
  { id: "tema-09-einkaufen", file: "content/temalar/tema-09-einkaufen.json" },
  { id: "tema-10-behoerden", file: "content/temalar/tema-10-behoerden.json" },
  { id: "tema-11-banken", file: "content/temalar/tema-11-banken.json" },
];

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

    const allData = await Promise.all(TEMALAR.map(loadTema));

    const zayifCard = document.createElement("div");
    zayifCard.className = "card zayif-konular-card";
    zayifCard.innerHTML = `
      <div style="font-size:1.5rem;">🎯</div>
      <div>
        <h3 style="margin:0 0 0.25rem;">Zayıf Konular Modu</h3>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-sm);">Tema + Sprachhandlung + Gramer bazlı akıllı tekrar</p>
      </div>
    `;
    zayifCard.addEventListener("click", () => openZayifKonular(allData));
    app.appendChild(zayifCard);

    const h = document.createElement("h2");
    h.textContent = "Temalar";
    app.appendChild(h);

    TEMALAR.forEach((entry, i) => {
      const data = allData[i];
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
    });
  }

  function openTema(entry, data) {
    TemaModu.start(app, data, renderDashboard);
  }

  function openZayifKonular(allData) {
    ZayifKonularModu.start(app, allData, renderDashboard);
  }

  function init() {
    initTheme();
    renderDashboard();
  }

  return { init };
})();

App.init();
