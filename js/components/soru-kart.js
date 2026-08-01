const SoruKart = (() => {
  function renderMultipleChoice(temaId, q, options = {}) {
    const { onAnswer, freshSince } = options;

    // freshSince verilmisse, bu zaman damgasindan ONCE kaydedilmis bir cevap
    // "yokmus gibi" davranilir (Zayif Konular, Gunluk 15 Dakika, Kamp, DTZ
    // Sinav Modu icin "aralikli tekrar" amaci korunur). freshSince verilmezse
    // (Tema Modu) her zaman guncel/gercek cevap donulur — davranis degismez.
    function currentAnswerValue() {
      const entry = Storage.getAnswerEntry(temaId, q.id);
      if (!entry) return null;
      if (freshSince && entry.savedAt < freshSince) return null;
      return entry.value;
    }

    const block = document.createElement("div");
    block.className = "question-block";

    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent = q.soru;
    block.appendChild(text);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "options";

    const savedAnswer = currentAnswerValue();
    const feedback = document.createElement("div");
    feedback.className = "feedback";

    let locked = false;

    q.secenekler.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "option-label";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = q.id;
      radio.value = opt;
      radio.checked = savedAnswer === opt;
      radio.addEventListener("change", () => {
        if (locked) return;
        locked = true;
        Storage.saveAnswer(temaId, q.id, opt);
        onAnswer?.(opt === q.dogruCevap);
        applyFeedback();
        [...optionsWrap.querySelectorAll("input")].forEach((input) => {
          input.disabled = true;
        });
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      optionsWrap.appendChild(label);
    });

    block.appendChild(optionsWrap);
    block.appendChild(feedback);

    function applyFeedback() {
      const current = currentAnswerValue();
      [...optionsWrap.children].forEach((label) => {
        const val = label.querySelector("input").value;
        label.classList.remove("correct", "incorrect");
        if (current) {
          if (val === q.dogruCevap) label.classList.add("correct");
          else if (val === current) label.classList.add("incorrect");
        }
      });
      feedback.textContent = current ? (I18n.contentField(q, "aciklama") ?? "") : "";
    }

    applyFeedback();
    return block;
  }

  function renderAudioContext(sesUrl, transkript) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "1rem";

    const missingNote = document.createElement("p");
    missingNote.className = "feedback";
    missingNote.textContent = I18n.t("soruKart.audioMissing");
    missingNote.style.display = "none";

    if (sesUrl) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.style.width = "100%";
      audio.addEventListener("error", () => {
        audio.remove();
        missingNote.style.display = "block";
      });
      audio.src = sesUrl;
      wrap.appendChild(audio);
      wrap.appendChild(missingNote);
    }

    if (transkript) {
      const details = document.createElement("details");
      details.style.marginTop = "0.75rem";
      const summary = document.createElement("summary");
      summary.textContent = I18n.t("soruKart.transcriptSummary");
      details.appendChild(summary);
      const p = document.createElement("p");
      p.textContent = transkript;
      details.appendChild(p);
      wrap.appendChild(details);
    }

    return wrap;
  }

  return { renderMultipleChoice, renderAudioContext };
})();
