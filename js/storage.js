const Storage = (() => {
  const NAMESPACE = "dtzB1Trainer";

  const LEITNER_INTERVALS_MS = [
    0,
    1 * 24 * 60 * 60 * 1000,
    3 * 24 * 60 * 60 * 1000,
    7 * 24 * 60 * 60 * 1000,
    14 * 24 * 60 * 60 * 1000,
  ];
  const LEITNER_MAX_BOX = LEITNER_INTERVALS_MS.length;

  function readAll() {
    const raw = localStorage.getItem(NAMESPACE);
    if (!raw) return { answers: {}, progress: {}, leitner: {} };
    try {
      const data = JSON.parse(raw);
      if (!data.leitner) data.leitner = {};
      return data;
    } catch {
      return { answers: {}, progress: {}, leitner: {} };
    }
  }

  function writeAll(data) {
    localStorage.setItem(NAMESPACE, JSON.stringify(data));
  }

  function saveAnswer(temaId, questionId, value) {
    const data = readAll();
    if (!data.answers[temaId]) data.answers[temaId] = {};
    data.answers[temaId][questionId] = { value, savedAt: Date.now() };
    writeAll(data);
  }

  function getAnswer(temaId, questionId) {
    const data = readAll();
    return data.answers[temaId]?.[questionId]?.value ?? null;
  }

  function getTemaAnswers(temaId) {
    const data = readAll();
    return data.answers[temaId] ?? {};
  }

  function saveProgress(temaId, step) {
    const data = readAll();
    if (!data.progress[temaId]) data.progress[temaId] = { completedSteps: [] };
    if (!data.progress[temaId].completedSteps.includes(step)) {
      data.progress[temaId].completedSteps.push(step);
    }
    data.progress[temaId].lastStep = step;
    data.progress[temaId].lastStudiedAt = Date.now();
    writeAll(data);
  }

  function getProgress(temaId) {
    const data = readAll();
    return data.progress[temaId] ?? { completedSteps: [], lastStep: null };
  }

  function resetTemaProgress(temaId) {
    const data = readAll();
    delete data.answers[temaId];
    delete data.progress[temaId];
    writeAll(data);
  }

  function getTheme() {
    return localStorage.getItem(`${NAMESPACE}:theme`) ?? "light";
  }

  function setTheme(theme) {
    localStorage.setItem(`${NAMESPACE}:theme`, theme);
  }

  function getLanguage() {
    return localStorage.getItem(`${NAMESPACE}:language`) ?? "tr";
  }

  function setLanguage(lang) {
    localStorage.setItem(`${NAMESPACE}:language`, lang);
  }

  function recordLeitnerResult(questionId, correct) {
    const data = readAll();
    const prev = data.leitner[questionId] ?? { box: 1, correctCount: 0, incorrectCount: 0 };
    const box = correct ? Math.min(prev.box + 1, LEITNER_MAX_BOX) : 1;
    data.leitner[questionId] = {
      box,
      dueAt: Date.now() + LEITNER_INTERVALS_MS[box - 1],
      lastResult: correct ? "correct" : "incorrect",
      lastReviewedAt: Date.now(),
      correctCount: prev.correctCount + (correct ? 1 : 0),
      incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
    };
    writeAll(data);
  }

  function getLeitnerEntry(questionId) {
    return readAll().leitner[questionId] ?? null;
  }

  function isLeitnerDue(questionId) {
    const entry = getLeitnerEntry(questionId);
    return !entry || entry.dueAt <= Date.now();
  }

  return {
    saveAnswer,
    getAnswer,
    getTemaAnswers,
    saveProgress,
    getProgress,
    resetTemaProgress,
    getTheme,
    setTheme,
    getLanguage,
    setLanguage,
    recordLeitnerResult,
    getLeitnerEntry,
    isLeitnerDue,
  };
})();
