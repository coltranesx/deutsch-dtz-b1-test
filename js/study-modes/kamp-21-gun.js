const Kamp21GunModu = (() => {
  const TOPLAM_GUN = 21;
  const KAMP_NAMESPACE = "kamp-21-gun";

  let state = null; // { container, kampData, temaById, onExit, acikGun, selectedGun }

  function start(container, kampData, allTemaData, onExit) {
    const temaById = {};
    allTemaData.forEach((tema) => {
      temaById[tema.temaId] = tema;
    });
    const acikGun = Storage.getKampAcikGun();
    state = {
      container,
      kampData,
      temaById,
      onExit,
      acikGun,
      selectedGun: acikGun,
    };
    render();
  }

  function render() {
    const { container, kampData, selectedGun } = state;
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => state.onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.textContent = kampData.baslik;
    container.appendChild(h);

    container.appendChild(renderGunPiller());

    const gunData = kampData.gunler.find((g) => g.gunNo === selectedGun);
    if (!gunData) return;

    const mezuniyetGorev = gunData.gorevler.find((g) => g.adimTipi === "mezuniyet");
    const isMezuniyetGunu = Boolean(mezuniyetGorev) || gunData.gorevler.length === 0;

    const card = document.createElement("div");
    card.className = "card";
    card.appendChild(renderGunBaslik(gunData, isMezuniyetGunu));

    if (isMezuniyetGunu) {
      card.appendChild(renderMezuniyetEkrani(gunData, mezuniyetGorev));
    } else {
      gunData.gorevler.forEach((gorev) => card.appendChild(renderGorev(gunData.gunNo, gorev)));
    }

    container.appendChild(card);
    container.appendChild(renderGunTamamlaButonu(gunData));
  }

  function renderGunPiller() {
    const nav = document.createElement("div");
    nav.className = "step-nav";
    for (let gunNo = 1; gunNo <= TOPLAM_GUN; gunNo += 1) {
      const ilerleme = Storage.getKampGunIlerleme(gunNo);
      const locked = gunNo > state.acikGun;

      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "step-pill gun-pill";
      if (gunNo === state.selectedGun) pill.classList.add("active");
      if (ilerleme.tamamlandiMi) pill.classList.add("done");
      if (locked) pill.classList.add("locked");
      pill.disabled = locked;
      pill.textContent = String(gunNo);
      const title = locked ? I18n.t("kamp.locked") : I18n.t("kamp.gunLabel", { gunNo });
      pill.title = title;
      pill.setAttribute("aria-label", title);
      pill.addEventListener("click", () => {
        if (locked) return;
        state.selectedGun = gunNo;
        render();
      });
      nav.appendChild(pill);
    }
    return nav;
  }

  function renderGunBaslik(gunData, isMezuniyetGunu) {
    const wrap = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.style.marginTop = "0";
    h3.textContent = gunData.baslik;
    wrap.appendChild(h3);

    if (!isMezuniyetGunu && gunData.gorevler.length > 0) {
      const ilerleme = Storage.getKampGunIlerleme(gunData.gunNo);
      const total = gunData.gorevler.length;
      const done = gunData.gorevler.filter((g) => ilerleme.tamamlananGorevler.includes(g.id)).length;
      const p = document.createElement("p");
      p.className = "feedback";
      p.textContent = I18n.t("kamp.gorevProgress", { done, total });
      wrap.appendChild(p);
    }
    return wrap;
  }

  function renderGunTamamlaButonu(gunData) {
    const row = document.createElement("div");
    row.className = "btn-row";
    row.style.justifyContent = "flex-end";

    const ilerleme = Storage.getKampGunIlerleme(gunData.gunNo);
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = ilerleme.tamamlandiMi ? I18n.t("kamp.gunTamamlandi") : I18n.t("kamp.completeGun");
    btn.disabled = ilerleme.tamamlandiMi;
    btn.addEventListener("click", () => {
      Storage.saveKampGunTamamlandi(gunData.gunNo);
      state.acikGun = Storage.getKampAcikGun();
      render();
    });
    row.appendChild(btn);
    return row;
  }

  // --- Görev dispatch ---------------------------------------------------

  function renderGorev(gunNo, gorev) {
    const wrap = document.createElement("div");
    wrap.className = "kamp-gorev";

    if (gorev.adimTipi === "tekrar") {
      const badge = document.createElement("span");
      badge.className = "tekrar-badge";
      badge.textContent = I18n.t("kamp.tekrarBadge");
      wrap.appendChild(badge);
    }

    wrap.appendChild(renderGorevIcerik(gunNo, gorev));
    return wrap;
  }

  function renderGorevIcerik(gunNo, gorev) {
    if (gorev.tur === "referans") {
      return renderReferansGorev(gunNo, gorev);
    }
    // tur === "ozel"
    switch (gorev.adimTipi) {
      case "kelime":
        return renderKelimeOzel(gunNo, gorev);
      case "gramer":
        return renderGradedGorev(gunNo, KAMP_NAMESPACE, gorev, gorev.id);
      case "lesen":
        return renderLesenOzel(gunNo, gorev);
      case "hoeren":
        return renderHoerenOzel(gunNo, gorev);
      case "schreiben":
        return renderSchreibenGorev(gunNo, gorev);
      case "sprechen":
        return renderSprechenGorev(gunNo, gorev);
      default:
        return renderIcerikYok();
    }
  }

  function renderIcerikYok() {
    const p = document.createElement("p");
    p.className = "feedback";
    p.textContent = I18n.t("kamp.contentMissing");
    return p;
  }

  // --- Ortak yardimcilar --------------------------------------------------

  // Bir sorunun cevaplanmasi hem Leitner sonucunu hem de kamp gorev
  // tamamlanma durumunu gunceller. Referans sorularda temaId orijinal
  // Tema'nin id'sidir (Tema Modu ile senkron kalir), ozel sorularda
  // KAMP_NAMESPACE'tir.
  function renderGradedGorev(gunNo, temaId, q, gorevId) {
    return SoruKart.renderMultipleChoice(temaId, q, {
      onAnswer: (correct) => {
        Storage.recordLeitnerResult(q.id, correct);
        Storage.saveKampGorevTamamlandi(gunNo, gorevId);
      },
    });
  }

  function renderOpenTextSoru(gunNo, temaId, q, gorevId) {
    const block = document.createElement("div");
    block.className = "question-block";
    const label = document.createElement("div");
    label.className = "question-text";
    label.textContent = q.soru;
    block.appendChild(label);

    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(temaId, q.id) ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(temaId, q.id, textarea.value);
      Storage.saveKampGorevTamamlandi(gunNo, gorevId);
    });
    block.appendChild(textarea);
    return block;
  }

  function renderKelimeKart(w) {
    const item = document.createElement("div");
    item.className = "word-item";

    const de = document.createElement("div");
    de.className = "word-de";
    de.textContent = w.de;
    item.appendChild(de);

    const tr = document.createElement("div");
    tr.className = "word-tr";
    tr.textContent = I18n.contentField(w, "tr");
    item.appendChild(tr);

    const beispiel = document.createElement("div");
    beispiel.className = "word-example";
    beispiel.textContent = w.beispiel;
    item.appendChild(beispiel);

    return item;
  }

  // --- Referans gorevler ---------------------------------------------------

  // tur:"referans" gorevler sadece temaId+soruId tasir; hangi alt-semaya ait
  // olduklarini (kelime/gramer/lesen/hoeren) gercek Tema JSON'undaki dort
  // havuzu tarayarak buluyoruz. adimTipi:"tekrar" gorevler de ayni yolla
  // cozumlenir (altta yatan gorev normal sekilde render edilir, sadece
  // rozetle isaretlenir).
  function resolveReferansIcerik(tema, soruId) {
    if (!tema) return null;
    let found = tema.kelime?.find((w) => w.id === soruId);
    if (found) return { type: "kelime", soru: found };
    found = tema.gramer?.find((q) => q.id === soruId);
    if (found) return { type: "gramer", soru: found };
    found = tema.lesen?.sorular?.find((q) => q.id === soruId);
    if (found) return { type: "lesen", soru: found };
    found = tema.hoeren?.sorular?.find((q) => q.id === soruId);
    if (found) return { type: "hoeren", soru: found };
    return null;
  }

  function renderReferansGorev(gunNo, gorev) {
    const tema = state.temaById[gorev.temaId];
    const resolved = resolveReferansIcerik(tema, gorev.soruId);
    if (!resolved) return renderIcerikYok();

    switch (resolved.type) {
      case "kelime": {
        const card = renderKelimeKart(resolved.soru);
        Storage.saveKampGorevTamamlandi(gunNo, gorev.id);
        return card;
      }
      case "gramer":
        return renderGradedGorev(gunNo, tema.temaId, resolved.soru, gorev.id);
      case "lesen":
        return renderLesenReferans(gunNo, tema, resolved.soru, gorev.id);
      case "hoeren":
        return renderHoerenReferans(gunNo, tema, resolved.soru, gorev.id);
      default:
        return renderIcerikYok();
    }
  }

  function renderLesenReferans(gunNo, tema, q, gorevId) {
    const wrap = document.createElement("div");
    if (tema.lesen?.metin) {
      const p = document.createElement("p");
      p.className = "feedback";
      const metin = tema.lesen.metin;
      p.textContent = metin.length > 220 ? `${metin.slice(0, 220)}…` : metin;
      wrap.appendChild(p);
    }
    if (q.secenekler) {
      wrap.appendChild(renderGradedGorev(gunNo, tema.temaId, q, gorevId));
    } else {
      wrap.appendChild(renderOpenTextSoru(gunNo, tema.temaId, q, gorevId));
    }
    return wrap;
  }

  function renderHoerenReferans(gunNo, tema, q, gorevId) {
    const wrap = document.createElement("div");
    wrap.appendChild(SoruKart.renderAudioContext(tema.hoeren?.sesUrl, tema.hoeren?.transkript));
    wrap.appendChild(renderGradedGorev(gunNo, tema.temaId, q, gorevId));
    return wrap;
  }

  // --- Ozel gorevler ---------------------------------------------------

  function renderKelimeOzel(gunNo, gorev) {
    const card = renderKelimeKart(gorev);
    Storage.saveKampGorevTamamlandi(gunNo, gorev.id);
    return card;
  }

  function renderLesenOzel(gunNo, gorev) {
    const wrap = document.createElement("div");
    if (gorev.metin) {
      const p = document.createElement("p");
      p.textContent = gorev.metin;
      wrap.appendChild(p);
    }
    (gorev.sorular ?? []).forEach((q) => {
      if (q.secenekler) {
        wrap.appendChild(renderGradedGorev(gunNo, KAMP_NAMESPACE, q, gorev.id));
      } else {
        wrap.appendChild(renderOpenTextSoru(gunNo, KAMP_NAMESPACE, q, gorev.id));
      }
    });
    return wrap;
  }

  function renderHoerenOzel(gunNo, gorev) {
    const wrap = document.createElement("div");
    wrap.appendChild(SoruKart.renderAudioContext(gorev.sesUrl, gorev.transkript));
    (gorev.sorular ?? []).forEach((q) => {
      wrap.appendChild(renderGradedGorev(gunNo, KAMP_NAMESPACE, q, gorev.id));
    });
    return wrap;
  }

  function renderSchreibenGorev(gunNo, gorev) {
    const wrap = document.createElement("div");

    const gorevText = document.createElement("p");
    gorevText.className = "question-text";
    gorevText.textContent = gorev.gorev;
    wrap.appendChild(gorevText);

    if (gorev.leitpunkte?.length) {
      const list = document.createElement("ul");
      list.className = "leitpunkte-list";
      gorev.leitpunkte.forEach((lp) => {
        const li = document.createElement("li");
        li.textContent = `• ${lp}`;
        list.appendChild(li);
      });
      wrap.appendChild(list);
    }

    if (gorev.minKelime && gorev.maxKelime) {
      const hint = document.createElement("p");
      hint.className = "feedback";
      hint.textContent = I18n.t("schreiben.targetLabel", { min: gorev.minKelime, max: gorev.maxKelime });
      wrap.appendChild(hint);
    }

    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(KAMP_NAMESPACE, gorev.id) ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(KAMP_NAMESPACE, gorev.id, textarea.value);
      Storage.saveKampGorevTamamlandi(gunNo, gorev.id);
    });
    wrap.appendChild(textarea);
    return wrap;
  }

  function renderSprechenGorev(gunNo, gorev) {
    const wrap = document.createElement("div");
    if (gorev.teil1FollowUp) {
      wrap.appendChild(renderSprechenTeil(gunNo, gorev, "teil1", gorev.teil1FollowUp.frage));
    }
    if (gorev.teil2) {
      wrap.appendChild(renderSprechenTeil(gunNo, gorev, "teil2", gorev.teil2.beschreibungsPrompt));
    }
    if (gorev.teil3) {
      wrap.appendChild(renderSprechenTeil(gunNo, gorev, "teil3", gorev.teil3.szenario));
    }
    return wrap;
  }

  function renderSprechenTeil(gunNo, gorev, teilKey, promptText) {
    const block = document.createElement("div");
    block.className = "question-block";

    const label = document.createElement("div");
    label.className = "question-text";
    label.textContent = `${I18n.t(`sprechen.${teilKey}`)} — ${promptText}`;
    block.appendChild(label);

    const answerId = `${gorev.id}-${teilKey}`;
    const textarea = document.createElement("textarea");
    textarea.value = Storage.getAnswer(KAMP_NAMESPACE, answerId) ?? "";
    textarea.addEventListener("input", () => {
      Storage.saveAnswer(KAMP_NAMESPACE, answerId, textarea.value);
      Storage.saveKampGorevTamamlandi(gunNo, gorev.id);
    });
    block.appendChild(textarea);
    return block;
  }

  // --- Mezuniyet ekrani ---------------------------------------------------

  function computeKampOzet() {
    let tamamlananGun = 0;
    for (let n = 1; n <= TOPLAM_GUN; n += 1) {
      if (Storage.getKampGunIlerleme(n).tamamlandiMi) tamamlananGun += 1;
    }

    const temaBazliBasari = Object.values(state.temaById)
      .map((tema) => {
        const sorular = [...(tema.gramer ?? []), ...(tema.hoeren?.sorular ?? [])];
        let correct = 0;
        let total = 0;
        sorular.forEach((q) => {
          const entry = Storage.getLeitnerEntry(q.id);
          if (!entry) return;
          correct += entry.correctCount;
          total += entry.correctCount + entry.incorrectCount;
        });
        return total > 0 ? { baslik: tema.baslik, oran: correct / total } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.oran - a.oran);

    return {
      tamamlananGun,
      enGucluTema: temaBazliBasari[0]?.baslik ?? null,
      enZayifTema: temaBazliBasari[temaBazliBasari.length - 1]?.baslik ?? null,
    };
  }

  function renderMezuniyetEkrani(gunData, mezuniyetGorev) {
    const wrap = document.createElement("div");

    const h3 = document.createElement("h3");
    h3.style.marginTop = "0";
    h3.textContent = I18n.t("kamp.mezuniyetTitle");
    wrap.appendChild(h3);

    if (mezuniyetGorev?.baslik) {
      const p = document.createElement("p");
      p.textContent = mezuniyetGorev.baslik;
      wrap.appendChild(p);
    }

    const ozet = computeKampOzet();
    const summary = document.createElement("div");
    summary.className = "result-summary";
    summary.innerHTML = `
      <div class="result-score">${ozet.tamamlananGun}/${TOPLAM_GUN}</div>
      <p>${I18n.t("kamp.gunTamamlandiCount", { count: ozet.tamamlananGun })}</p>
    `;
    wrap.appendChild(summary);

    if (ozet.enGucluTema) {
      const p = document.createElement("p");
      p.textContent = I18n.t("kamp.gucluTemaMesaji", { tema: ozet.enGucluTema });
      wrap.appendChild(p);
    }
    if (ozet.enZayifTema) {
      const p = document.createElement("p");
      p.textContent = I18n.t("kamp.zayifTemaMesaji", { tema: ozet.enZayifTema });
      wrap.appendChild(p);
    }

    return wrap;
  }

  function refresh() {
    if (!state) return;
    render();
  }

  return { start, refresh };
})();
