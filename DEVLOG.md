# DTZ B1 Trainer — Devlog

Bu dosya, projenin güncel durumunu ve önemli kararları/öğrenmeleri özetler. Yeni bir sohbete başlarken buradan devam edilebilir.

**Son güncelleme:** 2026-07-31
**Canlı adres:** https://coltranesx.github.io/deutsch-dtz-b1-test/
**Repo:** coltranesx/deutsch-dtz-b1-test (public, GitHub Pages ile otomatik deploy)

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
- ✅ **İçerik seviyesinde EN desteği** (PRD §15.1 + §7.1): 11 tema dosyasına `kelime[].en` (54 adet) ve `gramer[].aciklamaEn` (33 adet) alanları eklendi; `redemittel-bank.json`'a `kategoriler[].aciklamaEn` (3), `ifadeler[].en` + `ifadeler[].kullanimEn` (24×2) eklendi — hepsi additive-only, mevcut `tr`/`aciklama`/`kullanim` alanlarına dokunulmadı. Lesen/Hören/Schreiben/Sprechen içeriği (sınavın kendisi) kasıtlı olarak dışarıda bırakıldı, her zaman Almanca kalıyor. Kod tarafında yeni `I18n.contentField(obj, key)` yardımcı fonksiyonu bu ikili alanları çözer (`tr` → `en`, diğerleri → `<key>En`, fallback `tr` alanına); `js/study-modes/tema-modu.js` (kelime), `js/components/soru-kart.js` (gramer/soru `aciklama` geri bildirimi), `js/components/redemittel-bank.js` (ifade + kategori açıklaması) bu fonksiyonu kullanacak şekilde güncellendi — ayrı bir dosya/isim alanı, UI sözlüğüyle karışmıyor. `almanca-dil-uzmani` ile denetlendi (54 kelime + 33 gramer + 27 Redemittel-Bank alanı, hatasız onaylandı).
- ❌ **21 Günlük Kamp** — henüz yok
- ❌ **Günlük 15 Dakika** — henüz yok

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
├── i18n.js                       — TR/EN arayüz kabuğu sözlüğü (I18n.t/setLanguage/getLanguage)
├── components/
│   ├── soru-kart.js              — Paylaşılan soru render + ses bağlamı bileşeni
│   └── redemittel-bank.js        — Redemittel-Bank tam ekran görünüm + Sprechen yardım paneli
└── study-modes/
    ├── tema-modu.js               — 7 adımlı normal çalışma modu (refresh() ile dil değişiminde state korunur)
    └── zayif-konular-modu.js      — Leitner tabanlı akıllı tekrar modu (refresh() ile dil değişiminde state korunur)
content/temalar/*.json            — 11 tema içeriği (PRD §15 şemasına uygun)
content/redemittel-bank.json      — Temadan bağımsız konuşma stratejisi ifade bankası (PRD §7.1)
assets/audio/, assets/fotos/      — AI üretimi medya (Magnific/ElevenLabs)
.github/workflows/deploy-pages.yml — Otomatik GitHub Pages deploy
```

**Framework/build yok** (v1.0-v2.0 kuralı) — dosyalar doğrudan tarayıcıda çalışır, `python3 -m http.server` ile test edilir.

**Storage şeması:**
```js
{
  answers: { [temaId]: { [questionId]: { value, savedAt } } },
  progress: { [temaId]: { completedSteps: [], lastStep, lastStudiedAt } },
  leitner: { [questionId]: { box, dueAt, lastResult, correctCount, incorrectCount, lastReviewedAt } }
}
```

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

1. **21 Günlük Kamp** / **Günlük 15 Dakika** — sabit müfredat modları (PRD §17)
2. v2.0: istatistik ekranı, dışa aktarma, DTZ Sınav Modu
3. v3.0: AI entegrasyonu (bu noktada `guvenlik-uzmani` benzeri bir agent ve API anahtarı yönetimi gerekecek)

Not: Redemittel-Bank şu an sadece Sprechen'e entegre; Schreiben görevlerine (özellikle halbformell/formell register'da) benzer bir yardım paneli eklemek istenirse bu ayrı bir takip maddesi olarak ele alınmalı (bkz. `schreiben-sprechen-uzmani`).

Ayrıca test sırasında bulunacak başka hatalar için: `.claude/agents/soru-kontrolcu` ve `almanca-dil-uzmani` içerik denetimi için, `pwa-vanilla-js-uzmani` kod/mimari sorunları için çağrılabilir.
