# DTZ B1 Trainer — Devlog

Bu dosya, projenin güncel durumunu ve önemli kararları/öğrenmeleri özetler. Yeni bir sohbete başlarken buradan devam edilebilir.

**Son güncelleme:** 2026-08-01
**Canlı adres:** https://coltranesx.github.io/deutsch-dtz-b1-test/
**Repo:** coltranesx/deutsch-dtz-b1-test (public, GitHub Pages ile otomatik deploy)
**Branch durumu:** `claude/devlog-review-planning-q2xphc` üzerinde çalışıldı (21 Günlük Kamp özelliği), branch `origin`'e push edildi — henüz `main`'e merge edilmedi, PR açılmadı (kullanıcı istemedi). Yeni bir sohbet bu branch'in üzerinden devam edebilir veya `main`'e merge/PR kararını kullanıcıyla netleştirebilir.

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

### v2.0 / v3.0 — BAŞLANMADI
- v2.0: Gelişmiş istatistik, PDF/JSON dışa aktarma, DTZ Sınav Modu
- v3.0: AI Öğretmen (otomatik Schreiben/Sprechen değerlendirme, AI soru üretimi, AI Koç Modu)

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
│   ├── soru-kart.js              — Paylaşılan soru render + ses bağlamı bileşeni
│   └── redemittel-bank.js        — Redemittel-Bank tam ekran görünüm + Sprechen yardım paneli
└── study-modes/
    ├── soru-havuzu-yardimci.js    — Paylaşılan SoruHavuzu.collectPool (tüm temalardan gramer+hören havuzu, Zayıf Konular + Günlük 15 Dakika arasında ortak)
    ├── tema-modu.js               — 7 adımlı normal çalışma modu (refresh() ile dil değişiminde state korunur)
    ├── zayif-konular-modu.js      — Leitner tabanlı akıllı tekrar modu (refresh() ile dil değişiminde state korunur)
    ├── kamp-21-gun.js             — Sabit 21 günlük müfredat modu, self-paced gün kilidi (refresh() ile dil değişiminde state korunur)
    └── gunluk-15-dakika.js        — Sabit 10 soruluk hızlı tur (7 tekrar+3 yeni), sınırsız başlatma (refresh() ile dil değişiminde state korunur)
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
  kamp: { gunIlerleme: { [gunNo]: { tamamlananGorevler: [], tamamlandiMi, tamamlanmaTarihi } } }
}
```
`kamp.gunIlerleme` izole bir alandır, `answers/progress/leitner`'a dokunmaz. "Açık gün" ayrı saklanmaz — `Storage.getKampAcikGun()` tamamlanan en yüksek günden türetir (tek doğruluk kaynağı).

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

**v1.5 TAMAMLANDI** (Zayıf Konular Modu, Redemittel-Bank, TR/EN i18n, 21 Günlük Kamp, Günlük 15 Dakika — hepsi bitti).

1. v2.0: istatistik ekranı, dışa aktarma, DTZ Sınav Modu (PRD §22, §13, §17 — DTZ Sınav Modu `SoruHavuzu.collectPool` benzeri bir havuzlama ihtiyacı duyacak, mevcut yardımcı modülden faydalanabilir)
2. v3.0: AI entegrasyonu (bu noktada `guvenlik-uzmani` benzeri bir agent ve API anahtarı yönetimi gerekecek)

Not: v1.5'in tüm işleri `claude/devlog-review-planning-q2xphc` branch'inde, PR #6 açıldı (https://github.com/coltranesx/deutsch-dtz-b1-test/pull/6), henüz `main`'e merge edilmedi.

Not: Redemittel-Bank şu an sadece Sprechen'e entegre; Schreiben görevlerine (özellikle halbformell/formell register'da) benzer bir yardım paneli eklemek istenirse bu ayrı bir takip maddesi olarak ele alınmalı (bkz. `schreiben-sprechen-uzmani`).

Ayrıca test sırasında bulunacak başka hatalar için: `.claude/agents/soru-kontrolcu` ve `almanca-dil-uzmani` içerik denetimi için, `pwa-vanilla-js-uzmani` kod/mimari sorunları için çağrılabilir.
