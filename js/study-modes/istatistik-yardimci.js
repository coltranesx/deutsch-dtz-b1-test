const IstatistikYardimci = (() => {
  // Bir soru havuzunu, keyExtractor(q) ile belirlenen bir veya birden fazla
  // anahtara gore Leitner correctCount/incorrectCount toplamlariyla gruplar.
  // keyExtractor tek bir string, bir string dizisi ya da (soru bu eksene
  // etiketli degilse) null/undefined dondurebilir. Dizi donerse, soru HER
  // anahtara ayri ayri katki yapar (coklu-katki kurali, orn. sprachhandlung).
  // Leitner kaydi olmayan sorular (hic cevaplanmamis) atlanir.
  function groupByLeitnerStats(pool, keyExtractor) {
    const byKey = {};
    pool.forEach((q) => {
      const entry = Storage.getLeitnerEntry(q.id);
      if (!entry) return;
      let keys = keyExtractor(q);
      if (!keys) return;
      if (!Array.isArray(keys)) keys = [keys];
      keys.forEach((key) => {
        if (!key) return;
        if (!byKey[key]) byKey[key] = { correct: 0, incorrect: 0 };
        byKey[key].correct += entry.correctCount;
        byKey[key].incorrect += entry.incorrectCount;
      });
    });
    return byKey;
  }

  // byKey -> [{ key, toplam, oran }], oran artan siraya gore (en zayif once).
  function toSortedList(byKey) {
    return Object.entries(byKey)
      .map(([key, s]) => ({
        key,
        toplam: s.correct + s.incorrect,
        oran: s.correct / (s.correct + s.incorrect),
      }))
      .sort((a, b) => a.oran - b.oran);
  }

  // §8.4 taksonomisinin 6 ana kategorisi bazinda basari orani.
  // zayif-konular-modu.js'teki computeWeakStats'in tasidigi mantik.
  function byGramerKategori(pool) {
    const byKey = groupByLeitnerStats(pool, (q) => (q.konu ? q.konu.split(".")[0] : null));
    return toSortedList(byKey).map(({ key, toplam, oran }) => ({ kategori: key, toplam, oran }));
  }

  // Tema (temaId) bazinda basari orani.
  function byTema(pool) {
    const byKey = groupByLeitnerStats(pool, (q) => q.temaId ?? null);
    return toSortedList(byKey).map(({ key, toplam, oran }) => ({ temaId: key, toplam, oran }));
  }

  // §8.2 Sprachhandlung bazinda basari orani (sadece gramer sorulari,
  // hoeren'de sprachhandlung alani yok). Coklu etiketli sorular her
  // Sprachhandlung'a ayri ayri katki yapar.
  function bySprachhandlung(pool) {
    const byKey = groupByLeitnerStats(pool, (q) => (q.sprachhandlung?.length ? q.sprachhandlung : null));
    return toSortedList(byKey).map(({ key, toplam, oran }) => ({ sprachhandlung: key, toplam, oran }));
  }

  return { groupByLeitnerStats, byGramerKategori, byTema, bySprachhandlung };
})();
