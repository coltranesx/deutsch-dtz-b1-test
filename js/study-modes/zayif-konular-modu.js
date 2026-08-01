const ZayifKonularModu = (() => {
  const SESSION_SIZE = 10;
  let state = null;

  function pickSession(pool) {
    const now = Date.now();
    const scored = pool.map((q) => {
      const entry = Storage.getLeitnerEntry(q.id);
      return {
        q,
        box: entry?.box ?? 0,
        dueAt: entry?.dueAt ?? 0,
        due: !entry || entry.dueAt <= now,
      };
    });
    return scored
      .filter((s) => s.due)
      .sort((a, b) => a.box - b.box || a.dueAt - b.dueAt)
      .slice(0, SESSION_SIZE)
      .map((s) => s.q);
  }

  // Saf tasima: gercek hesaplama artik istatistik-yardimci.js'teki paylasilan
  // yardimcida yasiyor (Istatistik Ekrani ile ortak). Davranis (donen veri
  // sekli, siralama) birebir korunur.
  function computeWeakStats(pool) {
    return IstatistikYardimci.byGramerKategori(pool);
  }

  function start(container, temalar, onExit) {
    const pool = SoruHavuzu.collectPool(temalar);
    state = {
      container,
      pool,
      session: pickSession(pool),
      index: 0,
      correctInSession: 0,
      onExit,
      sessionStartedAt: Date.now(),
    };
    render();
  }

  function render() {
    const { container, session, index, pool } = state;
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => state.onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = I18n.t("dashboard.zayifKonularTitle");
    container.appendChild(h);

    if (session.length === 0) {
      renderEmpty(container, pool);
      return;
    }

    if (index >= session.length) {
      renderSummary(container, pool);
      return;
    }

    const progress = document.createElement("p");
    progress.className = "feedback";
    progress.textContent = I18n.t("zayif.questionProgress", { current: index + 1, total: session.length });
    container.appendChild(progress);

    const card = document.createElement("div");
    card.className = "card";
    const q = session[index];
    if (q.kaynak === "hoeren") {
      card.appendChild(SoruKart.renderAudioContext(q.sesUrl, q.transkript));
    }
    card.appendChild(
      SoruKart.renderMultipleChoice(q.temaId, q, {
        onAnswer: (correct) => {
          Storage.recordLeitnerResult(q.id, correct);
          if (correct) state.correctInSession += 1;
        },
        freshSince: state.sessionStartedAt,
      })
    );
    container.appendChild(card);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    btnRow.style.justifyContent = "flex-end";
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn";
    nextBtn.textContent = index === session.length - 1 ? I18n.t("nav.finish") : I18n.t("nav.nextQuestion");
    nextBtn.addEventListener("click", () => {
      state.index += 1;
      render();
    });
    btnRow.appendChild(nextBtn);
    container.appendChild(btnRow);
  }

  function renderEmpty(container, pool) {
    const note = document.createElement("p");
    note.textContent = I18n.t("zayif.emptyState");
    container.appendChild(note);
    renderStatsBlock(container, pool);
  }

  function renderSummary(container, pool) {
    const summary = document.createElement("div");
    summary.className = "card result-summary";
    summary.innerHTML = `
      <div class="result-score">${state.correctInSession}/${state.session.length}</div>
      <p>${I18n.t("zayif.sessionDone")}</p>
    `;
    container.appendChild(summary);
    renderStatsBlock(container, pool);
  }

  function renderStatsBlock(container, pool) {
    const stats = computeWeakStats(pool);
    if (stats.length === 0) return;
    const wrap = document.createElement("div");
    wrap.className = "card";
    const h3 = document.createElement("h3");
    h3.style.marginTop = "0";
    h3.textContent = I18n.t("zayif.categoryStatsHeading");
    wrap.appendChild(h3);
    stats.forEach((s) => {
      const pct = Math.round(s.oran * 100);
      const row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = `
        <div class="stat-row-label"><span>${s.kategori}</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      `;
      wrap.appendChild(row);
    });
    container.appendChild(wrap);
  }

  function refresh() {
    if (!state) return;
    render();
  }

  return { start, refresh };
})();
