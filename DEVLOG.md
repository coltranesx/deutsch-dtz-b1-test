# DTZ B1 Trainer — Devlog

Bu dosya, projenin güncel durumunu ve önemli kararları/öğrenmeleri özetler. Yeni bir sohbete başlarken buradan devam edilebilir.

**Son güncelleme:** 2026-08-01
**Canlı adres:** https://coltranesx.github.io/deutsch-dtz-b1-test/
**Repo:** coltranesx/deutsch-dtz-b1-test (public, GitHub Pages ile otomatik deploy)
**Branch durumu:** v2.0'ın tüm işleri (İstatistik Ekranı + Dışa Aktarma + DTZ Sınav Modu) PR #7 üzerinden `main`'e merge edildi (`main` @ `79c6c3f`) — bekleyen PR veya push yok, yeni sohbet `main`'in en güncel hali üzerinden devam edebilir.

---

## 1. Genel Durum

### v1.0 — TAMAMLANDI
- Resmi 11 Handlungsfeld'in tamamı içerikte (Wohnen, Arbeit, Arbeitssuche, Mediennutzung, Mobilität, Gesundheit, Aus- und Weiterbildung, Betreuung/Kinder, Einkaufen, Ämter/Behörden, Banken)
- Her temada 7 adım tam: Kelime → Gramer → Lesen → Hören → Schreiben → Sprechen → Mini Test
- Her temada **gerçek AI-üretimi ses** (Hören) ve **gerçek AI-üretimi fotoğraf** (Sprechen Teil 2), telif sorunsuz
- LocalStorage tabanlı ilerleme/cevap kaydı, offline PWA (service worker, manifest)
- Dark/Light mode, tutarlı tasarım sistemi (CSS custom properties: renk/tipografi/boşluk/radius/gölge token'ları)
- GitHub Pages'te otomatik deploy (main'e her push'ta)

### v1.5 — KISMEN TAMAMLANDI
- ✅ **Zayıf Konular Modu** altyapısı: Leitner kutu sistemi (5 kutu, kutu 1 hemen tekrar → kutu 5 14 gün), tema-bağımsız soru havuzu (tüm temaların gramer+hören soruları), kategori bazlı (Gramer taksonomisi üst kategorisi) başarı yüzdesi
- ✅ Normal Tema Modu pratiği de Leitner sistemini besliyor (paylaşılan `SoruKart` bileşeni üzerinden)
- ✅ **Redemittel-Bank**: `content/redemittel-bank.json` (3 kategori — Redeorganisation, Verständnissicherung, Kompensation — 24 ifade), `js/components/redemittel-bank.js` bileşeni (dashboard'da bağımsız tam ekran görünüm + Sprechen adımına gömülü, Teil'e göre öne çıkan kategoriyle açılan yardım paneli: Teil 1 → Verständnissicherung, Teil 2 → Kompensation, Teil 3 → Redeorganisation+Kompensation). Salt-okunur referans banka, LocalStorage'a yeni alan eklenmedi (v3.0'a kadar kullanım takibi planlanmıyor).
- ✅ **Tema reset tuşu**: Dashboard'daki her tema kartında ↺ tuşu (`Storage.resetTemaProgress(temaId)`) — o temanın `answers`/`progress` kaydını siler, kullanıcı temayı baştan çözebilir. Leitner (Zayıf Konular) verisine kasıtlı olarak dokunulmuyor. `confirm()` ile onay isteniyor, tuşun tıklaması karta bubble etmiyor (`stopPropagation`).
- ✅ **TR/EN arayüz dili desteği** (UI kabuğu): Yeni `js/i18n.js` modülü (`I18n.t(key, vars)`, düz key + `tr`/`en` sözlük + fallback zinciri `en → tr → ham key`), dil tercihi `Storage.getLanguage()/setLanguage()` ile tema tercihiyle aynı desende saklanıyor. Header'da `#langToggle` tuşu (hedef dili gösterir, tema tuşuyla aynı konvansiyon). Dil değişince aktif ekran state kaybetmeden yeniden çiziliyor (`TemaModu.refresh()` / `ZayifKonularModu.refresh()` — `start()` DEĞİL, `App.currentRenderer` üzerinden). Resmi sınav bölüm adları (`Lesen/Hören/Schreiben/Sprechen`, `Teil 1/2/3`) bilinçli olarak iki dilde de Almanca bırakıldı (PRD'nin "resmi terimler çevrilmez" ilkesiyle tutarlı — bkz. `Handlungsfeld`, `Konjunktiv`); sadece `Kelime→Vocabulary`, `Gramer→Grammar` çevrildi.
- ✅ **İçerik seviyesinde EN desteği** (PRD §15.1 + §7.1): 11 tema dosyasına `kelime[].en` (54 adet) ve `gramer[].aciklamaEn` (33 adet) alanları eklendi; `redemittel-bank.json`'a `kategoriler[].aciklamaEn` (3), `ifadeler[].en` + `ifadeler[].kullanimEn` (24×2) eklendi — hepsi additive-only, mevcut `tr`/`aciklama`/`kullanim` alanlarına dokunulmadı. Lesen/Hören/Schreiben/Sprechen içeriği (sınavın kendisi) kasıtlı olarak dışarıda bırakıldı, her zaman Almanca kalıyor. `almanca-dil-uzmani` ile denetlendi (54 kelime + 33 gramer + 27 Redemittel-Bank alanı, hatasız onaylandı).
- ✅ **i18n mimarisi TR/EN'e özel olmaktan çıkarıldı, N-dilli hale getirildi**: `js/i18n.js`'te tek bir `LANGUAGES = [{code,label}, ...]` listesi + `BASE_LANG = "tr"` sabiti eklendi — kodun başka hiçbir yerinde (`app.js` dahil) dil kodu hardcode edilmiyor. `I18n.cycleLanguage()` header tuşunu `LANGUAGES` listesindeki bir sonraki dile geçirir (2 dilde toggle gibi davranır, 3+ dilde otomatik döngüye döner); `I18n.contentField(obj, key)` genelleştirildi (taban alan `key===BASE_LANG` ise karşılık `<dilKodu>`, diğerleri `<key><DilKodu>` — örn. üçüncü bir dil `fr` eklenince otomatik olarak `kelime[].fr` ve `gramer[].aciklamaFr` bekler, kodda değişiklik gerekmez). **Kesin kural: `de` asla `LANGUAGES`'a eklenmez** — Almanca öğretilen dil, `kelime[].de` zaten hedef kelime alanı; çakışma + kavramsal anlamsızlık riski var. Yeni dil eklemek artık sadece: (1) `LANGUAGES`'a satır ekle, (2) `DICT`'e o dilin bloğunu ekle, (3) içerik JSON'larına o dilin alanlarını ekle — kod tarafında başka değişiklik gerekmiyor.
- ✅ **21 Günlük Kamp**: `content/kamp-21-gun.json` (139 görev, 21 gün, PRD §17.1 şeması) + `js/study-modes/kamp-21-gun.js` (yeni Study Mode). Sabit/editoryal müfredat — Zayıf Konular Modu'nun aksine adaptif değil. Self-paced (takvime kilitli değil, bir gün tamamlanınca sonraki hemen açılır; "açık gün" ayrı state olarak saklanmaz, tamamlanan günlerden türetilir). Her gün karışık mikro-ders: `tur:"referans"` görevler mevcut 11 tema JSON'undaki gerçek soruya işaret eder (cevap orijinal `temaId` altında saklanır, Tema Modu'yla senkron), `tur:"ozel"` görevler kampa hastır (cevap `"kamp-21-gun"` pseudo-namespace'inde saklanır). 3 fazlı dağılım: Gün 1-11 tema tanıtımı (~%70 referans/%30 özel), Gün 12-18 çapraz pekiştirme (~%25 referans/%75 özel, ikili tema kombinasyonları), Gün 19-21 iki mini sınav + mezuniyet özet ekranı. Özel gramer sorularının `konu` etiketleri bilinçli olarak 11 temada az işlenmiş taksonomi path'lerini (`Artikelwörter/Pronomen.*`, `Adjektiv.adverbial/Wortbildung`, `Nomen.Genus/Numerus/Komposita` vb.) hedefliyor — kamp, temaların tekrarı değil boşluk dolduran bir katman. `js/storage.js`'e izole yeni bir `data.kamp.gunIlerleme` alanı eklendi, mevcut `answers/progress/leitner` şemasına dokunulmadı. `sw.js` CACHE_NAME v6->v7. Bilinen sınırlama: kampa özel sorular henüz Zayıf Konular Modu'nun Leitner havuzuna dahil değil (v1.6+ takip maddesi).
- ✅ **Günlük 15 Dakika**: `js/study-modes/gunluk-15-dakika.js` (yeni Study Mode). Yeni bir content şeması YOK — mevcut 11 temanın gramer+hören havuzu (`SoruHavuzu.collectPool`, Zayıf Konular Modu ile paylaşılan yardımcı modül) + Leitner verisini orkestre eden saf bir seçim algoritması (PRD §17.2). Sabit 10 soruluk oturum = 7 tekrar (Leitner kaydı olan + süresi gelmiş, kutu no + dueAt'e göre öncelikli) + 3 yeni (hiç cevaplanmamış, Fisher-Yates ile karıştırılmış — "taze set" garantisi). Havuzlardan biri yetersizse çapraz doldurma yapılır. Takvim/günlük kilit YOK — sınırsız başlatılabilir, oturum bitince sayfadan çıkmadan "Yeni Oturum Başlat" ile taze bir set çekilir. Yeni bir storage alanı eklenmedi (mevcut `recordLeitnerResult`/`saveAnswer` yeterli). `zayif-konular-modu.js`'teki `collectPool` fonksiyonu davranış değişmeden `soru-havuzu-yardimci.js`'e taşındı (DTZ Sınav Modu v2.0'da da aynı havuza ihtiyaç duyacağı için gerekçeli bir paylaşım). `sw.js` CACHE_NAME v7->v8. **v1.5 TAMAMLANDI.**

