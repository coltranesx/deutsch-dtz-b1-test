const ZayifKonularModu = (() => {
  const SESSION_SIZE = 10;
  let state = null;

  function collectPool(temalar) {
    const pool = [];
    temalar.forEach((tema) => {
      tema.gramer.forEach((q) => pool.push({ ...q, temaId: tema.temaId, kaynak: "gramer" }));
      tema.hoeren.sorular.forEach((q) =>
        pool.push({
          ...q,
          temaId: tema.temaId,
          kaynak: "hoeren",
          sesUrl: tema.hoeren.sesUrl,
          transkript: tema.hoeren.transkript,
        })
      );
    });
    return pool;
  }

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

  function computeWeakStats(pool) {
    const byKategori = {};
    pool.forEach((q) => {
      if (!q.konu) return;
      const entry = Storage.getLeitnerEntry(q.id);
      if (!entry) return;
      const kategori = q.konu.split(".")[0];
      if (!byKategori[kategori]) byKategori[kategori] = { correct: 0, incorrect: 0 };
      byKategori[kategori].correct += entry.correctCount;
      byKategori[kategori].incorrect += entry.incorrectCount;
    });
    return Object.entries(byKategori)
      .map(([kategori, s]) => ({
        kategori,
        toplam: s.correct + s.incorrect,
        oran: s.correct / (s.correct + s.incorrect),
      }))
      .sort((a, b) => a.oran - b.oran);
  }

  function start(container, temalar, onExit) {
    const pool = collectPool(temalar);
    state = {
      container,
      pool,
      session: pickSession(pool),
      index: 0,
      correctInSession: 0,
      onExit,
    };
    render();
  }

  function render() {
    const { container, session, index, pool } = state;
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = "< Panele dön";
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => state.onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = "Zayıf Konular Modu";
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
    progress.textContent = `Soru ${index + 1}/${session.length}`;
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
      })
    );
    container.appendChild(card);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    btnRow.style.justifyContent = "flex-end";
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn";
    nextBtn.textContent = index === session.length - 1 ? "Bitir" : "Sonraki soru";
    nextBtn.addEventListener("click", () => {
      state.index += 1;
      render();
    });
    btnRow.appendChild(nextBtn);
    container.appendChild(btnRow);
  }

  function renderEmpty(container, pool) {
    const note = document.createElement("p");
    note.textContent = "Şu an tekrar edilecek soru yok, hepsi güncel. Yeni sorular için bir Tema tamamlayın.";
    container.appendChild(note);
    renderStatsBlock(container, pool);
  }

  function renderSummary(container, pool) {
    const summary = document.createElement("div");
    summary.className = "card result-summary";
    summary.innerHTML = `
      <div class="result-score">${state.correctInSession}/${state.session.length}</div>
      <p>Bu tekrar oturumu tamamlandı</p>
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
    h3.textContent = "Kategori bazlı başarı";
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

  return { start };
})();
