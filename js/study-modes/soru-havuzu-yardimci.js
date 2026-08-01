const SoruHavuzu = (() => {
  // Tüm Temalar'ın gramer + hoeren + lesen (coktanSecmeli) sorularını tek bir
  // düz havuzda toplar. Zayıf Konular Modu, Günlük 15 Dakika, İstatistik Ekranı
  // ve DTZ Sınav Modu arasında paylaşılan ortak mantık.
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
      // Sadece cevapTipi:"coktanSecmeli" (secenekler tasiyan) Lesen sorulari
      // havuza girer — acikUclu sorular otomatik puanlanamaz, havuz disinda kalir.
      tema.lesen.sorular.forEach((q) => {
        if (q.secenekler) pool.push({ ...q, temaId: tema.temaId, kaynak: "lesen" });
      });
    });
    return pool;
  }

  return { collectPool };
})();
