const SoruKart = (() => {
  function renderMultipleChoice(temaId, q, options = {}) {
    const { onAnswer } = options;
    const block = document.createElement("div");
    block.className = "question-block";

    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent = q.soru;
    block.appendChild(text);

    const optionsWrap = document.createElement("div");
    optionsWrap.className = "options";

    const savedAnswer = Storage.getAnswer(temaId, q.id);
    const feedback = document.createElement("div");
    feedback.className = "feedback";

    q.secenekler.forEach((opt) => {
      const label = document.createElement("label");
      label.className = "option-label";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = q.id;
      radio.value = opt;
      radio.checked = savedAnswer === opt;
      radio.addEventListener("change", () => {
        Storage.saveAnswer(temaId, q.id, opt);
        onAnswer?.(opt === q.dogruCevap);
        applyFeedback();
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      optionsWrap.appendChild(label);
    });

    block.appendChild(optionsWrap);
    block.appendChild(feedback);

    function applyFeedback() {
      const current = Storage.getAnswer(temaId, q.id);
      [...optionsWrap.children].forEach((label) => {
        const val = label.querySelector("input").value;
        label.classList.remove("correct", "incorrect");
        if (current) {
          if (val === q.dogruCevap) label.classList.add("correct");
          else if (val === current) label.classList.add("incorrect");
        }
      });
      feedback.textContent = current ? (q.aciklama ?? "") : "";
    }

    applyFeedback();
    return block;
  }

  return { renderMultipleChoice };
})();
