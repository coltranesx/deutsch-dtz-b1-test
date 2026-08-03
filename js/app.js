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
    const languages = I18n.getLanguages();
    const currentIndex = languages.findIndex((l) => l.code === lang);
    const next = languages[(currentIndex + 1) % languages.length];

    document.documentElement.setAttribute("lang", lang);
    langToggle.textContent = next.label;
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
      I18n.cycleLanguage();
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

  async function loadKamp() {
    if (cache.kamp) return cache.kamp;
    try {
      const res = await fetch("content/kamp-21-gun.json");
      const data = await res.json();
      cache.kamp = data;
      return data;
    } catch {
      return null;
    }
  }

  function stepCount() {
    return 7;
  }

  // En son çalışılan Tema'yı (varsa) `Storage.getProgress`'in lastStudiedAt
  // alanına göre bulur. Hiçbir Tema'da ilerleme yoksa null döner (dashboard
  // "Kaldığın yerden devam et" bloğu bu durumda hiç gösterilmez).
  function findLastStudiedTema(allData) {
    let latest = null;
    TEMALAR.forEach((entry, i) => {
      const progress = Storage.getProgress(entry.id);
      if (progress.completedSteps.length >= stepCount()) return;
      if (progress.lastStudiedAt && (!latest || progress.lastStudiedAt > latest.progress.lastStudiedAt)) {
        latest = { entry, data: allData[i], progress };
      }
    });
    return latest;
  }

  function renderContinueCard(allData, redemittelData) {
    const latest = findLastStudiedTema(allData);
    if (!latest) return;

    const card = document.createElement("div");
    card.className = "card continue-card";
    card.innerHTML = `
      <div style="font-size:1.5rem;">📍</div>
      <div>
        <p class="continue-card-eyebrow">${I18n.t("dashboard.continueTitle")}</p>
        <h3 style="margin:0 0 0.25rem;">${latest.data.temaNo}. ${latest.data.baslik}</h3>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-sm);">${I18n.t("dashboard.continueDesc", { step: I18n.t(`step.${latest.progress.lastStep}`) })}</p>
      </div>
    `;
    card.addEventListener("click", () => openTema(latest.entry, latest.data, redemittelData));
    app.appendChild(card);
  }

  function buildToolCard(className, icon, title, desc, badge) {
    const card = document.createElement("div");
    card.className = `card ${className}`;
    card.innerHTML = `
      <div style="font-size:1.5rem;">${icon}</div>
      <div>
        <h3 style="margin:0 0 0.25rem;">${title}</h3>
        <p style="margin:0;color:var(--text-muted);font-size:var(--text-sm);">${desc}</p>
        ${badge ? `<p style="margin:0.25rem 0 0;color:var(--primary);font-size:var(--text-xs);font-weight:var(--font-medium);">${badge}</p>` : ""}
      </div>
    `;
    return card;
  }

  async function renderDashboard() {
    currentRenderer = renderDashboard;
    app.innerHTML = "";
    window.scrollTo(0, 0);

    const [allData, redemittelData, kampData] = await Promise.all([
      Promise.all(TEMALAR.map(loadTema)),
      loadRedemittelBank(),
      loadKamp(),
    ]);

    renderContinueCard(allData, redemittelData);

    const pratikHeading = document.createElement("h2");
    pratikHeading.textContent = I18n.t("dashboard.pratikModlariHeading");
    app.appendChild(pratikHeading);

    const temalarHeading = document.createElement("h3");
    temalarHeading.className = "dashboard-subheading";
    temalarHeading.textContent = I18n.t("dashboard.temalarHeading");
    app.appendChild(temalarHeading);

    const temaGrid = document.createElement("div");
    temaGrid.className = "card-grid tema-grid";
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
      temaGrid.appendChild(card);
    });
    app.appendChild(temaGrid);

    const pratikGrid = document.createElement("div");
    pratikGrid.className = "card-grid pratik-grid";

    const hasLeitnerData = Object.keys(Storage.readAll().leitner).length > 0;
    const zayifCard = buildToolCard(
      "zayif-konular-card",
      "🎯",
      I18n.t("dashboard.zayifKonularTitle"),
      hasLeitnerData ? I18n.t("dashboard.zayifKonularDesc") : I18n.t("dashboard.zayifKonularEmptyDesc")
    );
    if (hasLeitnerData) {
      zayifCard.addEventListener("click", () => openZayifKonular(allData));
    } else {
      zayifCard.classList.add("locked");
      zayifCard.title = I18n.t("dashboard.zayifKonularEmptyDesc");
      zayifCard.setAttribute("aria-label", I18n.t("dashboard.zayifKonularEmptyDesc"));
    }
    pratikGrid.appendChild(zayifCard);

    if (kampData) {
      const kampAcikGun = Storage.getKampAcikGun();
      const kampCard = buildToolCard(
        "kamp-card",
        "📅",
        I18n.t("dashboard.kampTitle"),
        I18n.t("dashboard.kampDesc"),
        I18n.t("kamp.gunOfTotal", { gunNo: kampAcikGun })
      );
      kampCard.addEventListener("click", () => openKamp(kampData, allData));
      pratikGrid.appendChild(kampCard);
    }

    const gunluk15Card = buildToolCard(
      "gunluk15-card",
      "🔥",
      I18n.t("dashboard.gunluk15Title"),
      I18n.t("dashboard.gunluk15Desc")
    );
    gunluk15Card.addEventListener("click", () => openGunluk15(allData));
    pratikGrid.appendChild(gunluk15Card);

    const dtzSinavSession = Storage.getDtzSinavSession();
    const dtzSinavCard = buildToolCard(
      "dtz-sinav-card",
      "📝",
      I18n.t("dashboard.dtzSinavTitle"),
      I18n.t("dashboard.dtzSinavDesc"),
      dtzSinavSession ? I18n.t("dashboard.dtzSinavContinueBadge") : null
    );
    dtzSinavCard.addEventListener("click", () => openDtzSinav(allData));
    pratikGrid.appendChild(dtzSinavCard);

    app.appendChild(pratikGrid);

    const araclarHeading = document.createElement("h2");
    araclarHeading.textContent = I18n.t("dashboard.araclarRaporlarHeading");
    app.appendChild(araclarHeading);

    const araclarGrid = document.createElement("div");
    araclarGrid.className = "card-grid araclar-grid";

    const redemittelCard = buildToolCard(
      "redemittel-bank-card card-flat",
      "💬",
      I18n.t("dashboard.redemittelTitle"),
      I18n.t("dashboard.redemittelDesc")
    );
    redemittelCard.addEventListener("click", () => openRedemittelBank(redemittelData));
    araclarGrid.appendChild(redemittelCard);

    const istatistikCard = buildToolCard(
      "istatistik-card card-flat",
      "📊",
      I18n.t("dashboard.istatistikTitle"),
      I18n.t("dashboard.istatistikDesc")
    );
    istatistikCard.addEventListener("click", () => openIstatistik(allData));
    araclarGrid.appendChild(istatistikCard);

    const disaAktarmaCard = buildToolCard(
      "disa-aktarma-card card-flat",
      "📤",
      I18n.t("dashboard.disaAktarmaTitle"),
      I18n.t("dashboard.disaAktarmaDesc")
    );
    disaAktarmaCard.addEventListener("click", () => openDisaAktarma(allData));
    araclarGrid.appendChild(disaAktarmaCard);

    app.appendChild(araclarGrid);
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

  function openDtzSinav(allData) {
    if (!Storage.getDtzSinavSession() && !confirm(I18n.t("dtzSinav.startConfirm"))) return;
    currentRenderer = DtzSinavModu.refresh;
    DtzSinavModu.start(app, allData, renderDashboard);
  }

  function openKamp(kampData, allData) {
    currentRenderer = Kamp21GunModu.refresh;
    Kamp21GunModu.start(app, kampData, allData, renderDashboard);
  }

  function openGunluk15(allData) {
    currentRenderer = Gunluk15DakikaModu.refresh;
    Gunluk15DakikaModu.start(app, allData, renderDashboard);
  }

  function openIstatistik(allData) {
    currentRenderer = () => IstatistikEkrani.renderFullView(app, allData, renderDashboard);
    IstatistikEkrani.renderFullView(app, allData, renderDashboard);
  }

  function openDisaAktarma(allData) {
    currentRenderer = () => DisaAktarma.renderFullView(app, allData, renderDashboard);
    DisaAktarma.renderFullView(app, allData, renderDashboard);
  }

  function init() {
    initTheme();
    initLanguage();
    renderDashboard();
  }

  return { init };
})();

App.init();
