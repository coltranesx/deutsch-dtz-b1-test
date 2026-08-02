const Gunluk15DakikaModu = (() => {
  const TEKRAR_HEDEF = 7;
  const YENI_HEDEF = 3;
  const SESSION_SIZE = TEKRAR_HEDEF + YENI_HEDEF;

  let state = null; // { container, temalar, pool, session, index, correctInSession, onExit }

  function pickSession(pool) {
    const now = Date.now();
    const tekrarAday = [];
    const yeniAday = [];

    pool.forEach((q) => {
      const entry = Storage.getLeitnerEntry(q.id);
      if (!entry) {
        yeniAday.push(q);
      } else if (entry.dueAt <= now) {
        tekrarAday.push({ q, box: entry.box, dueAt: entry.dueAt });
      }
    });

    tekrarAday.sort((a, b) => a.box - b.box || a.dueAt - b.dueAt);
    const tekrarSirali = tekrarAday.map((s) => s.q);
    const yeniKarisik = KaristirmaYardimci.shuffle(yeniAday);

    let tekrarSecim = tekrarSirali.slice(0, TEKRAR_HEDEF);
    let yeniSecim = yeniKarisik.slice(0, YENI_HEDEF);

    // Çapraz doldurma: bir havuz hedefinin altında kalırsa diğerinden tamamlanır.
    if (tekrarSecim.length < TEKRAR_HEDEF) {
      const eksik = TEKRAR_HEDEF - tekrarSecim.length;
      yeniSecim = yeniKarisik.slice(0, YENI_HEDEF + eksik);
    } else if (yeniSecim.length < YENI_HEDEF) {
      const eksik = YENI_HEDEF - yeniSecim.length;
      tekrarSecim = tekrarSirali.slice(0, TEKRAR_HEDEF + eksik);
    }

    const tekrarIds = new Set(tekrarSecim.map((q) => q.id));
    const session = [
      ...tekrarSecim.map((q) => ({ q, tur: "tekrar" })),
      ...yeniSecim.filter((q) => !tekrarIds.has(q.id)).map((q) => ({ q, tur: "yeni" })),
    ].slice(0, SESSION_SIZE);

    return session;
  }

  function start(container, temalar, onExit) {
    const pool = SoruHavuzu.collectPool(temalar);
    state = {
      container,
      temalar,
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
    const { container, session, index } = state;
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => state.onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = I18n.t("dashboard.gunluk15Title");
    container.appendChild(h);

    if (session.length === 0) {
      renderEmpty(container);
      return;
    }

    if (index >= session.length) {
      renderSummary(container);
      return;
    }

    const progress = document.createElement("p");
    progress.className = "feedback";
    progress.textContent = I18n.t("zayif.questionProgress", { current: index + 1, total: session.length });
    container.appendChild(progress);

    const card = document.createElement("div");
    card.className = "card";

    const entry = session[index];
    if (entry.tur === "tekrar") {
      const badge = document.createElement("span");
      badge.className = "tekrar-badge";
      badge.textContent = I18n.t("kamp.tekrarBadge");
      card.appendChild(badge);
    }

    const q = entry.q;
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

  function renderEmpty(container) {
    const note = document.createElement("p");
    note.textContent = I18n.t("gunluk15.emptyState");
    container.appendChild(note);
  }

  function renderSummary(container) {
    const summary = document.createElement("div");
    summary.className = "card result-summary";
    summary.innerHTML = `
      <div class="result-score">${state.correctInSession}/${state.session.length}</div>
      <p>${I18n.t("gunluk15.sessionDone")}</p>
    `;
    container.appendChild(summary);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    btnRow.style.justifyContent = "center";
    const restartBtn = document.createElement("button");
    restartBtn.className = "btn";
    restartBtn.textContent = I18n.t("gunluk15.startNewSession");
    restartBtn.addEventListener("click", () => {
      state.session = pickSession(state.pool);
      state.index = 0;
      state.correctInSession = 0;
      state.sessionStartedAt = Date.now();
      render();
    });
    btnRow.appendChild(restartBtn);
    container.appendChild(btnRow);
  }

  function refresh() {
    if (!state) return;
    render();
  }

  return { start, refresh };
})();
