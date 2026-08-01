const DtzSinavModu = (() => {
  // PRD §17.3
  const HOEREN_DURATION_MS = 25 * 60 * 1000;
  const LESEN_DURATION_MS = 45 * 60 * 1000;
  const HOEREN_TOTAL = 20;
  const HOEREN_SECOND_PICK = 9;
  const SECTION_ORDER = ["hoeren", "lesen", "schreiben", "sprechen", "sonuc"];
  const SPRECHEN_ANSWER_IDS = [
    "sprechen-teil1",
    "sprechen-teil2-beschreibung",
    "sprechen-teil2-vergleich",
    "sprechen-teil3",
  ];

  // state: { container, allTemaData, temaById, onExit, session, hoerenPool,
  //          lesenPool, intervalId, timerValueEl, timerLockEl, activeTimerSection, cardEl }
  let state = null;

  // Fisher-Yates: yerinde karıştırmaz, kopya döndürür (bkz. gunluk-15-dakika.js).
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // 22 Hören sorusundan 20'sini seçer: her Tema'nın (grubun) Fisher-Yates ile
  // 1 sorusu garanti edilir (11 soru), kalan 11'den 9'u yine Fisher-Yates ile
  // eklenir (bkz. PRD §17.3).
  function pickHoerenIds(hoerenPool) {
    const byTema = {};
    hoerenPool.forEach((q) => {
      if (!byTema[q.temaId]) byTema[q.temaId] = [];
      byTema[q.temaId].push(q);
    });

    const firstPicks = [];
    const secondPool = [];
    Object.values(byTema).forEach((group) => {
      const shuffled = shuffle(group);
      firstPicks.push(shuffled[0]);
      secondPool.push(...shuffled.slice(1));
    });

    const secondPicks = shuffle(secondPool).slice(0, HOEREN_SECOND_PICK);
    return [...firstPicks, ...secondPicks].map((q) => q.id);
  }

  function resolveQuestionsByIds(pool, ids) {
    const byId = {};
    pool.forEach((q) => {
      byId[q.id] = q;
    });
    return ids.map((id) => byId[id]).filter(Boolean);
  }

  function createSession(allTemaData, hoerenPool) {
    const hoerenIds = pickHoerenIds(hoerenPool);
    const randomTema = allTemaData[Math.floor(Math.random() * allTemaData.length)];
    return {
      startedAt: Date.now(),
      currentSection: "hoeren",
      hoerenIds,
      hoerenDeadline: SinavSayaciYardimci.createDeadline(HOEREN_DURATION_MS),
      lesenDeadline: null,
      sectionAutoFinished: { hoeren: false, lesen: false },
      schreibenSprechenTemaId: randomTema.temaId,
    };
  }

  // Bir sonraki bölüme geçer; Lesen'e ilk girişte deadline burada oluşturulur
  // (hem manuel "Bölümü Bitir" hem de otomatik süre-doldu geçişi bu yoldan geçer).
  function enterSection(session, next) {
    session.currentSection = next;
    if (next === "lesen" && !session.lesenDeadline) {
      session.lesenDeadline = SinavSayaciYardimci.createDeadline(LESEN_DURATION_MS);
    }
  }

  // Sayfa yeniden açıldığında (F5, dashboard'a çıkıp geri dönme) süresi çoktan
  // dolmuş bölümleri zincirleme olarak ilerletir — kullanıcı süre dolduğunda
  // bölümde kilitli kalmaz (PRD §17.3).
  function applyAutoAdvance(session, now) {
    let advanced = true;
    while (advanced) {
      advanced = false;
      if (session.currentSection === "hoeren" && now >= session.hoerenDeadline) {
        session.sectionAutoFinished.hoeren = true;
        enterSection(session, "lesen");
        advanced = true;
      } else if (
        session.currentSection === "lesen" &&
        session.lesenDeadline &&
        now >= session.lesenDeadline
      ) {
        session.sectionAutoFinished.lesen = true;
        enterSection(session, "schreiben");
        advanced = true;
      }
    }
    return session;
  }

  function start(container, allTemaData, onExit) {
    const temaById = {};
    allTemaData.forEach((tema) => {
      temaById[tema.temaId] = tema;
    });

    const pool = SoruHavuzu.collectPool(allTemaData);
    const hoerenPool = pool.filter((q) => q.kaynak === "hoeren");
    const lesenPool = pool.filter((q) => q.kaynak === "lesen");

    let session = Storage.getDtzSinavSession();
    if (session) {
      session = applyAutoAdvance(session, Date.now());
    } else {
      session = createSession(allTemaData, hoerenPool);
    }
    Storage.saveDtzSinavSession(session);

    state = {
      container,
      allTemaData,
      temaById,
      onExit,
      session,
      hoerenPool,
      lesenPool,
      intervalId: null,
      timerValueEl: null,
      timerLockEl: null,
      activeTimerSection: null,
      cardEl: null,
    };
    render();
  }

  // --- Sayaç yönetimi -----------------------------------------------------
  // `state.timerValueEl`/`state.timerLockEl` render sonrası her zaman güncel
  // DOM referanslarını tutar; interval bu referansları okur, kendi başına
  // yeniden başlatılmaz (refresh() sadece DOM'u günceller, bkz. altta).

  function stopTimer() {
    if (state && state.intervalId) {
      clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  function currentDeadline() {
    if (state.activeTimerSection === "hoeren") return state.session.hoerenDeadline;
    if (state.activeTimerSection === "lesen") return state.session.lesenDeadline;
    return null;
  }

  function lockSection(el) {
    if (!el) return;
    el.classList.add("locked");
    el.querySelectorAll("input, textarea, button").forEach((node) => {
      node.disabled = true;
    });
  }

  function showTimeUpBanner() {
    if (!state.cardEl) return;
    const banner = document.createElement("div");
    banner.className = "dtz-sinav-timeup-banner";
    banner.textContent = I18n.t("dtzSinav.timeUpNotice");
    state.cardEl.prepend(banner);
  }

  function finishSectionAuto(sectionKey) {
    if (!state) return;
    const session = state.session;
    if (sectionKey === "hoeren") {
      session.sectionAutoFinished.hoeren = true;
      enterSection(session, "lesen");
    } else if (sectionKey === "lesen") {
      session.sectionAutoFinished.lesen = true;
      enterSection(session, "schreiben");
    }
    Storage.saveDtzSinavSession(session);
    render();
  }

  function tick() {
    const deadline = currentDeadline();
    if (deadline == null) return;
    const remaining = SinavSayaciYardimci.remainingMs(deadline);
    if (state.timerValueEl) {
      state.timerValueEl.textContent = SinavSayaciYardimci.formatRemaining(remaining);
    }
    if (remaining <= 0) {
      const sectionAtTimeout = state.activeTimerSection;
      stopTimer();
      lockSection(state.timerLockEl);
      showTimeUpBanner();
      setTimeout(() => finishSectionAuto(sectionAtTimeout), 2500);
    }
  }

  function restartTimer() {
    stopTimer();
    if (state.activeTimerSection) {
      state.intervalId = setInterval(tick, 1000);
      tick();
    }
  }

  // --- Ortak DOM yardimcilari ----------------------------------------------

  function sectionPillLabel(section) {
    if (section === "sonuc") return I18n.t("dtzSinav.sonucLabel");
    return I18n.t(`step.${section}`);
  }

  function renderTopBar() {
    const wrap = document.createElement("div");

    const navRow = document.createElement("div");
    navRow.className = "btn-row";
    navRow.style.marginBottom = "1rem";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.addEventListener("click", () => {
      stopTimer();
      state.onExit();
    });
    navRow.appendChild(backBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn secondary";
    cancelBtn.textContent = I18n.t("dtzSinav.cancelExam");
    cancelBtn.addEventListener("click", () => {
      if (!confirm(I18n.t("dtzSinav.cancelConfirm"))) return;
      stopTimer();
      Storage.clearDtzSinavSession();
      state.onExit();
    });
    navRow.appendChild(cancelBtn);

    wrap.appendChild(navRow);

    const h = document.createElement("h2");
    h.textContent = I18n.t("dtzSinav.title");
    wrap.appendChild(h);

    const nav = document.createElement("div");
    nav.className = "step-nav";
    const currentIdx = SECTION_ORDER.indexOf(state.session.currentSection);
    SECTION_ORDER.forEach((section, idx) => {
      const pill = document.createElement("span");
      pill.className = "step-pill";
      if (idx === currentIdx) pill.classList.add("active");
      else if (idx < currentIdx) pill.classList.add("done");
      pill.textContent = sectionPillLabel(section);
      nav.appendChild(pill);
    });
    wrap.appendChild(nav);

    return wrap;
  }

  function renderTimerBar() {
    const bar = document.createElement("div");
    bar.className = "dtz-sinav-timer";
    const label = document.createElement("span");
    label.textContent = I18n.t("dtzSinav.timeRemaining");
    const value = document.createElement("span");
    value.className = "dtz-sinav-timer-value";
    bar.appendChild(label);
    bar.appendChild(value);
    return { bar, value };
  }

  function renderSectionFinishButton(nextSection, label) {
    const row = document.createElement("div");
    row.className = "btn-row";
    row.style.justifyContent = "flex-end";
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      enterSection(state.session, nextSection);
      Storage.saveDtzSinavSession(state.session);
      render();
    });
    row.appendChild(btn);
    return row;
  }

  function renderGradedQuestion(q) {
    return SoruKart.renderMultipleChoice(q.temaId, q, {
      onAnswer: (correct) => Storage.recordLeitnerResult(q.id, correct),
      freshSince: state.session.startedAt,
    });
  }

  // --- Hören / Lesen bölümleri ---------------------------------------------

  function renderHoerenSection() {
    const { session, hoerenPool } = state;
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.hoeren");
    wrap.appendChild(h);

    const timer = renderTimerBar();
    wrap.appendChild(timer.bar);

    const questionsWrap = document.createElement("div");
    questionsWrap.className = "dtz-sinav-questions";
    resolveQuestionsByIds(hoerenPool, session.hoerenIds).forEach((q) => {
      questionsWrap.appendChild(SoruKart.renderAudioContext(q.sesUrl, q.transkript));
      questionsWrap.appendChild(renderGradedQuestion(q));
    });
    wrap.appendChild(questionsWrap);

    wrap.appendChild(renderSectionFinishButton("lesen", I18n.t("dtzSinav.finishSectionBtn")));

    state.timerValueEl = timer.value;
    state.timerLockEl = questionsWrap;
    state.activeTimerSection = "hoeren";
    return wrap;
  }

  function renderLesenSection() {
    const { lesenPool, temaById } = state;
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.lesen");
    wrap.appendChild(h);

    const timer = renderTimerBar();
    wrap.appendChild(timer.bar);

    const questionsWrap = document.createElement("div");
    questionsWrap.className = "dtz-sinav-questions";

    const byTema = {};
    lesenPool.forEach((q) => {
      if (!byTema[q.temaId]) byTema[q.temaId] = [];
      byTema[q.temaId].push(q);
    });

    Object.keys(byTema).forEach((temaId) => {
      const tema = temaById[temaId];
      const block = document.createElement("div");
      block.className = "dtz-sinav-lesen-block";
      if (tema?.lesen?.metin) {
        const p = document.createElement("p");
        p.textContent = tema.lesen.metin;
        block.appendChild(p);
      }
      byTema[temaId].forEach((q) => block.appendChild(renderGradedQuestion(q)));
      questionsWrap.appendChild(block);
    });
    wrap.appendChild(questionsWrap);

    wrap.appendChild(renderSectionFinishButton("schreiben", I18n.t("dtzSinav.finishSectionBtn")));

    state.timerValueEl = timer.value;
    state.timerLockEl = questionsWrap;
    state.activeTimerSection = "lesen";
    return wrap;
  }

  // --- Schreiben / Sprechen bölümleri (puansız, aynı Tema) -----------------

  function renderNotGradedNote() {
    const p = document.createElement("p");
    p.className = "feedback";
    p.textContent = I18n.t("dtzSinav.notGraded");
    return p;
  }

  function renderSchreibenSection() {
    const tema = state.temaById[state.session.schreibenSprechenTemaId];
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.schreiben");
    wrap.appendChild(h);
    wrap.appendChild(renderNotGradedNote());

    const task = tema.schreiben;
    const gorev = document.createElement("p");
    gorev.className = "question-text";
    gorev.textContent = task.gorev;
    wrap.appendChild(gorev);

    const list = document.createElement("ul");
    list.className = "leitpunkte-list";
    task.leitpunkte.forEach((lp, i) => {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      const checkId = `schreiben-lp-${i}`;
      checkbox.checked = Storage.getAnswer(tema.temaId, checkId) === true;
      checkbox.addEventListener("change", () => {
        Storage.saveAnswer(tema.temaId, checkId, checkbox.checked);
      });
      li.appendChild(checkbox);
      li.appendChild(document.createTextNode(lp));
      list.appendChild(li);
    });
    wrap.appendChild(list);

    const hint = document.createElement("p");
    hint.className = "feedback";
    hint.textContent = I18n.t("schreiben.targetLabel", { min: task.minKelime, max: task.maxKelime });
    wrap.appendChild(hint);

    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(tema.temaId, "schreiben-metin") ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "schreiben-metin", textarea.value);
    });
    wrap.appendChild(textarea);

    wrap.appendChild(renderSectionFinishButton("sprechen", I18n.t("nav.continue")));
    return wrap;
  }

  // Sadece Teil 1/Teil 3 icin — Teil 2'nin iki alt-sorusu (beschreibung +
  // vergleich) kendine ozgu bir yapiya sahip oldugu icin ayri render edilir.
  function renderSprechenTeil(tema, teilKey, promptText) {
    const block = document.createElement("div");
    block.className = "question-block";

    const label = document.createElement("div");
    label.className = "question-text";
    label.textContent = `${I18n.t(`sprechen.${teilKey}`)} - ${promptText}`;
    block.appendChild(label);

    const answerId = `sprechen-${teilKey}`;
    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(tema.temaId, answerId) ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, answerId, textarea.value);
    });
    block.appendChild(textarea);
    return block;
  }

  function renderSprechenSection() {
    const tema = state.temaById[state.session.schreibenSprechenTemaId];
    const s = tema.sprechen;
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.sprechen");
    wrap.appendChild(h);
    wrap.appendChild(renderNotGradedNote());

    wrap.appendChild(renderSprechenTeil(tema, "teil1", s.teil1FollowUp.frage));

    const teil2 = document.createElement("div");
    teil2.className = "question-block";
    const teil2Label = document.createElement("div");
    teil2Label.className = "question-text";
    teil2Label.textContent = I18n.t("sprechen.teil2");
    teil2.appendChild(teil2Label);
    if (s.teil2.fotoUrl) {
      const foto = document.createElement("img");
      foto.alt = I18n.t("sprechen.fotoAlt");
      foto.className = "sprechen-foto";
      foto.addEventListener("error", () => foto.remove());
      foto.src = s.teil2.fotoUrl;
      teil2.appendChild(foto);
    }
    const teil2Prompt = document.createElement("p");
    teil2Prompt.textContent = s.teil2.beschreibungsPrompt;
    teil2.appendChild(teil2Prompt);
    const teil2Desc = document.createElement("textarea");
    teil2Desc.value = Storage.getAnswer(tema.temaId, "sprechen-teil2-beschreibung") ?? "";
    teil2Desc.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "sprechen-teil2-beschreibung", teil2Desc.value);
    });
    teil2.appendChild(teil2Desc);

    const teil2CompareLabel = document.createElement("p");
    teil2CompareLabel.textContent = s.teil2.vergleichsPrompt;
    teil2.appendChild(teil2CompareLabel);
    const teil2Compare = document.createElement("textarea");
    teil2Compare.value = Storage.getAnswer(tema.temaId, "sprechen-teil2-vergleich") ?? "";
    teil2Compare.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "sprechen-teil2-vergleich", teil2Compare.value);
    });
    teil2.appendChild(teil2Compare);
    wrap.appendChild(teil2);

    const teil3 = document.createElement("div");
    teil3.className = "question-block";
    const teil3Label = document.createElement("div");
    teil3Label.className = "question-text";
    teil3Label.textContent = I18n.t("sprechen.teil3");
    teil3.appendChild(teil3Label);
    const teil3Szenario = document.createElement("p");
    teil3Szenario.textContent = s.teil3.szenario;
    teil3.appendChild(teil3Szenario);
    const teil3Input = document.createElement("textarea");
    teil3Input.value = Storage.getAnswer(tema.temaId, "sprechen-teil3") ?? "";
    teil3Input.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "sprechen-teil3", teil3Input.value);
    });
    teil3.appendChild(teil3Input);
    wrap.appendChild(teil3);

    wrap.appendChild(renderSectionFinishButton("sonuc", I18n.t("dtzSinav.finishExamBtn")));
    return wrap;
  }

  // --- Sonuç ekranı ---------------------------------------------------------

  function computeSeviye(toplamDogru) {
    if (toplamDogru < 20) return I18n.t("dtzSinav.levelBelowA2");
    if (toplamDogru <= 32) return I18n.t("dtzSinav.levelA2");
    return I18n.t("dtzSinav.levelB1");
  }

  function renderSonucSection() {
    const { session, hoerenPool, lesenPool, temaById } = state;
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("dtzSinav.sonucTitle");
    wrap.appendChild(h);

    const hoerenQuestions = resolveQuestionsByIds(hoerenPool, session.hoerenIds);
    const hoerenDogru = hoerenQuestions.filter(
      (q) => Storage.getAnswer(q.temaId, q.id) === q.dogruCevap
    ).length;
    const lesenDogru = lesenPool.filter((q) => Storage.getAnswer(q.temaId, q.id) === q.dogruCevap).length;
    const toplamDogru = hoerenDogru + lesenDogru;
    const toplamSoru = hoerenQuestions.length + lesenPool.length;

    const summary = document.createElement("div");
    summary.className = "result-summary";
    const score = document.createElement("div");
    score.className = "result-score";
    score.textContent = `${toplamDogru}/${toplamSoru}`;
    summary.appendChild(score);
    const seviyeP = document.createElement("p");
    seviyeP.textContent = computeSeviye(toplamDogru);
    summary.appendChild(seviyeP);
    const breakdownP = document.createElement("p");
    breakdownP.className = "feedback";
    breakdownP.textContent = I18n.t("dtzSinav.hoerenLesenBreakdown", {
      hoeren: hoerenDogru,
      hoerenTotal: hoerenQuestions.length,
      lesen: lesenDogru,
      lesenTotal: lesenPool.length,
    });
    summary.appendChild(breakdownP);
    wrap.appendChild(summary);

    const tema = temaById[session.schreibenSprechenTemaId];
    const schreibenDone = Boolean(Storage.getAnswer(tema.temaId, "schreiben-metin")?.trim());
    const sprechenDone = SPRECHEN_ANSWER_IDS.some((id) => Storage.getAnswer(tema.temaId, id)?.trim());

    const badges = document.createElement("p");
    badges.textContent = `${I18n.t("step.schreiben")}: ${
      schreibenDone ? I18n.t("dtzSinav.completedBadge") : I18n.t("dtzSinav.notCompletedBadge")
    } · ${I18n.t("step.sprechen")}: ${
      sprechenDone ? I18n.t("dtzSinav.completedBadge") : I18n.t("dtzSinav.notCompletedBadge")
    }`;
    wrap.appendChild(badges);

    const note = document.createElement("p");
    note.className = "feedback";
    note.textContent = I18n.t("dtzSinav.generalResultNote");
    wrap.appendChild(note);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    btnRow.style.justifyContent = "center";
    const finishBtn = document.createElement("button");
    finishBtn.className = "btn";
    finishBtn.textContent = I18n.t("dtzSinav.finishExam");
    finishBtn.addEventListener("click", () => {
      stopTimer();
      Storage.clearDtzSinavSession();
      state.onExit();
    });
    btnRow.appendChild(finishBtn);
    wrap.appendChild(btnRow);

    return wrap;
  }

  // --- Render orkestrasyonu --------------------------------------------------

  function buildDom() {
    const { container } = state;
    container.innerHTML = "";
    container.appendChild(renderTopBar());

    const card = document.createElement("div");
    card.className = "card";
    state.timerValueEl = null;
    state.timerLockEl = null;
    state.activeTimerSection = null;

    switch (state.session.currentSection) {
      case "hoeren":
        card.appendChild(renderHoerenSection());
        break;
      case "lesen":
        card.appendChild(renderLesenSection());
        break;
      case "schreiben":
        card.appendChild(renderSchreibenSection());
        break;
      case "sprechen":
        card.appendChild(renderSprechenSection());
        break;
      case "sonuc":
        card.appendChild(renderSonucSection());
        break;
      default:
        break;
    }

    container.appendChild(card);
    state.cardEl = card;
  }

  // Bölüm geçişleri / buton tıklamaları için: DOM yeniden çizilir VE sayaç
  // (varsa) yeni bölümün deadline'ıyla yeniden başlatılır.
  function render() {
    buildDom();
    restartTimer();
  }

  // Dil değişimi için: sadece DOM yeniden çizilir, mevcut interval'e
  // dokunulmaz — yeni DOM referansları bir sonraki tick()'te otomatik
  // kullanılır (bkz. tick()/currentDeadline()), bu yüzden anında bir kez
  // manuel tick() çağrılır ki kalan süre ekranda hemen doğru görünsün.
  function refresh() {
    if (!state) return;
    buildDom();
    if (state.activeTimerSection) tick();
  }

  return { start, refresh };
})();
