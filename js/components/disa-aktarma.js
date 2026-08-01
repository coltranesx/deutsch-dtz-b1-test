const DisaAktarma = (() => {
  const COPY_FEEDBACK_MS = 2000;

  function el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadJson(reportTimestamp) {
    const payload = DisaAktarmaYardimci.buildJsonExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    triggerDownload(blob, `dtz-b1-yedek-${DisaAktarmaYardimci.fileDateSuffix(reportTimestamp)}.json`);
  }

  function downloadTxt(reportData) {
    const text = DisaAktarmaYardimci.formatReportText(reportData);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    triggerDownload(blob, `dtz-b1-rapor-${DisaAktarmaYardimci.fileDateSuffix(reportData.exportedAt)}.txt`);
  }

  // Kullanici serbest metnini (Schreiben/Sprechen yaniti) her zaman textContent
  // ile yazar — innerHTML KESINLIKLE kullanilmaz (XSS riski, bkz. CLAUDE.md).
  function appendUserField(container, label, value) {
    const wrap = el("div", "disa-aktarma-field");
    const labelEl = el("div", "disa-aktarma-field-label");
    labelEl.textContent = label;
    wrap.appendChild(labelEl);

    const valueEl = document.createElement("p");
    if (value) {
      valueEl.className = "disa-aktarma-user-text";
      valueEl.textContent = value;
    } else {
      valueEl.className = "feedback";
      valueEl.textContent = I18n.t("export.notAnswered");
    }
    wrap.appendChild(valueEl);
    container.appendChild(wrap);
  }

  function appendStatList(container, heading, stats, resolveLabel) {
    const h4 = el("h4");
    h4.textContent = heading;
    container.appendChild(h4);

    if (stats.length === 0) {
      const empty = el("p", "feedback");
      empty.textContent = I18n.t("istatistik.noDataForSection");
      container.appendChild(empty);
      return;
    }

    const ul = el("ul", "disa-aktarma-stat-list");
    stats.forEach((s) => {
      const pct = Math.round(s.oran * 100);
      const li = document.createElement("li");
      li.textContent = `${resolveLabel(s)} — %${pct} (${s.toplam} soru)`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function appendTemaBlock(container, tema) {
    const block = el("div", "disa-aktarma-tema-block");

    const h4 = document.createElement("h4");
    h4.textContent = `${tema.temaNo}. ${tema.baslik}`;
    block.appendChild(h4);

    const stepsLine = document.createElement("p");
    stepsLine.className = "feedback";
    const stepsText = tema.steps
      .map((s) => `${tema.completedSteps.includes(s) ? "✓" : "✗"} ${I18n.t(`step.${s}`)}`)
      .join("  ");
    stepsLine.textContent = `${I18n.t("export.temaStepsLabel", { done: tema.completedStepCount, total: tema.totalStepCount })} — ${stepsText}`;
    block.appendChild(stepsLine);

    const schreibenH5 = document.createElement("h5");
    schreibenH5.textContent = I18n.t("export.schreibenHeading");
    block.appendChild(schreibenH5);

    if (tema.schreiben.leitpunkte.length > 0) {
      const lpList = el("ul", "disa-aktarma-leitpunkte-list");
      tema.schreiben.leitpunkte.forEach((lp) => {
        const li = document.createElement("li");
        li.textContent = `${lp.tamamlandi ? "✓" : "✗"} ${lp.metin}`;
        lpList.appendChild(li);
      });
      block.appendChild(lpList);
    }
    appendUserField(block, I18n.t("step.schreiben"), tema.schreiben.metin);

    const sprechenH5 = document.createElement("h5");
    sprechenH5.textContent = I18n.t("export.sprechenHeading");
    block.appendChild(sprechenH5);

    appendUserField(block, I18n.t("export.sprechenTeil1Label"), tema.sprechen.teil1);
    appendUserField(block, I18n.t("export.sprechenTeil2BeschreibungLabel"), tema.sprechen.teil2Beschreibung);
    appendUserField(block, I18n.t("export.sprechenTeil2VergleichLabel"), tema.sprechen.teil2Vergleich);
    appendUserField(block, I18n.t("export.sprechenTeil3Label"), tema.sprechen.teil3);

    container.appendChild(block);
  }

  function renderReportDom(reportData) {
    const area = el("div", "disa-aktarma-print-area");

    const title = document.createElement("h2");
    title.textContent = I18n.t("export.reportTitle");
    area.appendChild(title);

    const date = document.createElement("p");
    date.className = "feedback";
    date.textContent = I18n.t("export.reportDate", { date: DisaAktarmaYardimci.formatDate(reportData.exportedAt) });
    area.appendChild(date);

    const summaryH3 = document.createElement("h3");
    summaryH3.textContent = I18n.t("export.summaryHeading");
    area.appendChild(summaryH3);
    const summaryP = document.createElement("p");
    summaryP.textContent = I18n.t("export.summaryCompletedTemalar", {
      done: reportData.temaTamamlananSayisi,
      total: reportData.temaToplamSayisi,
    });
    area.appendChild(summaryP);

    const statsH3 = document.createElement("h3");
    statsH3.textContent = I18n.t("export.statsHeading");
    area.appendChild(statsH3);

    if (!reportData.istatistik.hasAnyData) {
      const empty = document.createElement("p");
      empty.textContent = I18n.t("istatistik.emptyState");
      area.appendChild(empty);
    } else {
      appendStatList(area, I18n.t("export.statsTemaHeading"), reportData.istatistik.byTema, (s) => s.baslik);
      appendStatList(area, I18n.t("export.statsGramerHeading"), reportData.istatistik.byGramerKategori, (s) => s.kategori);
      appendStatList(
        area,
        I18n.t("export.statsSprachhandlungHeading"),
        reportData.istatistik.bySprachhandlung,
        (s) => s.sprachhandlung
      );
      if (reportData.istatistik.sprachhandlungLowSample) {
        const note = document.createElement("p");
        note.className = "feedback";
        note.textContent = I18n.t("istatistik.lowSampleNote");
        area.appendChild(note);
      }
    }

    const kampH3 = document.createElement("h3");
    kampH3.textContent = I18n.t("export.kampHeading");
    area.appendChild(kampH3);
    const kampP = document.createElement("p");
    kampP.textContent = I18n.t("export.kampProgress", { done: reportData.kamp.tamamlananGun, total: reportData.kamp.toplamGun });
    area.appendChild(kampP);

    const temalarH3 = document.createElement("h3");
    temalarH3.textContent = I18n.t("export.temalarHeading");
    area.appendChild(temalarH3);
    reportData.temalar.forEach((tema) => appendTemaBlock(area, tema));

    const scopeNote = document.createElement("p");
    scopeNote.className = "feedback";
    scopeNote.textContent = I18n.t("export.lesenScopeNote");
    area.appendChild(scopeNote);

    return area;
  }

  function renderButtons(container, allTemaData) {
    const btnRow = el("div", "btn-row disa-aktarma-btn-row disa-aktarma-no-print");

    const feedback = el("p", "feedback disa-aktarma-feedback");
    feedback.hidden = true;

    const jsonBtn = document.createElement("button");
    jsonBtn.className = "btn secondary";
    jsonBtn.textContent = I18n.t("export.jsonButton");
    jsonBtn.addEventListener("click", () => downloadJson(Date.now()));
    btnRow.appendChild(jsonBtn);

    const txtBtn = document.createElement("button");
    txtBtn.className = "btn secondary";
    txtBtn.textContent = I18n.t("export.txtButton");
    txtBtn.addEventListener("click", () => downloadTxt(DisaAktarmaYardimci.buildReportData(allTemaData)));
    btnRow.appendChild(txtBtn);

    const printBtn = document.createElement("button");
    printBtn.className = "btn secondary";
    printBtn.textContent = I18n.t("export.printButton");
    printBtn.addEventListener("click", () => window.print());
    btnRow.appendChild(printBtn);

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn";
    const copyBtnDefaultLabel = I18n.t("export.copyButton");
    copyBtn.textContent = copyBtnDefaultLabel;
    copyBtn.addEventListener("click", async () => {
      const text = DisaAktarmaYardimci.formatReportText(DisaAktarmaYardimci.buildReportData(allTemaData));
      try {
        await navigator.clipboard.writeText(text);
        feedback.hidden = true;
        copyBtn.textContent = I18n.t("export.copyButtonSuccess");
        setTimeout(() => {
          copyBtn.textContent = copyBtnDefaultLabel;
        }, COPY_FEEDBACK_MS);
      } catch {
        feedback.hidden = false;
        feedback.textContent = I18n.t("export.copyError");
      }
    });
    btnRow.appendChild(copyBtn);

    return { btnRow, feedback };
  }

  // Study Mode DEGIL: state/session yok, her acilista Storage + soru
  // havuzundan yeniden hesaplanan salt-okunur bir rapor (istatistik-ekrani.js /
  // redemittel-bank.js ile ayni renderFullView(container, data, onExit) deseni).
  function renderFullView(container, allTemaData, onExit) {
    container.innerHTML = "";

    const backBtn = document.createElement("button");
    backBtn.className = "btn secondary disa-aktarma-no-print";
    backBtn.textContent = I18n.t("nav.backToDashboard");
    backBtn.style.marginBottom = "1rem";
    backBtn.addEventListener("click", () => onExit());
    container.appendChild(backBtn);

    const h = document.createElement("h2");
    h.className = "disa-aktarma-no-print";
    h.textContent = I18n.t("dashboard.disaAktarmaTitle");
    container.appendChild(h);

    const desc = document.createElement("p");
    desc.className = "feedback disa-aktarma-no-print";
    desc.textContent = I18n.t("export.fullViewDesc");
    container.appendChild(desc);

    const { btnRow, feedback } = renderButtons(container, allTemaData);
    container.appendChild(btnRow);
    container.appendChild(feedback);

    const reportData = DisaAktarmaYardimci.buildReportData(allTemaData);
    container.appendChild(renderReportDom(reportData));
  }

  return { renderFullView };
})();
