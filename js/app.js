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
  const langToggle = document.getElementById("langToggle");
  const footerText = document.getElementById("footerText");
  const cache = {};
  let currentRenderer = renderDashboard;

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

  function applyLanguage() {
    const lang = I18n.getLanguage();
    document.documentElement.setAttribute("lang", lang);
    langToggle.textContent = lang === "tr" ? "EN" : "TR";
    langToggle.setAttribute("aria-label", I18n.t("lang.ariaLabel"));
    langToggle.setAttribute("title", I18n.t("lang.title"));
    themeToggle.setAttribute("aria-label", I18n.t("theme.ariaLabel"));
    themeToggle.setAttribute("title", I18n.t("theme.title"));
    footerText.textContent = I18n.t("footer.text");
  }

  function initLanguage() {
    I18n.init();
    applyLanguage();
    langToggle.addEventListener("click", () => {
      I18n.setLanguage(I18n.getLanguage() === "tr" ? "en" : "tr");
      applyLanguage();
      currentRenderer();
    });
  }

  async function loadTema(entry) {
    if (cache[entry.id]) return cache[entry.id];
    const res = await fetch(entry.file);
    const data = await res.json();
    cache[entry.id] = data;
    return data;
  }

  async function loadRedemittelBank() {
    if (cache.redemittelBank) return cache.redemittelBank;
    try {
      const res = await fetch("content/redemittel-bank.json");
      const data = await res.json();
      cache.redemittelBank = data;
      return data;
    } catch {
      return { kategoriler: [] };
    }
  }

  function stepCount() {
    return 7;
  }

  async function renderDashboard() {
    currentRenderer = renderDashboard;
    app.innerHTML = "";

    const [allData, redemittelData] = await Promise.all([
      Promise.all(TEMALAR.map(loadTema)),
      loadRedemittelBank(),
    ]);

    const zayifCard = document.createElement("div");
    zayifCard.className = "card zayif-konular-card";
    zayifCard.innerHTML = `
      <div style="font-size:1.5rem;">🎯</div>
      <div>
        <h3 style="margin:0 0 0.25rem;">${I18n.t("dashboard.zayifKonularTitle")}</h3>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-sm);">${I18n.t("dashboard.zayifKonularDesc")}</p>
      </div>
    `;
    zayifCard.addEventListener("click", () => openZayifKonular(allData));
    app.appendChild(zayifCard);

    const redemittelCard = document.createElement("div");
    redemittelCard.className = "card redemittel-bank-card";
    redemittelCard.innerHTML = `
      <div style="font-size:1.5rem;">💬</div>
      <div>
        <h3 style="margin:0 0 0.25rem;">${I18n.t("dashboard.redemittelTitle")}</h3>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-sm);">${I18n.t("dashboard.redemittelDesc")}</p>
      </div>
    `;
    redemittelCard.addEventListener("click", () => openRedemittelBank(redemittelData));
    app.appendChild(redemittelCard);

    const h = document.createElement("h2");
    h.textContent = I18n.t("dashboard.temalarHeading");
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
        <div class="tema-card-side">
          <button type="button" class="icon-btn tema-reset-btn" aria-label="${I18n.t("dashboard.resetBtnLabel")}" title="${I18n.t("dashboard.resetBtnTitle")}">↺</button>
          <span>${pct}%</span>
        </div>
      `;
      card.addEventListener("click", () => openTema(entry, data, redemittelData));
      card.querySelector(".tema-reset-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm(I18n.t("dashboard.resetConfirm", { baslik: data.baslik }))) return;
        Storage.resetTemaProgress(entry.id);
        renderDashboard();
      });
      app.appendChild(card);
    });
  }

  function openTema(entry, data, redemittelData) {
    currentRenderer = TemaModu.refresh;
    TemaModu.start(app, data, renderDashboard, redemittelData);
  }

  function openZayifKonular(allData) {
    currentRenderer = ZayifKonularModu.refresh;
    ZayifKonularModu.start(app, allData, renderDashboard);
  }

  function openRedemittelBank(redemittelData) {
    currentRenderer = () => RedemittelBank.renderFullView(app, redemittelData, renderDashboard);
    RedemittelBank.renderFullView(app, redemittelData, renderDashboard);
  }

  function init() {
    initTheme();
    initLanguage();
    renderDashboard();
  }

  return { init };
})();

App.init();
