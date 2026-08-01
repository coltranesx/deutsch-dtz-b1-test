const DisaAktarmaYardimci = (() => {
  // tema-modu.js'teki TemaModu.STEPS ile birebir aynı sıra/isim seti (PRD §17).
  // Burada bağımsız tanımlanır çünkü TemaModu bu listeyi export etmiyor.
  const STEPS = ["kelime", "gramer", "lesen", "hoeren", "schreiben", "sprechen", "miniTest"];

  const APP_VERSION = "2.0";

  // Sprachhandlung ekseni sadece gramer sorularindan beslenir, istatistik-ekrani.js
  // ile ayni esik (bkz. PRD §22.1).
  const SPRACHHANDLUNG_MIN_SAMPLE = 5;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // Yerel saat diliminde okunabilir bir tarih/saat metni. Locale-bagimsiz,
  // sabit dd.mm.yyyy hh:mm formati (rapor iceriginin arayuz dilinden bagimsiz
  // her zaman ayni sekilde gorunmesi icin).
  function formatDate(ms) {
    const d = new Date(ms);
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function fileDateSuffix(ms) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function buildSchreibenSummary(tema, answers) {
    const task = tema.schreiben;
    const leitpunkte = (task?.leitpunkte ?? []).map((lp, i) => ({
      metin: lp,
      tamamlandi: answers[`schreiben-lp-${i}`]?.value === true,
    }));
    return {
      metin: answers["schreiben-metin"]?.value ?? null,
      leitpunkte,
    };
  }

  function buildSprechenSummary(answers) {
    return {
      teil1: answers["sprechen-teil1"]?.value ?? null,
      teil2Beschreibung: answers["sprechen-teil2-beschreibung"]?.value ?? null,
      teil2Vergleich: answers["sprechen-teil2-vergleich"]?.value ?? null,
      teil3: answers["sprechen-teil3"]?.value ?? null,
    };
  }

  function buildTemaSummary(tema) {
    const progress = Storage.getProgress(tema.temaId);
    const answers = Storage.getTemaAnswers(tema.temaId);
    return {
      temaId: tema.temaId,
      temaNo: tema.temaNo,
      baslik: tema.baslik,
      completedSteps: progress.completedSteps,
      completedStepCount: progress.completedSteps.length,
      totalStepCount: STEPS.length,
      steps: STEPS,
      schreiben: buildSchreibenSummary(tema, answers),
      sprechen: buildSprechenSummary(answers),
    };
  }

  function buildKampSummary() {
    let tamamlananGun = 0;
    for (let n = 1; n <= 21; n += 1) {
      if (Storage.getKampGunIlerleme(n).tamamlandiMi) tamamlananGun += 1;
    }
    return { tamamlananGun, toplamGun: 21 };
  }

  function buildIstatistikOzeti(allTemaData, pool) {
    const temaById = {};
    allTemaData.forEach((tema) => {
      temaById[tema.temaId] = tema;
    });

    const byTema = IstatistikYardimci.byTema(pool).map((s) => ({
      ...s,
      baslik: temaById[s.temaId]?.baslik ?? s.temaId,
    }));
    const byGramerKategori = IstatistikYardimci.byGramerKategori(pool);
    const bySprachhandlung = IstatistikYardimci.bySprachhandlung(pool);
    const sprachhandlungToplam = bySprachhandlung.reduce((sum, s) => sum + s.toplam, 0);

    return {
      byTema,
      byGramerKategori,
      bySprachhandlung,
      sprachhandlungLowSample: sprachhandlungToplam < SPRACHHANDLUNG_MIN_SAMPLE,
      hasAnyData: pool.some((q) => Storage.getLeitnerEntry(q.id)),
    };
  }

  // Rapor icerigini (PRD §13.1) yapilandirilmis bir JS nesnesi olarak dondurur.
  // DOM'a bagimli degildir, TXT/PDF/kopyalama ve disa-aktarma.js'in DOM render'i
  // ayni bu nesneden beslenir.
  function buildReportData(allTemaData) {
    const pool = SoruHavuzu.collectPool(allTemaData);
    const temalar = allTemaData.map(buildTemaSummary);
    const temaTamamlananSayisi = temalar.filter((t) => t.completedStepCount === t.totalStepCount).length;

    return {
      exportedAt: Date.now(),
      temaTamamlananSayisi,
      temaToplamSayisi: temalar.length,
      istatistik: buildIstatistikOzeti(allTemaData, pool),
      kamp: buildKampSummary(),
      temalar,
    };
  }

  function formatStatRow(label, stat) {
    const pct = Math.round(stat.oran * 100);
    return `  - ${label}: %${pct} (${stat.toplam} soru)`;
  }

  function formatStatSection(heading, stats, resolveLabel) {
    const lines = [heading];
    if (stats.length === 0) {
      lines.push(`  ${I18n.t("istatistik.noDataForSection")}`);
    } else {
      stats.forEach((s) => lines.push(formatStatRow(resolveLabel(s), s)));
    }
    return lines;
  }

  function formatTemaBlock(tema) {
    const lines = [];
    lines.push(`### ${tema.temaNo}. ${tema.baslik}`);
    lines.push(
      `${I18n.t("export.temaStepsLabel", { done: tema.completedStepCount, total: tema.totalStepCount })}: ${tema.steps
        .map((s) => `${tema.completedSteps.includes(s) ? "✓" : "✗"} ${I18n.t(`step.${s}`)}`)
        .join(", ")}`
    );

    lines.push(`${I18n.t("export.schreibenHeading")}:`);
    if (tema.schreiben.leitpunkte.length > 0) {
      tema.schreiben.leitpunkte.forEach((lp) => {
        lines.push(`  ${lp.tamamlandi ? "✓" : "✗"} ${lp.metin}`);
      });
    }
    lines.push(`  ${tema.schreiben.metin ? tema.schreiben.metin : I18n.t("export.notAnswered")}`);

    lines.push(`${I18n.t("export.sprechenHeading")}:`);
    lines.push(`  ${I18n.t("export.sprechenTeil1Label")}: ${tema.sprechen.teil1 ?? I18n.t("export.notAnswered")}`);
    lines.push(
      `  ${I18n.t("export.sprechenTeil2BeschreibungLabel")}: ${tema.sprechen.teil2Beschreibung ?? I18n.t("export.notAnswered")}`
    );
    lines.push(
      `  ${I18n.t("export.sprechenTeil2VergleichLabel")}: ${tema.sprechen.teil2Vergleich ?? I18n.t("export.notAnswered")}`
    );
    lines.push(`  ${I18n.t("export.sprechenTeil3Label")}: ${tema.sprechen.teil3 ?? I18n.t("export.notAnswered")}`);

    return lines;
  }

  // reportData -> okunabilir düz metin (TXT indirme, PDF alani ve kopyalama
  // hepsi bu ayni metni kullanir).
  function formatReportText(reportData) {
    const lines = [];
    lines.push(I18n.t("export.reportTitle"));
    lines.push(I18n.t("export.reportDate", { date: formatDate(reportData.exportedAt) }));
    lines.push("");

    lines.push(`## ${I18n.t("export.summaryHeading")}`);
    lines.push(
      `- ${I18n.t("export.summaryCompletedTemalar", {
        done: reportData.temaTamamlananSayisi,
        total: reportData.temaToplamSayisi,
      })}`
    );
    lines.push("");

    lines.push(`## ${I18n.t("export.statsHeading")}`);
    if (!reportData.istatistik.hasAnyData) {
      lines.push(`  ${I18n.t("istatistik.emptyState")}`);
    } else {
      lines.push(
        ...formatStatSection(`### ${I18n.t("export.statsTemaHeading")}`, reportData.istatistik.byTema, (s) => s.baslik)
      );
      lines.push(
        ...formatStatSection(
          `### ${I18n.t("export.statsGramerHeading")}`,
          reportData.istatistik.byGramerKategori,
          (s) => s.kategori
        )
      );
      lines.push(
        ...formatStatSection(
          `### ${I18n.t("export.statsSprachhandlungHeading")}`,
          reportData.istatistik.bySprachhandlung,
          (s) => s.sprachhandlung
        )
      );
      if (reportData.istatistik.sprachhandlungLowSample) {
        lines.push(`  ${I18n.t("istatistik.lowSampleNote")}`);
      }
    }
    lines.push("");

    lines.push(`## ${I18n.t("export.kampHeading")}`);
    lines.push(`- ${I18n.t("export.kampProgress", { done: reportData.kamp.tamamlananGun, total: reportData.kamp.toplamGun })}`);
    lines.push("");

    lines.push(`## ${I18n.t("export.temalarHeading")}`);
    reportData.temalar.forEach((tema) => {
      lines.push(...formatTemaBlock(tema));
      lines.push("");
    });

    lines.push(I18n.t("export.lesenScopeNote"));

    return lines.join("\n");
  }

  // Storage.readAll() tam yedegi, ince bir zarfla sarmalanir (PRD §13.1).
  function buildJsonExportPayload() {
    return {
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      data: Storage.readAll(),
    };
  }

  return { STEPS, APP_VERSION, formatDate, fileDateSuffix, buildReportData, formatReportText, buildJsonExportPayload };
})();
