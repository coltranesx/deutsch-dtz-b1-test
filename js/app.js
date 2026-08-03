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
  const navZayifKonular = document.getElementById("navZayifKonular");
  const navGunluk15 = document.getElementById("navGunluk15");
  const navKamp = document.getElementById("navKamp");
  const navDtzSinav = document.getElementById("navDtzSinav");
  const navAraclarToggle = document.getElementById("navAraclarToggle");
  const navAraclarMenu = document.getElementById("navAraclarMenu");
  const cache = {};
  let currentRenderer = renderDashboard;
  // DTZ Sınav Modu'nun sayaç `setInterval`'ını tutan aktif modun temizleme
  // fonksiyonu. Header artık her ekranda göründüğü için kullanıcı DTZ Sınav
  // Modu'nun ortasındayken header'dan başka bir moda geçebilir; bu değişken
  // olmadan eski interval arka planda temizlenmeden çalışmaya devam eder.
  // `switchTo` her yeni mod açılışından önce bunu çağırıp null'lar.
  let currentCleanup = null;

  // Header ikonları (ve dashboard kartları) ile yeni bir moda geçmeden HEMEN
  // ÖNCE varsa önceki modun cleanup'ını (bkz. `currentCleanup`) çalıştırır.
  // `openFn` async olabilir (header ikonları veri yüklemesini kendi içinde
  // yapar). Header artık her ekranda göründüğü için, hangi moda geçilirse
  // geçilsin sonunda `refreshHeaderNav()` çağrılır — aksi halde örn. DTZ
  // Sınav'dan header üzerinden başka bir moda geçilince "devam eden sınav"
  // rozeti (veya kilit/rozet durumları) sadece dashboard'a dönülünce ya da
  // dil değişince güncellenir, o ekrana kadar bayat kalırdı.
  async function switchTo(openFn) {
    if (currentCleanup) {
      currentCleanup();
      currentCleanup = null;
    }
    const result = await openFn();
    refreshHeaderNav();
    return result;
  }

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
    refreshHeaderNav();
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

  // --- Header dropdown ("Araçlar & Raporlar") -------------------------------

  const ARAC_MENU_ITEMS = [
    { action: "istatistik", key: "dashboard.istatistikTitle" },
    { action: "disaAktarma", key: "dashboard.disaAktarmaTitle" },
    { action: "redemittel", key: "dashboard.redemittelTitle" },
  ];

  function closeAraclarMenu() {
    navAraclarMenu.hidden = true;
    navAraclarToggle.setAttribute("aria-expanded", "false");
  }

  function openAraclarMenu() {
    navAraclarMenu.hidden = false;
    navAraclarToggle.setAttribute("aria-expanded", "true");
  }

  // Header ikonlarının kilit/rozet/i18n durumunu günceller. Bu durum
  // runtime'da değişebildiği için (kullanıcı bir Tema bitirince Leitner
  // verisi oluşur, bir DTZ Sınavı başlatılır/bitirilir...) hem dil
  // değişiminde (applyLanguage) hem dashboard her render edildiğinde
  // (renderDashboard) çağrılır.
  function refreshHeaderNav() {
    const hasLeitnerData = Object.keys(Storage.readAll().leitner).length > 0;
    const zayifLabel = hasLeitnerData
      ? I18n.t("dashboard.zayifKonularTitle")
      : I18n.t("dashboard.zayifKonularEmptyDesc");
    navZayifKonular.setAttribute("aria-disabled", hasLeitnerData ? "false" : "true");
    navZayifKonular.setAttribute("aria-label", zayifLabel);
    navZayifKonular.setAttribute("title", zayifLabel);

    navGunluk15.setAttribute("aria-label", I18n.t("dashboard.gunluk15Title"));
    navGunluk15.setAttribute("title", I18n.t("dashboard.gunluk15Title"));

    const kampAcikGun = Storage.getKampAcikGun();
    const kampLabel = `${I18n.t("dashboard.kampTitle")} — ${I18n.t("kamp.gunOfTotal", { gunNo: kampAcikGun })}`;
    navKamp.setAttribute("aria-label", kampLabel);
    navKamp.setAttribute("title", kampLabel);

    const dtzSinavSession = Storage.getDtzSinavSession();
    const dtzLabel = dtzSinavSession
      ? `${I18n.t("dashboard.dtzSinavTitle")} — ${I18n.t("dashboard.dtzSinavContinueBadge")}`
      : I18n.t("dashboard.dtzSinavTitle");
    navDtzSinav.setAttribute("aria-label", dtzLabel);
    navDtzSinav.setAttribute("title", dtzLabel);
    navDtzSinav.querySelector(".icon-btn-dot")?.remove();
    if (dtzSinavSession) {
      const dot = document.createElement("span");
      dot.className = "icon-btn-dot";
      navDtzSinav.appendChild(dot);
    }

    navAraclarToggle.setAttribute("aria-label", I18n.t("dashboard.araclarRaporlarHeading"));
    navAraclarToggle.setAttribute("title", I18n.t("dashboard.araclarRaporlarHeading"));

    ARAC_MENU_ITEMS.forEach(({ action, key }) => {
      const item = navAraclarMenu.querySelector(`[data-action="${action}"]`);
      const span = item?.querySelector("span");
      if (span) span.textContent = I18n.t(key);
    });
  }

  function initHeaderNav() {
    // Kamp icerigi (content/kamp-21-gun.json) yuklenemezse (bkz. loadKamp'in
    // catch'i), ikon eskiden dashboard kartinin hic gosterilmemesiyle ayni
    // parite icin gizlenir.
    loadKamp().then((data) => {
      navKamp.hidden = !data;
    });

    navZayifKonular.addEventListener("click", async () => {
      if (navZayifKonular.getAttribute("aria-disabled") === "true") return;
      await switchTo(async () => {
        const allData = await Promise.all(TEMALAR.map(loadTema));
        openZayifKonular(allData);
      });
    });

    navGunluk15.addEventListener("click", async () => {
      await switchTo(async () => {
        const allData = await Promise.all(TEMALAR.map(loadTema));
        openGunluk15(allData);
      });
    });

    navKamp.addEventListener("click", async () => {
      await switchTo(async () => {
        const [allData, kampData] = await Promise.all([
          Promise.all(TEMALAR.map(loadTema)),
          loadKamp(),
        ]);
        if (!kampData) return;
        openKamp(kampData, allData);
      });
    });

    navDtzSinav.addEventListener("click", async () => {
      await switchTo(async () => {
        const allData = await Promise.all(TEMALAR.map(loadTema));
        openDtzSinav(allData);
      });
    });

    navAraclarToggle.addEventListener("click", () => {
      const isOpen = navAraclarToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeAraclarMenu();
      else openAraclarMenu();
    });

    navAraclarMenu.addEventListener("click", async (e) => {
      const item = e.target.closest(".header-dropdown-item");
      if (!item) return;
      closeAraclarMenu();
      const action = item.getAttribute("data-action");
      await switchTo(async () => {
        if (action === "istatistik") {
          const allData = await Promise.all(TEMALAR.map(loadTema));
          openIstatistik(allData);
        } else if (action === "disaAktarma") {
          const allData = await Promise.all(TEMALAR.map(loadTema));
          openDisaAktarma(allData);
        } else if (action === "redemittel") {
          const redemittelData = await loadRedemittelBank();
          openRedemittelBank(redemittelData);
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (navAraclarToggle.getAttribute("aria-expanded") !== "true") return;
      if (navAraclarToggle.contains(e.target) || navAraclarMenu.contains(e.target)) return;
      closeAraclarMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (navAraclarToggle.getAttribute("aria-expanded") !== "true") return;
      closeAraclarMenu();
      navAraclarToggle.focus();
    });
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
    card.addEventListener("click", () => switchTo(() => openTema(latest.entry, latest.data, redemittelData)));
    app.appendChild(card);
  }

  async function renderDashboard() {
    currentRenderer = renderDashboard;
    currentCleanup = null;
    app.innerHTML = "";
    window.scrollTo(0, 0);

    const [allData, redemittelData] = await Promise.all([
      Promise.all(TEMALAR.map(loadTema)),
      loadRedemittelBank(),
    ]);

    renderContinueCard(allData, redemittelData);

    const temalarHeading = document.createElement("h2");
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
      card.addEventListener("click", () => switchTo(() => openTema(entry, data, redemittelData)));
      card.querySelector(".tema-reset-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!confirm(I18n.t("dashboard.resetConfirm", { baslik: data.baslik }))) return;
        Storage.resetTemaProgress(entry.id);
        renderDashboard();
      });
      temaGrid.appendChild(card);
    });
    app.appendChild(temaGrid);

    refreshHeaderNav();
  }

  function openTema(entry, data, redemittelData) {
    currentCleanup = null;
    currentRenderer = TemaModu.refresh;
    TemaModu.start(app, data, renderDashboard, redemittelData);
  }

  function openZayifKonular(allData) {
    currentCleanup = null;
    currentRenderer = ZayifKonularModu.refresh;
    ZayifKonularModu.start(app, allData, renderDashboard);
  }

  function openRedemittelBank(redemittelData) {
    currentCleanup = null;
    currentRenderer = () => RedemittelBank.renderFullView(app, redemittelData, renderDashboard);
    RedemittelBank.renderFullView(app, redemittelData, renderDashboard);
  }

  function openDtzSinav(allData) {
    if (!Storage.getDtzSinavSession() && !confirm(I18n.t("dtzSinav.startConfirm"))) return;
    currentRenderer = DtzSinavModu.refresh;
    DtzSinavModu.start(app, allData, renderDashboard);
    currentCleanup = DtzSinavModu.stop;
  }

  function openKamp(kampData, allData) {
    currentCleanup = null;
    currentRenderer = Kamp21GunModu.refresh;
    Kamp21GunModu.start(app, kampData, allData, renderDashboard);
  }

  function openGunluk15(allData) {
    currentCleanup = null;
    currentRenderer = Gunluk15DakikaModu.refresh;
    Gunluk15DakikaModu.start(app, allData, renderDashboard);
  }

  function openIstatistik(allData) {
    currentCleanup = null;
    currentRenderer = () => IstatistikEkrani.renderFullView(app, allData, renderDashboard);
    IstatistikEkrani.renderFullView(app, allData, renderDashboard);
  }

  function openDisaAktarma(allData) {
    currentCleanup = null;
    currentRenderer = () => DisaAktarma.renderFullView(app, allData, renderDashboard);
    DisaAktarma.renderFullView(app, allData, renderDashboard);
  }

  function init() {
    initTheme();
    initHeaderNav();
    initLanguage();
    renderDashboard();
  }

  return { init };
})();

App.init();
