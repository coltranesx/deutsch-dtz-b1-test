const Storage = (() => {
  const NAMESPACE = "dtzB1Trainer";

  function readAll() {
    const raw = localStorage.getItem(NAMESPACE);
    if (!raw) return { answers: {}, progress: {} };
    try {
      return JSON.parse(raw);
    } catch {
      return { answers: {}, progress: {} };
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

  function getTheme() {
    return localStorage.getItem(`${NAMESPACE}:theme`) ?? "light";
  }

  function setTheme(theme) {
    localStorage.setItem(`${NAMESPACE}:theme`, theme);
  }

  return {
    saveAnswer,
    getAnswer,
    getTemaAnswers,
    saveProgress,
    getProgress,
    getTheme,
    setTheme,
  };
})();
