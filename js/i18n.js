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
      "dashboard.temalarHeading": "Temalar",
      "dashboard.resetBtnLabel": "Temayı sıfırla",
      "dashboard.resetBtnTitle": "Cevapları ve ilerlemeyi sıfırla",
      "dashboard.resetConfirm": '"{baslik}" temasındaki cevapları ve ilerlemeyi sıfırlamak istediğine emin misin?',

      "zayif.questionProgress": "Soru {current}/{total}",
      "zayif.emptyState": "Şu an tekrar edilecek soru yok, hepsi güncel. Yeni sorular için bir Tema tamamlayın.",
      "zayif.sessionDone": "Bu tekrar oturumu tamamlandı",
      "zayif.categoryStatsHeading": "Kategori bazlı başarı",

      "redemittel.fullViewDesc": "Sprechen pratiğinde takıldığınızda kullanabileceğiniz sabit ifadeler.",
      "redemittel.loadError": "İçerik yüklenemedi.",
      "redemittel.helperSummary": "Yardım ifadeleri (takıldığınızda açın)",

      "soruKart.audioMissing": "Bu soru için ses kaydı henüz hazır değil, aşağıdaki metni okuyarak cevaplayın.",
      "soruKart.transcriptSummary": "Transkript metnini göster",

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
      "dashboard.temalarHeading": "Topics",
      "dashboard.resetBtnLabel": "Reset topic",
      "dashboard.resetBtnTitle": "Reset answers and progress",
      "dashboard.resetConfirm": 'Are you sure you want to reset your answers and progress for "{baslik}"?',

      "zayif.questionProgress": "Question {current}/{total}",
      "zayif.emptyState": "No questions to review right now, everything is up to date. Complete a Topic for new questions.",
      "zayif.sessionDone": "This review session is complete",
      "zayif.categoryStatsHeading": "Success rate by category",

      "redemittel.fullViewDesc": "Fixed phrases you can use when you get stuck during Sprechen practice.",
      "redemittel.loadError": "Content could not be loaded.",
      "redemittel.helperSummary": "Helper phrases (open when stuck)",

      "soruKart.audioMissing": "The audio recording for this question isn't ready yet, answer by reading the text below.",
      "soruKart.transcriptSummary": "Show transcript",

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
