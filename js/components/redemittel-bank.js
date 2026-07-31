const RedemittelBank = (() => {
  function renderIfadeList(kategori) {
    const list = document.createElement("ul");
    list.className = "redemittel-ifade-list";
    kategori.ifadeler.forEach((ifade) => {
      const li = document.createElement("li");
      li.className = "redemittel-ifade";
      li.innerHTML = `
        <div class="redemittel-de">${ifade.de}</div>
        <div class="redemittel-tr">${ifade.tr}</div>
        <div class="redemittel-kullanim">${ifade.kullanim}</div>
      `;
      list.appendChild(li);
    });
    return list;
  }

  function renderFullView(container, data, onExit) {
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = "< Panele dön";
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = "Redemittel-Bank";
    container.appendChild(h);

    const desc = document.createElement("p");
    desc.className = "feedback";
    desc.textContent = "Sprechen pratiğinde takıldığınızda kullanabileceğiniz sabit ifadeler.";
    container.appendChild(desc);

    if (!data?.kategoriler?.length) {
      const note = document.createElement("p");
      note.textContent = "İçerik yüklenemedi.";
      container.appendChild(note);
      return;
    }

    data.kategoriler.forEach((kategori) => {
      const card = document.createElement("div");
      card.className = "card";
      const h3 = document.createElement("h3");
      h3.style.marginTop = "0";
      h3.textContent = kategori.baslik;
      card.appendChild(h3);
      const aciklama = document.createElement("p");
      aciklama.className = "feedback";
      aciklama.textContent = kategori.aciklama;
      card.appendChild(aciklama);
      card.appendChild(renderIfadeList(kategori));
      container.appendChild(card);
    });
  }

  function renderHelper(data, highlightKategoriIds = []) {
    if (!data?.kategoriler?.length) return document.createDocumentFragment();

    const outer = document.createElement("details");
    outer.className = "redemittel-helper";
    const summary = document.createElement("summary");
    summary.textContent = "Yardım ifadeleri (takıldığınızda açın)";
    outer.appendChild(summary);

    data.kategoriler.forEach((kategori) => {
      const katDetails = document.createElement("details");
      katDetails.className = "redemittel-kategori";
      katDetails.open = highlightKategoriIds.includes(kategori.kategoriId);
      const katSummary = document.createElement("summary");
      katSummary.textContent = kategori.baslik;
      katDetails.appendChild(katSummary);
      katDetails.appendChild(renderIfadeList(kategori));
      outer.appendChild(katDetails);
    });

    return outer;
  }

  return { renderFullView, renderHelper };
})();
