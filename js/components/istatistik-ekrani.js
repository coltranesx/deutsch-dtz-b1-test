const IstatistikEkrani = (() => {
  // Sprachhandlung ekseni sadece gramer sorularindan beslenir (hoeren'de
  // sprachhandlung alani yok), bu yuzden ortalama diger eksenlerden daha
  // seyrek olabilir. Toplam ornek sayisi bu esigin altindaysa bir "yeterli
  // veri yok" notu gosterilir.
  const SPRACHHANDLUNG_MIN_SAMPLE = 5;

  function heatClass(pct) {
    if (pct >= 70) return "heat-good";
    if (pct >= 40) return "heat-mid";
    return "heat-bad";
  }

  // stats: [{ ..., toplam, oran }]. resolveLabel(stat) -> gosterilecek etiket metni.
  function renderHeatBlock(heading, stats, resolveLabel) {
    const wrap = document.createElement("div");
    wrap.className = "card";
    const h3 = document.createElement("h3");
    h3.style.marginTop = "0";
    h3.textContent = heading;
    wrap.appendChild(h3);

    if (stats.length === 0) {
      const empty = document.createElement("p");
      empty.className = "feedback";
      empty.textContent = I18n.t("istatistik.noDataForSection");
      wrap.appendChild(empty);
      return wrap;
    }

    stats.forEach((s) => {
      const pct = Math.round(s.oran * 100);
      const row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = `
        <div class="stat-row-label"><span>${resolveLabel(s)}</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-bar-fill ${heatClass(pct)}" style="width:${pct}%"></div></div>
      `;
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderTemaHeatMap(container, pool, temaById) {
    const stats = IstatistikYardimci.byTema(pool);
    container.appendChild(
      renderHeatBlock(I18n.t("istatistik.temaHeatmapTitle"), stats, (s) => temaById[s.temaId]?.baslik ?? s.temaId)
    );
  }

  function renderGramerHeatMap(container, pool) {
    const stats = IstatistikYardimci.byGramerKategori(pool);
    container.appendChild(renderHeatBlock(I18n.t("istatistik.gramerHeatmapTitle"), stats, (s) => s.kategori));
  }

  function renderSprachhandlungHeatMap(container, pool) {
    const stats = IstatistikYardimci.bySprachhandlung(pool);
    const totalToplam = stats.reduce((sum, s) => sum + s.toplam, 0);
    container.appendChild(
      renderHeatBlock(I18n.t("istatistik.sprachhandlungHeatmapTitle"), stats, (s) => s.sprachhandlung)
    );
    if (totalToplam < SPRACHHANDLUNG_MIN_SAMPLE) {
      const note = document.createElement("p");
      note.className = "feedback";
      note.textContent = I18n.t("istatistik.lowSampleNote");
      container.appendChild(note);
    }
  }

  // Kelime metrigi karari (v2.0): tema-modu.js'te kelime adimi salt-okunur
  // bir listedir, Storage.saveAnswer() hic cagrilmaz — per-kelime kayit yok.
  // Bu yuzden kelime ilerlemesi Tema bazinda ikili bir sinyaldir:
  // Storage.getProgress(temaId).completedSteps "kelime" iceriyor mu. Isi
  // haritalarindan (dogruluk orani kavramindan) ayri, kendi basina bir bolum.
  function renderKelimeIlerleme(container, allTemaData) {
    const wrap = document.createElement("div");
    wrap.className = "card istatistik-kelime-block";
    const h3 = document.createElement("h3");
    h3.style.marginTop = "0";
    h3.textContent = I18n.t("istatistik.kelimeIlerlemeTitle");
    wrap.appendChild(h3);

    const list = document.createElement("ul");
    list.className = "istatistik-kelime-list";
    let tamamlanan = 0;
    allTemaData.forEach((tema) => {
      const done = Storage.getProgress(tema.temaId).completedSteps.includes("kelime");
      if (done) tamamlanan += 1;
      const li = document.createElement("li");
      li.className = done ? "istatistik-kelime-done" : "istatistik-kelime-todo";
      li.textContent = `${done ? "✓" : "✗"} ${tema.baslik}`;
      list.appendChild(li);
    });
    wrap.appendChild(list);

    const summary = document.createElement("p");
    summary.className = "feedback";
    summary.textContent = I18n.t("istatistik.kelimeIlerlemeSummary", {
      done: tamamlanan,
      total: allTemaData.length,
    });
    wrap.appendChild(summary);

    container.appendChild(wrap);
  }

  // Study Mode DEGIL: state/session yok, her acilista Storage + soru
  // havuzundan yeniden hesaplanan salt-okunur bir rapor (redemittel-bank.js
  // ile ayni renderFullView(container, data, onExit) deseni).
  function renderFullView(container, allTemaData, onExit) {
    container.innerHTML = "";
    window.scrollTo(0, 0);

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = I18n.t("dashboard.istatistikTitle");
    container.appendChild(h);

    const desc = document.createElement("p");
    desc.className = "feedback";
    desc.textContent = I18n.t("istatistik.fullViewDesc");
    container.appendChild(desc);

    const temaById = {};
    allTemaData.forEach((tema) => {
      temaById[tema.temaId] = tema;
    });
    const pool = SoruHavuzu.collectPool(allTemaData);
    const hasLeitnerData = pool.some((q) => Storage.getLeitnerEntry(q.id));

    if (!hasLeitnerData) {
      const empty = document.createElement("p");
      empty.textContent = I18n.t("istatistik.emptyState");
      container.appendChild(empty);
    } else {
      renderTemaHeatMap(container, pool, temaById);
      renderGramerHeatMap(container, pool);
      renderSprachhandlungHeatMap(container, pool);
    }

    renderKelimeIlerleme(container, allTemaData);
  }

  return { renderFullView };
})();
