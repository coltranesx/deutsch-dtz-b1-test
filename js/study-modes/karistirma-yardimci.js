const KaristirmaYardimci = (() => {
  // Fisher-Yates: yerinde karistirmaz, kopya dondurur. Gunluk 15 Dakika,
  // DTZ Sinav Modu ve SoruKart arasinda paylasilan ortak mantik (bkz.
  // SoruHavuzu.collectPool / IstatistikYardimci ile ayni "3. kullanim
  // noktasi" gerekcesi).
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  return { shuffle };
})();
