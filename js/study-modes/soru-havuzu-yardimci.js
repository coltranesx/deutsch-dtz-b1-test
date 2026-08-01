const SoruHavuzu = (() => {
  // Tüm Temalar'ın gramer + hoeren sorularını tek bir düz havuzda toplar.
  // Zayıf Konular Modu ve Günlük 15 Dakika arasında paylaşılan ortak mantık.
  function collectPool(temalar) {
    const pool = [];
    temalar.forEach((tema) => {
      tema.gramer.forEach((q) => pool.push({ ...q, temaId: tema.temaId, kaynak: "gramer" }));
      tema.hoeren.sorular.forEach((q) =>
        pool.push({
          ...q,
          temaId: tema.temaId,
          kaynak: "hoeren",
          sesUrl: tema.hoeren.sesUrl,
          transkript: tema.hoeren.transkript,
        })
      );
    });
    return pool;
  }

  return { collectPool };
})();
