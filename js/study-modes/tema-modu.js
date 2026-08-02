const TemaModu = (() => {
  const STEPS = ["kelime", "gramer", "lesen", "hoeren", "schreiben", "sprechen", "miniTest"];

  const SPRECHEN_REDEMITTEL_MAP = {
    teil1: ["verstaendnissicherung"],
    teil2: ["kompensation"],
    teil3: ["redeorganisation", "kompensation"],
  };

  let state = null;

  function start(container, tema, onExit, redemittelData = null) {
    const progress = Storage.getProgress(tema.temaId);
    const nextIncompleteIndex = STEPS.findIndex((s) => !progress.completedSteps.includes(s));
    state = {
      container,
      tema,
      onExit,
      redemittel: redemittelData,
      stepIndex: nextIncompleteIndex === -1 ? STEPS.length - 1 : nextIncompleteIndex,
    };
    render();
  }

  function render() {
    const { container, tema, stepIndex } = state;
    const step = STEPS[stepIndex];
    const progress = Storage.getProgress(tema.temaId);

    container.innerHTML = "";
    window.scrollTo(0, 0);

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => state.onExit());
    container.appendChild(backBtn);

    const nav = document.createElement("div");
    nav.className = "step-nav";
    STEPS.forEach((s, i) => {
      const pill = document.createElement("span");
      pill.className = "step-pill";
      if (i === stepIndex) pill.classList.add("active");
      else if (progress.completedSteps.includes(s)) pill.classList.add("done");
      pill.textContent = `${i + 1}. ${I18n.t(`step.${s}`)}`;
      nav.appendChild(pill);
    });
    container.appendChild(nav);

    const card = document.createElement("div");
    card.className = "card";
    card.appendChild(renderStep(step, tema));
    container.appendChild(card);

    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const prevBtn = document.createElement("button");
    prevBtn.className = "btn secondary";
    prevBtn.textContent = I18n.t("nav.back");
    prevBtn.disabled = stepIndex === 0;
    prevBtn.addEventListener("click", () => {
      state.stepIndex -= 1;
      render();
    });
    btnRow.appendChild(prevBtn);

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn";
    nextBtn.textContent = stepIndex === STEPS.length - 1 ? I18n.t("nav.finishTema") : I18n.t("nav.continue");
    nextBtn.addEventListener("click", () => {
      Storage.saveProgress(tema.temaId, step);
      if (stepIndex === STEPS.length - 1) {
        state.onExit();
        return;
      }
      state.stepIndex += 1;
      render();
    });
    btnRow.appendChild(nextBtn);

    container.appendChild(btnRow);
  }

  function renderStep(step, tema) {
    switch (step) {
      case "kelime":
        return renderKelime(tema);
      case "gramer":
        return renderGramer(tema);
      case "lesen":
        return renderLesen(tema);
      case "hoeren":
        return renderHoeren(tema);
      case "schreiben":
        return renderSchreiben(tema);
      case "sprechen":
        return renderSprechen(tema, state.redemittel);
      case "miniTest":
        return renderMiniTest(tema);
      default:
        return document.createTextNode("");
    }
  }

  function renderKelime(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.kelime");
    wrap.appendChild(h);

    tema.kelime.forEach((w) => {
      const item = document.createElement("div");
      item.className = "word-item";
      item.innerHTML = `
        <div class="word-de">${w.de}</div>
        <div class="word-tr">${I18n.contentField(w, "tr")}</div>
        <div class="word-example">${w.beispiel}</div>
      `;
      wrap.appendChild(item);
    });
    return wrap;
  }

  function renderGradedQuestion(tema, q) {
    return SoruKart.renderMultipleChoice(tema.temaId, q, {
      onAnswer: (correct) => Storage.recordLeitnerResult(q.id, correct),
    });
  }

  function renderGramer(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.gramer");
    wrap.appendChild(h);
    tema.gramer.forEach((q) => wrap.appendChild(renderGradedQuestion(tema, q)));
    return wrap;
  }

  function renderLesen(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.lesen");
    wrap.appendChild(h);

    const text = document.createElement("p");
    text.textContent = tema.lesen.metin;
    wrap.appendChild(text);

    tema.lesen.sorular.forEach((q) => {
      // v2.0: bazi Lesen sorulari artik coktanSecmeli (bkz. PRD §15) — bu
      // sorular Gramer/Hören ile ayni SoruKart bilesenini kullanir. acikUclu
      // sorular eski serbest metin davranisini korur.
      if (q.secenekler) {
        wrap.appendChild(renderGradedQuestion(tema, q));
        return;
      }

      const block = document.createElement("div");
      block.className = "question-block";
      const label = document.createElement("div");
      label.className = "question-text";
      label.textContent = q.soru;
      block.appendChild(label);

      const textarea = document.createElement("textarea");
      textarea.value = Storage.getAnswer(tema.temaId, q.id) ?? "";
      textarea.addEventListener("input", () => {
        Storage.saveAnswer(tema.temaId, q.id, textarea.value);
      });
      block.appendChild(textarea);
      wrap.appendChild(block);
    });
    return wrap;
  }

  function renderHoeren(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.hoeren");
    wrap.appendChild(h);

    wrap.appendChild(SoruKart.renderAudioContext(tema.hoeren.sesUrl, tema.hoeren.transkript));

    tema.hoeren.sorular.forEach((q) => wrap.appendChild(renderGradedQuestion(tema, q)));
    return wrap;
  }

  function renderSchreiben(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.schreiben");
    wrap.appendChild(h);

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
      const stored = Storage.getAnswer(tema.temaId, checkId);
      checkbox.checked = stored === true;
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

    const answerId = "schreiben-metin";
    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(tema.temaId, answerId) ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, answerId, textarea.value);
    });
    wrap.appendChild(textarea);
    return wrap;
  }

  function renderSprechen(tema, redemittelData) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.sprechen");
    wrap.appendChild(h);

    const s = tema.sprechen;

    const teil1 = document.createElement("div");
    teil1.className = "question-block";
    teil1.innerHTML = `<div class="question-text">${I18n.t("sprechen.teil1")} - ${s.teil1FollowUp.frage}</div>`;
    const teil1Input = document.createElement("textarea");
    teil1Input.value = Storage.getAnswer(tema.temaId, "sprechen-teil1") ?? "";
    teil1Input.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "sprechen-teil1", teil1Input.value);
    });
    teil1.appendChild(teil1Input);
    teil1.appendChild(RedemittelBank.renderHelper(redemittelData, SPRECHEN_REDEMITTEL_MAP.teil1));
    wrap.appendChild(teil1);

    const teil2 = document.createElement("div");
    teil2.className = "question-block";
    teil2.innerHTML = `<div class="question-text">${I18n.t("sprechen.teil2")}</div>`;
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
    teil2.appendChild(RedemittelBank.renderHelper(redemittelData, SPRECHEN_REDEMITTEL_MAP.teil2));
    wrap.appendChild(teil2);

    const teil3 = document.createElement("div");
    teil3.className = "question-block";
    teil3.innerHTML = `
      <div class="question-text">${I18n.t("sprechen.teil3")}</div>
      <p>${s.teil3.szenario}</p>
    `;
    const teil3Input = document.createElement("textarea");
    teil3Input.value = Storage.getAnswer(tema.temaId, "sprechen-teil3") ?? "";
    teil3Input.addEventListener("input", () => {
      Storage.saveAnswer(tema.temaId, "sprechen-teil3", teil3Input.value);
    });
    teil3.appendChild(teil3Input);
    teil3.appendChild(RedemittelBank.renderHelper(redemittelData, SPRECHEN_REDEMITTEL_MAP.teil3));
    wrap.appendChild(teil3);

    return wrap;
  }

  function renderMiniTest(tema) {
    const wrap = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = I18n.t("step.miniTest");
    wrap.appendChild(h);

    const allQuestions = [...tema.gramer, ...tema.hoeren.sorular].filter((q) =>
      tema.miniTest.soruIdListesi.includes(q.id)
    );

    if (allQuestions.length === 0) {
      const note = document.createElement("p");
      note.textContent = I18n.t("miniTest.noQuestions");
      wrap.appendChild(note);
      return wrap;
    }

    allQuestions.forEach((q) => wrap.appendChild(renderGradedQuestion(tema, q)));

    const answered = allQuestions.filter((q) => Storage.getAnswer(tema.temaId, q.id) !== null);
    const correct = allQuestions.filter((q) => Storage.getAnswer(tema.temaId, q.id) === q.dogruCevap);

    const summary = document.createElement("div");
    summary.className = "result-summary";
    summary.innerHTML = `
      <div class="result-score">${correct.length}/${allQuestions.length}</div>
      <p>${I18n.t("miniTest.answeredCount", { answered: answered.length, total: allQuestions.length })}</p>
    `;
    wrap.appendChild(summary);
    return wrap;
  }

  function refresh() {
    if (!state) return;
    render();
  }

  return { start, refresh };
})();