### v2.0 — TAMAMLANDI
- ✅ **İstatistik Ekranı**: `js/components/istatistik-ekrani.js` (yeni, `renderFullView` — Study Mode değil, state'siz salt-okunur rapor, `redemittel-bank.js` deseninde). Yeni içerik şeması YOK — mevcut Leitner verisi + `SoruHavuzu.collectPool` (gramer+hören) + `Storage.getProgress` orkestre edilir (PRD §22.1). Üç ısı haritası: Tema, Gramer kategorisi (§8.4), Sprachhandlung (§8.2, çoklu-etiket kuralı — bir soru birden fazla Sprachhandlung'a katkı yapar, sadece gramer sorularından beslenir çünkü hoeren'de bu alan yok, düşük örneklemde uyarı notu gösterilir). Ayrı bir **Kelime İlerlemesi** bölümü: doğruluk kavramı yok (kelime adımı serbest metin/soru içermiyor), Tema bazında ikili sinyal (`Storage.getProgress(temaId).completedSteps.includes("kelime")`). **"Yazma gelişimi" bilinçli olarak v2.0 kapsamı dışında bırakıldı** — otomatik değerlendirme olmadan (AI Teacher Mode v3.0) anlamlı bir metrik yok. `js/study-modes/istatistik-yardimci.js` (yeni, paylaşılan `groupByLeitnerStats` + 3 sarmalayıcı) — Zayıf Konular Modu'nun `computeWeakStats`'ı ve 21 Günlük Kamp'ın `computeKampOzet`'i artık buna delege ediyor (saf refactor, davranış birebir korundu, DRY: üçüncü kullanım noktası eşiği aşınca ortak modüle çıkarıldı — `SoruHavuzu` ile aynı prensip).
- ✅ **Dışa Aktarma**: `js/components/disa-aktarma.js` (yeni, `renderFullView`) + `js/study-modes/disa-aktarma-yardimci.js` (yeni, saf rapor üretimi). Yeni content şeması yok (PRD §13.1). **JSON** = `Storage.readAll()`'ın `{exportedAt, appVersion, data}` zarfıyla tam yedeği. **TXT/PDF/kopyalama** = aynı yapılandırılmış veriden üretilen okunabilir özet rapor: genel özet, İstatistik Ekranı'ndaki üç ısı haritasının sayısal dökümü (`IstatistikYardimci` yeniden kullanıldı), 21 Günlük Kamp ilerlemesi, her Tema için tamamlanan adımlar + Schreiben/Sprechen yazılı yanıtları. Lesen yanıtları bilinçli olarak rapora dahil edilmiyor (sadece tamamlanma durumu). PDF **tarayıcı print-to-PDF** ile (`window.print()` + `@media print` izolasyon deseni) — üçüncü parti kütüphane eklenmedi, framework yasağına sadık kalındı. Kullanıcı serbest metni rapor DOM'una her zaman `textContent` ile yazılıyor (XSS önleme, Playwright ile script-injection denemesiyle doğrulandı). **Yan bulgu:** `js/storage.js`'teki `readAll()` fonksiyonu tanımlıydı ama public API'den dışa açılmamıştı (çağrılınca `TypeError`) — bu turda düzeltildi.
- ✅ **DTZ Sınav Modu**: `js/study-modes/dtz-sinav-modu.js` (yeni, 7. dashboard kartı) + `js/study-modes/sinav-sayaci-yardimci.js` (yeni, saf deadline/format yardımcısı). Gerçek DTZ formatını taklit eden zamanlı deneme (PRD §17.3): Hören(20/22 seçim, 11 gruba ayrılıp her gruptan 1 + kalan 11'den 9 daha)→Lesen(tüm 25)→Schreiben(rastgele 1 tema)→Sprechen(aynı tema)→Sonuç. **İçerik ön koşulu:** mevcut 22 Lesen sorusunun tamamı `acikUclu`'dan `coktanSecmeli`'ye çevrildi (PRD §15 şema eki) + 3 yeni Lesen sorusu eklendi (toplam 25) — otomatik puanlama için zorunluydu, `dtz-icerik-uzmani`+`almanca-dil-uzmani`+`soru-kontrolcu` turu gerekti. **İlk gerçek zamanlı sayaç:** Hören 25dk/Lesen 45dk, `deadline` timestamp `Storage`'da saklanıyor (bellekte değil) — sayfa yenilense/dashboard'a çıkılıp dönülse bile süre doğru hesaplanıyor, süre dolunca bölüm otomatik ilerliyor (F5 sonrası da zincirleme uygulanır). Puanlama Hören+Lesen/45 üzerinden (A2 altı <20, A2 20-32, B1 ≥33 — PRD Ek bölümündeki resmi eşikler). Schreiben/Sprechen dahil ama **puanlanmıyor** (AI değerlendirme yok, sadece "tamamlandı" işaretlenir) — PRD'deki "genel B1 sonucu" hesabı bu yüzden v3.0'a ertelendi, sonuç ekranında açık bir not var. **Yan etki (kasıtlı):** `SoruHavuzu.collectPool` artık Lesen'i de topluyor — Zayıf Konular Modu, Günlük 15 Dakika ve İstatistik Ekranı otomatik olarak Lesen'i de kapsıyor. **Kritik regresyon düzeltmesi:** `tema-modu.js`'teki `renderLesen` artık `secenekler` varsa çoktan seçmeli render ediyor (aksi halde kullanıcı artık puanlı bir soruyu serbest metinle "cevaplamaya" çalışırdı).

### v3.0 — BAŞLANMADI
- AI Öğretmen (otomatik Schreiben/Sprechen değerlendirme, AI soru üretimi, AI Koç Modu)

**Önemli:** Şu an tüm sorular **sabit/statik** — JSON dosyalarında elle yazılmış içerik. Dinamik/AI soru üretimi yok (v3.0'a kadar planlanmıyor).

---

## 2. Mimari Özet

```
index.html                        — Uygulama kabuğu
css/style.css                     — Tasarım sistemi (CSS custom properties)
js/
├── app.js                        — Dashboard, TEMALAR dizisi, routing
├── storage.js                    — LocalStorage katmanı (answers/progress/leitner)
├── i18n.js                       — N-dilli i18n çekirdeği: LANGUAGES listesi, BASE_LANG, I18n.t (UI sözlüğü) + I18n.contentField (içerik alanları) + cycleLanguage
├── components/
│   ├── soru-kart.js               — Paylaşılan soru render + ses bağlamı bileşeni
│   ├── redemittel-bank.js         — Redemittel-Bank tam ekran görünüm + Sprechen yardım paneli
│   ├── istatistik-ekrani.js       — İstatistik Ekranı (state'siz, renderFullView deseni — Study Mode değil)
│   └── disa-aktarma.js            — Dışa Aktarma ekranı (state'siz, renderFullView deseni — Study Mode değil)
└── study-modes/
    ├── soru-havuzu-yardimci.js    — Paylaşılan SoruHavuzu.collectPool (tüm temalardan gramer+hören havuzu)
    ├── istatistik-yardimci.js     — Paylaşılan groupByLeitnerStats + byGramerKategori/byTema/bySprachhandlung
    ├── disa-aktarma-yardimci.js   — Saf rapor üretimi: buildReportData/formatReportText/buildJsonExportPayload
    ├── sinav-sayaci-yardimci.js   — Saf deadline/kalan süre/format yardımcısı (DTZ Sınav Modu'nun gerçek zamanlı sayacı için)
    ├── tema-modu.js               — 7 adımlı normal çalışma modu (refresh() ile dil değişiminde state korunur)
    ├── zayif-konular-modu.js      — Leitner tabanlı akıllı tekrar modu (refresh() ile dil değişiminde state korunur)
    ├── kamp-21-gun.js             — Sabit 21 günlük müfredat modu, self-paced gün kilidi (refresh() ile dil değişiminde state korunur)
    ├── gunluk-15-dakika.js        — Sabit 10 soruluk hızlı tur (7 tekrar+3 yeni), sınırsız başlatma (refresh() ile dil değişiminde state korunur)
    └── dtz-sinav-modu.js          — Gerçek DTZ formatını taklit eden zamanlı deneme sınavı, deadline tabanlı sayaç (refresh() ile dil değişiminde state korunur, interval yeniden başlatılmaz)
content/temalar/*.json            — 11 tema içeriği (PRD §15 şemasına uygun)
content/redemittel-bank.json      — Temadan bağımsız konuşma stratejisi ifade bankası (PRD §7.1)
content/kamp-21-gun.json          — 21 Günlük Kamp müfredatı, referans+özel görev karışımı (PRD §17.1)
assets/audio/, assets/fotos/      — AI üretimi medya (Magnific/ElevenLabs)
.github/workflows/deploy-pages.yml — Otomatik GitHub Pages deploy
```

**Framework/build yok** (v1.0-v2.0 kuralı) — dosyalar doğrudan tarayıcıda çalışır, `python3 -m http.server` ile test edilir.

**Storage şeması:**
```js
{
  answers: { [temaId]: { [questionId]: { value, savedAt } } },
  progress: { [temaId]: { completedSteps: [], lastStep, lastStudiedAt } },
  leitner: { [questionId]: { box, dueAt, lastResult, correctCount, incorrectCount, lastReviewedAt } },
  kamp: { gunIlerleme: { [gunNo]: { tamamlananGorevler: [], tamamlandiMi, tamamlanmaTarihi } } },
  dtzSinav: null | { startedAt, currentSection, hoerenIds, hoerenDeadline, lesenDeadline, sectionAutoFinished, schreibenSprechenTemaId }
}
```
`kamp.gunIlerleme` izole bir alandır, `answers/progress/leitner`'a dokunmaz. "Açık gün" ayrı saklanmaz — `Storage.getKampAcikGun()` tamamlanan en yüksek günden türetir (tek doğruluk kaynağı). `dtzSinav` da izole bir alan — tek bir aktif sınav oturumu (yoksa `null`), `hoerenDeadline`/`lesenDeadline` epoch ms timestamp'leri (bellekte değil kalıcı depoda), süre bunlardan her seferinde `deadline - Date.now()` ile yeniden hesaplanır.

---

## 3. Önemli Kararlar ve Öğrenmeler

- **Karakter kodlaması:** Tüm dosyalar UTF-8, Almanca (ä/ö/ü/ß) ve Türkçe (ı/ş/ğ/ç/ö/ü) özel karakterleri doğrudan kullanılır. "Kıvrık tırnak yasağı" (sadece `'` `'` `"` `"` gibi tırnak işaretleri için) yanlışlıkla normal harflere de uygulanmıştı, sonradan düzeltildi — bu hataya bir daha düşülmemeli.
- **JSON şemasındaki enum-benzeri alanlar** (`cevapTipi`, `sesKaynagi`, `modus`) PRD'nin orijinal ASCII yazımıyla tutarlı bırakılıyor (örn. `"acikUclu"`, `"kayit"`, `"eşli-veya-simule"`) — bunlar kod tanımlayıcısı, görüntülenen metin değil.
- **AI medya üretimi:** Ses (ElevenLabs TTS) ve fotoğraf (AI görsel üretimi) Magnific üzerinden, şirket hesabında ayrı "DTZ B1 Trainer" projesinde üretiliyor. Üretim sırasında dosyaya isim verilemiyor (API'de böyle bir alan yok), indirmeler her zaman jenerik isimle geliyor (`audio.mp3`, `render.jpg`).
  - **Fotoğraflar** içerikten görsel olarak tanınabiliyor (farklı sahneler) — sorun değil.
  - **Sesler** dinlemeden ayırt edilemiyor. En güvenilir yöntem: kullanıcı Magnific'te her kaydın orijinal üretim metnini görüp buraya yapıştırıyor, JSON'daki transkriptle birebir karşılaştırılıp eşleştiriliyor.
  - Bu sandbox'ın ağ politikası Magnific'in CDN'ine (`cdnpk.net`) doğrudan erişimi engelliyor — dosyalar indirilemiyor, kullanıcının manuel indirip yüklemesi gerekiyor.
- **GitHub Pages deploy:** GitHub Free planında Pages sadece **public** repolarda çalışıyor (private repo Pro/Team/Enterprise ister). Repo public yapıldı. Deploy `.github/workflows/deploy-pages.yml` ile GitHub Actions üzerinden otomatik (`actions/configure-pages` içinde `enablement: true` şart, aksi halde ilk çalıştırmada "Not Found" hatası veriyor).
- **Bulunan ve düzeltilen hatalar:**
  1. Zayıf Konular Modu'nda bir soruyu birden fazla kez tıklamak (örn. önce yanlışı deneyip sonra doğruyu seçmek) puanı ve Leitner istatistiklerini kalıcı olarak şişiriyordu → artık ilk cevaptan sonra seçenekler kilitleniyor.
  2. Zayıf Konular Modu'nda dinleme (Hören) kaynaklı sorular ses/transkript bağlamı olmadan gösteriliyordu → `SoruKart.renderAudioContext` ile düzeltildi, artık ses+transkript de gösteriliyor.

---

## 4. Sırada Ne Var (öneri sırası)

**v1.5 TAMAMLANDI. v2.0 TAMAMLANDI** (İstatistik Ekranı + Dışa Aktarma + DTZ Sınav Modu). Sırada:

1. v3.0: AI entegrasyonu (AI Öğretmen — otomatik Schreiben/Sprechen değerlendirme, AI soru üretimi, AI Koç Modu). Bu noktada `guvenlik-uzmani` benzeri bir agent ve API anahtarı yönetimi gerekecek. DTZ Sınav Modu'nun sonuç ekranındaki "genel B1 sonucu otomatik hesaplanamıyor" notu, Schreiben/Sprechen otomatik değerlendirmesi v3.0'da geldiğinde kaldırılabilir.

Not: v2.0'ın tamamı tek branch'te (`claude/devlog-review-planning-q2xphc`) biriktirildi, kullanıcı tercihine göre v1.5'teki gibi özellik başına ayrı PR açılmadı — v2.0 bitince tek PR açılacak/açıldı (bkz. üstteki Branch durumu notu).

Not: v1.5'in tüm işleri PR #6 (https://github.com/coltranesx/deutsch-dtz-b1-test/pull/6) ile `main`'e merge edildi, GitHub Pages otomatik deploy tetiklendi.

Not: Redemittel-Bank şu an sadece Sprechen'e entegre; Schreiben görevlerine (özellikle halbformell/formell register'da) benzer bir yardım paneli eklemek istenirse bu ayrı bir takip maddesi olarak ele alınmalı (bkz. `schreiben-sprechen-uzmani`).

Ayrıca test sırasında bulunacak başka hatalar için: `.claude/agents/soru-kontrolcu` ve `almanca-dil-uzmani` içerik denetimi için, `pwa-vanilla-js-uzmani` kod/mimari sorunları için çağrılabilir.
