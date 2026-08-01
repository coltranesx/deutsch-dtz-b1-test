const I18n = (() => {
  // Uygulama arayüz/içerik çeviri dilleri buradan yönetilir. Yeni bir dil eklemek için:
  //  1. Bu listeye { code, label } eklenir
  //  2. DICT'e o code ile bir blok eklenir (aşağıdaki tr/en objeleri gibi)
  //  3. content JSON'larına o dile ait alanlar eklenir (kelime[].<code>, gramer[].aciklama<Code>, vb.)
  // Kodun başka hiçbir yerinde "tr"/"en" hardcode edilmemeli — hepsi bu listeden türetilir.
  // "de" ASLA buraya eklenmez: Almanca öğretilen dil, kelime[].de zaten hedef kelime alanı
  // olarak kullanılıyor; Almanca'nın aynı zamanda bir arayüz/çeviri dili olması anlamsız ve
  // alan adlarıyla çakışır.
  const LANGUAGES = [
    { code: "tr", label: "TR" },
    { code: "en", label: "EN" },
  ];
  const BASE_LANG = "tr";

  const DICT = {
    tr: {
      "nav.backToDashboard": "< Panele dön",
      "nav.back": "Geri",
      "nav.continue": "Devam et",
      "nav.finishTema": "Temayı bitir",
      "nav.finish": "Bitir",
      "nav.nextQuestion": "Sonraki soru",

      "step.kelime": "Kelime",
      "step.gramer": "Gramer",
      "step.lesen": "Lesen",
      "step.hoeren": "Hören",
      "step.schreiben": "Schreiben",
      "step.sprechen": "Sprechen",
      "step.miniTest": "Mini Test",

      "sprechen.teil1": "Teil 1",
      "sprechen.teil2": "Teil 2",
      "sprechen.teil3": "Teil 3",
      "sprechen.fotoAlt": "Sprechen Teil 2 fotoğrafı",

      "schreiben.targetLabel": "Hedef: {min}-{max} kelime",

      "miniTest.noQuestions": "Bu tema için mini test sorusu tanımlı değil.",
      "miniTest.answeredCount": "{answered}/{total} soru cevaplandı",

      "dashboard.zayifKonularTitle": "Zayıf Konular Modu",
      "dashboard.zayifKonularDesc": "Tema + Sprachhandlung + Gramer bazlı akıllı tekrar",
      "dashboard.redemittelTitle": "Redemittel-Bank",
      "dashboard.redemittelDesc": "Sprechen için hazır konuşma stratejisi ifadeleri",
      "dashboard.kampTitle": "21 Günlük Kamp",
      "dashboard.kampDesc": "Sabit 21 günlük müfredat, 11 Temaya dağıtılmış",
      "dashboard.gunluk15Title": "Günlük 15 Dakika",
      "dashboard.gunluk15Desc": "%70 tekrar / %30 yeni, kural tabanlı hızlı tur",
      "dashboard.istatistikTitle": "İstatistikler",
      "dashboard.istatistikDesc": "Tema, Gramer ve Sprachhandlung bazlı ısı haritası + kelime ilerlemesi",
      "dashboard.disaAktarmaTitle": "Dışa Aktar",
      "dashboard.disaAktarmaDesc": "İlerlemenizi JSON/TXT olarak indirin, yazdırın veya kopyalayın",
      "dashboard.dtzSinavTitle": "DTZ Sınav Modu",
      "dashboard.dtzSinavDesc": "Gerçek DTZ formatını taklit eden, zamanlı bir deneme sınavı",
      "dashboard.dtzSinavContinueBadge": "Devam eden bir sınavınız var",
      "dashboard.temalarHeading": "Temalar",
      "dashboard.resetBtnLabel": "Temayı sıfırla",
      "dashboard.resetBtnTitle": "Cevapları ve ilerlemeyi sıfırla",
      "dashboard.resetConfirm": '"{baslik}" temasındaki cevapları ve ilerlemeyi sıfırlamak istediğine emin misin?',

      "zayif.questionProgress": "Soru {current}/{total}",
      "zayif.emptyState": "Şu an tekrar edilecek soru yok, hepsi güncel. Yeni sorular için bir Tema tamamlayın.",
      "zayif.sessionDone": "Bu tekrar oturumu tamamlandı",
      "zayif.categoryStatsHeading": "Kategori bazlı başarı",

      "gunluk15.emptyState": "Şu an tekrar edilecek veya yeni bir soru yok, harika gidiyorsun!",
      "gunluk15.sessionDone": "Bu 15 dakikalık oturum tamamlandı",
      "gunluk15.startNewSession": "Yeni Oturum Başlat",

      "redemittel.fullViewDesc": "Sprechen pratiğinde takıldığınızda kullanabileceğiniz sabit ifadeler.",
      "redemittel.loadError": "İçerik yüklenemedi.",
      "redemittel.helperSummary": "Yardım ifadeleri (takıldığınızda açın)",

      "kamp.gunLabel": "Gün {gunNo}",
      "kamp.gunOfTotal": "Gün {gunNo}/21",
      "kamp.locked": "Bu gün henüz kilitli, önce mevcut günü tamamlayın",
      "kamp.completeGun": "Günü Tamamla",
      "kamp.gunTamamlandi": "Gün tamamlandı ✓",
      "kamp.tekrarBadge": "🔁 Tekrar",
      "kamp.mezuniyetTitle": "Mezuniyet Günü",
      "kamp.gorevProgress": "{done}/{total} görev tamamlandı",
      "kamp.contentMissing": "Bu görev için içerik bulunamadı.",
      "kamp.gunTamamlandiCount": "{count}/21 gün tamamlandı",
      "kamp.gucluTemaMesaji": "En güçlü olduğunuz Tema: {tema}",
      "kamp.zayifTemaMesaji": "Daha çok tekrar gerektiren Tema: {tema}",

      "istatistik.fullViewDesc": "Leitner tekrar verinize dayalı güçlü/zayıf Tema, Gramer ve Sprachhandlung ısı haritası.",
      "istatistik.emptyState": "Henüz istatistik oluşturacak veri yok. Bir Tema'da Gramer veya Hören sorularını cevaplayınca ısı haritaları burada görünecek.",
      "istatistik.noDataForSection": "Bu bölüm için henüz yeterli veri yok.",
      "istatistik.lowSampleNote": "Not: Sprachhandlung verisi sadece Gramer sorularından gelir ve henüz az sayıda soru cevaplandı, oranlar güvenilir olmayabilir.",
      "istatistik.temaHeatmapTitle": "Tema Isı Haritası",
      "istatistik.gramerHeatmapTitle": "Gramer Kategori Isı Haritası",
      "istatistik.sprachhandlungHeatmapTitle": "Sprachhandlung Isı Haritası",
      "istatistik.kelimeIlerlemeTitle": "Kelime İlerlemesi",
      "istatistik.kelimeIlerlemeSummary": "{done}/{total} Tema'da kelime adımı tamamlandı",

      "soruKart.audioMissing": "Bu soru için ses kaydı henüz hazır değil, aşağıdaki metni okuyarak cevaplayın.",
      "soruKart.transcriptSummary": "Transkript metnini göster",

      "dtzSinav.title": "DTZ Sınav Modu",
      "dtzSinav.sonucLabel": "Sonuç",
      "dtzSinav.timeRemaining": "Kalan süre",
      "dtzSinav.finishSectionBtn": "Bölümü Bitir",
      "dtzSinav.finishExamBtn": "Sınavı Bitir",
      "dtzSinav.notGraded": "Bu bölüm otomatik puanlanmaz, sadece tamamlandı olarak işaretlenir.",
      "dtzSinav.timeUpNotice": "Süre doldu, bir sonraki bölüme geçiliyor…",
      "dtzSinav.cancelExam": "Sınavı İptal Et",
      "dtzSinav.cancelConfirm": "Sınavı iptal etmek istediğinize emin misiniz? Tüm sınav ilerlemesi silinecek.",
      "dtzSinav.sonucTitle": "Sınav Sonucu",
      "dtzSinav.levelBelowA2": "A2 altı",
      "dtzSinav.levelA2": "A2",
      "dtzSinav.levelB1": "B1",
      "dtzSinav.hoerenLesenBreakdown": "Hören: {hoeren}/{hoerenTotal} · Lesen: {lesen}/{lesenTotal}",
      "dtzSinav.completedBadge": "Tamamlandı ✓ (puansız)",
      "dtzSinav.notCompletedBadge": "Tamamlanmadı",
      "dtzSinav.generalResultNote": "Not: Genel B1 sonucu (Sprechen + en az bir yazılı bölüm) otomatik hesaplanamıyor; bu ekran sadece Hören+Lesen puanını gösterir. Otomatik değerlendirme v3.0'da eklenecek.",
      "dtzSinav.finishExam": "Sınavı Bitir ve Panele Dön",

      "export.fullViewDesc": "İlerlemenizin tam yedeğini (JSON) veya okunabilir bir özet raporu (TXT/PDF) indirin ya da panoya kopyalayın.",
      "export.jsonButton": "JSON İndir",
      "export.txtButton": "TXT İndir",
      "export.printButton": "Yazdır (PDF)",
      "export.copyButton": "Kopyala",
      "export.copyButtonSuccess": "Kopyalandı ✓",
      "export.copyError": "Kopyalama başarısız oldu, tarayıcı izinlerini kontrol edin.",
      "export.reportTitle": "DTZ B1 Trainer — İlerleme Raporu",
      "export.reportDate": "Rapor tarihi: {date}",
      "export.summaryHeading": "Genel Özet",
      "export.summaryCompletedTemalar": "{done}/{total} Tema'nın 7 adımı da tamamlandı",
      "export.statsHeading": "İstatistik Özeti",
      "export.statsTemaHeading": "Tema Başarı Oranı",
      "export.statsGramerHeading": "Gramer Kategori Başarı Oranı",
      "export.statsSprachhandlungHeading": "Sprachhandlung Başarı Oranı",
      "export.kampHeading": "21 Günlük Kamp",
      "export.kampProgress": "{done}/{total} gün tamamlandı",
      "export.temalarHeading": "Temalar",
      "export.temaStepsLabel": "Tamamlanan adımlar: {done}/{total}",
      "export.schreibenHeading": "Schreiben",
      "export.sprechenHeading": "Sprechen",
      "export.sprechenTeil1Label": "Teil 1",
      "export.sprechenTeil2BeschreibungLabel": "Teil 2 — Beschreibung",
      "export.sprechenTeil2VergleichLabel": "Teil 2 — Vergleich",
      "export.sprechenTeil3Label": "Teil 3",
      "export.notAnswered": "Henüz cevaplanmadı",
      "export.lesenScopeNote": "Not: Lesen yanıtları bu raporun kapsamı dışındadır, sadece genel adım listesinde tamamlanma durumu görünür.",

      "footer.text": "v1.0 · Offline çalışır · Cevaplar cihazınızda saklanır",

      "theme.ariaLabel": "Tema değiştir",
      "theme.title": "Karanlık/Aydınlık mod",
      "lang.ariaLabel": "Dil değiştir",
      "lang.title": "Türkçe/İngilizce",
    },
    en: {
      "nav.backToDashboard": "< Back to dashboard",
      "nav.back": "Back",
      "nav.continue": "Continue",
      "nav.finishTema": "Finish topic",
      "nav.finish": "Finish",
      "nav.nextQuestion": "Next question",

      "step.kelime": "Vocabulary",
      "step.gramer": "Grammar",
      "step.lesen": "Lesen",
      "step.hoeren": "Hören",
      "step.schreiben": "Schreiben",
      "step.sprechen": "Sprechen",
      "step.miniTest": "Mini Test",

      "sprechen.teil1": "Teil 1",
      "sprechen.teil2": "Teil 2",
      "sprechen.teil3": "Teil 3",
      "sprechen.fotoAlt": "Sprechen Teil 2 photo",

      "schreiben.targetLabel": "Target: {min}-{max} words",

      "miniTest.noQuestions": "No mini test questions are defined for this topic.",
      "miniTest.answeredCount": "{answered}/{total} questions answered",

      "dashboard.zayifKonularTitle": "Weak Topics Mode",
      "dashboard.zayifKonularDesc": "Smart review based on Topic + Sprachhandlung + Grammar",
      "dashboard.redemittelTitle": "Redemittel-Bank",
      "dashboard.redemittelDesc": "Ready-made speaking strategy phrases for Sprechen",
      "dashboard.kampTitle": "21-Day Camp",
      "dashboard.kampDesc": "Fixed 21-day curriculum spread across the 11 Topics",
      "dashboard.gunluk15Title": "Daily 15 Minutes",
      "dashboard.gunluk15Desc": "70% review / 30% new, rule-based quick round",
      "dashboard.istatistikTitle": "Statistics",
      "dashboard.istatistikDesc": "Heat map by Topic, Grammar and Sprachhandlung + vocabulary progress",
      "dashboard.disaAktarmaTitle": "Export",
      "dashboard.disaAktarmaDesc": "Download your progress as JSON/TXT, print it, or copy it",
      "dashboard.dtzSinavTitle": "DTZ Exam Mode",
      "dashboard.dtzSinavDesc": "A timed mock exam that imitates the real DTZ format",
      "dashboard.dtzSinavContinueBadge": "You have an exam in progress",
      "dashboard.temalarHeading": "Topics",
      "dashboard.resetBtnLabel": "Reset topic",
      "dashboard.resetBtnTitle": "Reset answers and progress",
      "dashboard.resetConfirm": 'Are you sure you want to reset your answers and progress for "{baslik}"?',

      "zayif.questionProgress": "Question {current}/{total}",
      "zayif.emptyState": "No questions to review right now, everything is up to date. Complete a Topic for new questions.",
      "zayif.sessionDone": "This review session is complete",
      "zayif.categoryStatsHeading": "Success rate by category",

      "gunluk15.emptyState": "No review or new questions right now, great job!",
      "gunluk15.sessionDone": "This 15-minute session is complete",
      "gunluk15.startNewSession": "Start New Session",

      "redemittel.fullViewDesc": "Fixed phrases you can use when you get stuck during Sprechen practice.",
      "redemittel.loadError": "Content could not be loaded.",
      "redemittel.helperSummary": "Helper phrases (open when stuck)",

      "kamp.gunLabel": "Day {gunNo}",
      "kamp.gunOfTotal": "Day {gunNo}/21",
      "kamp.locked": "This day is still locked, finish the current day first",
      "kamp.completeGun": "Complete Day",
      "kamp.gunTamamlandi": "Day completed ✓",
      "kamp.tekrarBadge": "🔁 Review",
      "kamp.mezuniyetTitle": "Graduation Day",
      "kamp.gorevProgress": "{done}/{total} tasks completed",
      "kamp.contentMissing": "No content found for this task.",
      "kamp.gunTamamlandiCount": "{count}/21 days completed",
      "kamp.gucluTemaMesaji": "Your strongest Topic: {tema}",
      "kamp.zayifTemaMesaji": "Topic that needs more review: {tema}",

      "istatistik.fullViewDesc": "Strong/weak Topic, Grammar and Sprachhandlung heat map based on your Leitner review data.",
      "istatistik.emptyState": "No statistics data yet. Once you answer Grammar or Hören questions in a Topic, heat maps will appear here.",
      "istatistik.noDataForSection": "Not enough data for this section yet.",
      "istatistik.lowSampleNote": "Note: Sprachhandlung data comes only from Grammar questions and only a few have been answered so far, ratios may not be reliable.",
      "istatistik.temaHeatmapTitle": "Topic Heat Map",
      "istatistik.gramerHeatmapTitle": "Grammar Category Heat Map",
      "istatistik.sprachhandlungHeatmapTitle": "Sprachhandlung Heat Map",
      "istatistik.kelimeIlerlemeTitle": "Vocabulary Progress",
      "istatistik.kelimeIlerlemeSummary": "{done}/{total} Topics have completed the vocabulary step",

      "soruKart.audioMissing": "The audio recording for this question isn't ready yet, answer by reading the text below.",
      "soruKart.transcriptSummary": "Show transcript",

      "dtzSinav.title": "DTZ Exam Mode",
      "dtzSinav.sonucLabel": "Result",
      "dtzSinav.timeRemaining": "Time remaining",
      "dtzSinav.finishSectionBtn": "Finish Section",
      "dtzSinav.finishExamBtn": "Finish Exam",
      "dtzSinav.notGraded": "This section is not graded automatically, it is only marked as completed.",
      "dtzSinav.timeUpNotice": "Time is up, moving to the next section…",
      "dtzSinav.cancelExam": "Cancel Exam",
      "dtzSinav.cancelConfirm": "Are you sure you want to cancel the exam? All exam progress will be deleted.",
      "dtzSinav.sonucTitle": "Exam Result",
      "dtzSinav.levelBelowA2": "Below A2",
      "dtzSinav.levelA2": "A2",
      "dtzSinav.levelB1": "B1",
      "dtzSinav.hoerenLesenBreakdown": "Hören: {hoeren}/{hoerenTotal} · Lesen: {lesen}/{lesenTotal}",
      "dtzSinav.completedBadge": "Completed ✓ (not graded)",
      "dtzSinav.notCompletedBadge": "Not completed",
      "dtzSinav.generalResultNote": "Note: The overall B1 result (Sprechen + at least one written section) cannot be calculated automatically; this screen only shows the Hören+Lesen score. Automatic evaluation will be added in v3.0.",
      "dtzSinav.finishExam": "Finish Exam and Return to Dashboard",

      "export.fullViewDesc": "Download a full backup of your progress (JSON) or a readable summary report (TXT/PDF), or copy it to the clipboard.",
      "export.jsonButton": "Download JSON",
      "export.txtButton": "Download TXT",
      "export.printButton": "Print (PDF)",
      "export.copyButton": "Copy",
      "export.copyButtonSuccess": "Copied ✓",
      "export.copyError": "Copy failed, please check your browser permissions.",
      "export.reportTitle": "DTZ B1 Trainer — Progress Report",
      "export.reportDate": "Report date: {date}",
      "export.summaryHeading": "Overview",
      "export.summaryCompletedTemalar": "{done}/{total} Topics have completed all 7 steps",
      "export.statsHeading": "Statistics Summary",
      "export.statsTemaHeading": "Topic Success Rate",
      "export.statsGramerHeading": "Grammar Category Success Rate",
      "export.statsSprachhandlungHeading": "Sprachhandlung Success Rate",
      "export.kampHeading": "21-Day Camp",
      "export.kampProgress": "{done}/{total} days completed",
      "export.temalarHeading": "Topics",
      "export.temaStepsLabel": "Completed steps: {done}/{total}",
      "export.schreibenHeading": "Schreiben",
      "export.sprechenHeading": "Sprechen",
      "export.sprechenTeil1Label": "Teil 1",
      "export.sprechenTeil2BeschreibungLabel": "Teil 2 — Beschreibung",
      "export.sprechenTeil2VergleichLabel": "Teil 2 — Vergleich",
      "export.sprechenTeil3Label": "Teil 3",
      "export.notAnswered": "Not answered yet",
      "export.lesenScopeNote": "Note: Lesen answers are out of scope for this report, only the completion status appears in the general step list.",

      "footer.text": "v1.0 · Works offline · Answers saved on your device",

      "theme.ariaLabel": "Toggle theme",
      "theme.title": "Dark/Light mode",
      "lang.ariaLabel": "Change language",
      "lang.title": "Turkish/English",
    },
  };

  let currentLang = BASE_LANG;

  function init() {
    currentLang = Storage.getLanguage();
  }

  function getLanguages() {
    return LANGUAGES;
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    currentLang = lang;
    Storage.setLanguage(lang);
  }

  // Persists+applies the next language in LANGUAGES after the current one (wraps around).
  // With 2 languages this behaves like a toggle; with 3+ it cycles through all of them.
  function cycleLanguage() {
    const index = LANGUAGES.findIndex((l) => l.code === currentLang);
    const next = LANGUAGES[(index + 1) % LANGUAGES.length];
    setLanguage(next.code);
    return next;
  }

  function t(key, vars) {
    let str = DICT[currentLang]?.[key] ?? DICT[BASE_LANG][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([name, value]) => {
        str = str.replaceAll(`{${name}}`, value);
      });
    }
    return str;
  }

  // Resolves a bilingual content field (tema JSON / redemittel-bank JSON), NOT a UI string.
  // In the base language, the field is read as-is (e.g. kelime[].tr, gramer[].aciklama).
  // In any other language, the sibling field is named after that language's code: the base
  // field itself ("tr") maps to "<code>" (e.g. "en"), every other field maps to "<key><Code>"
  // (e.g. "aciklama" -> "aciklamaEn"). Falls back to the base field if the sibling is missing.
  function contentField(obj, key) {
    if (currentLang === BASE_LANG) return obj[key];
    const suffix = currentLang.charAt(0).toUpperCase() + currentLang.slice(1);
    const targetKey = key === BASE_LANG ? currentLang : `${key}${suffix}`;
    return obj[targetKey] ?? obj[key];
  }

  return { init, getLanguages, getLanguage, setLanguage, cycleLanguage, t, contentField };
})();
