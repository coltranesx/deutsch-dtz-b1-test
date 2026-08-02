# DTZ B1 Trainer — Claude Code Geliştirme Protokolü

Bu belge, **DTZ B1 Trainer** projesinde çalışan Claude Code'un uyması gereken kuralları, mimariyi ve uzman sub-agent kullanım rehberini içerir. Detaylı ürün tanımı için `PRD.md` dosyasına bakın.

---

## 1. PROJEYİ TANIMA

**DTZ B1 Trainer**, Vanilla HTML/CSS/JavaScript ile yazılmış, offline çalışan bir Progressive Web App (PWA)'dir. Amaç, DTZ (Deutsch-Test für Zuwanderer) B1 sınavına hazırlanan öğrencilere pratik yaptırmaktır — konu anlatmaz, pratik yaptırır, hatayı gösterir, tekrar ettirir.

### Temel Kavramlar
| Kavram | Açıklama |
|---|---|
| **Handlungsfeld (Tema)** | DTZ'nin resmi 11 yaşam alanı (Wohnen, Arbeit, Gesundheit...) — PRD §6 |
| **Sprachhandlung** | Konudan bağımsız dil işlevi etiketi (Informationsaustausch, Handlungsregulierung...) — PRD §8.2 |
| **Gramer Taksonomisi** | 6 ana kategori (Verb, Nomen, Artikelwörter/Pronomen, Adjektiv, Präposition, Satz) — PRD §8.4 |
| **Leitpunkt** | Schreiben görevinde yanıtlanması zorunlu alt madde — PRD §9 |
| **Tema Modu** | Kelime -> Gramer -> Lesen -> Hören -> Schreiben -> Sprechen -> Mini Test akışı — PRD §17 |

### Kritik Dosyalar
```
PRD.md                          — Ürün tanımı, tüm spesifikasyon (SSoT — Single Source of Truth)
index.html                      — Uygulama kabuğu
js/app.js                       — Dashboard, tema listesi, routing
js/storage.js                   — LocalStorage okuma/yazma katmanı
js/study-modes/tema-modu.js     — 7 adımlı Tema Modu render mantığı
content/temalar/<id>.json       — Her Tema'nın içeriği (PRD §15 şemasına uymalı)
manifest.json / sw.js           — PWA manifest ve offline service worker
```

---

## 2. KESİN KURALLAR

### Framework Yasağı (v1.0-v2.0)
- Bu proje **Vanilla JavaScript**'tir. React, Vue veya benzeri bir framework/bundler eklenmez. v3.0'a kadar build adımı yoktur — dosyalar doğrudan tarayıcıda çalışır.
- Modül deseni: her `js/` dosyası bir IIFE (`const X = (() => {...})()`) ile kendi kapsamını oluşturur, global scope kirletilmez.

### İçerik Şeması Sabittir
- Her Tema JSON dosyası PRD.md §15'teki şemaya birebir uymalıdır: `temaId, temaNo, baslik, handlungsfeld, kelime[], gramer[], lesen, hoeren, schreiben, sprechen, miniTest`.
- Yeni alan eklenecekse önce PRD.md §15 güncellenir, sonra kod.
- `konu` alanı (gramer sorularında) PRD §8.4 taksonomisine hiyerarşik path formatında olmalı (örn. `Präposition.lokal`).

### Karakter Kodlaması
- Tüm dosyalar UTF-8'dir. Almanca özel karakterler (ä, ö, ü, ß) ve Türkçe özel karakterler (ı, ş, ğ, ç, ö, ü) doğrudan kullanılır — ae/oe/ue/ss veya i/s/g/c/o/u gibi ASCII karşılıklarıyla değiştirilmez. Teknik bir zorunluluk yok, dosyaların hepsi UTF-8 destekliyor.
- Kıvrık/Unicode tırnak işaretleri (`'`, `'`, `"`, `"`) kullanılmaz. Düz ASCII `'` (U+0027) veya `"` (U+0022) kullanılır. Bu kural sadece tırnak işaretleri içindir, harfleri kapsamaz.
- İstisna: JSON şemasındaki enum benzeri tanımlayıcı alanlar (`cevapTipi`, `sesKaynagi`, `modus` gibi) PRD'nin orijinal spesifikasyonundaki ASCII yazımını korur — bunlar görüntülenen metin değil, kod tanımlayıcılarıdır.

### Veri ve Gizlilik
- v1.0-v2.0'da hiçbir API çağrısı veya harici servis yok — her şey cihazda (LocalStorage) çalışır.
- v3.0'da AI entegrasyonu eklenince API anahtarı yönetimi için ayrı bir güvenlik incelemesi yapılır (henüz geçerli değil).

### Patch Kod Yasak
Geçici `try/catch` ile gizlenmiş çözüm, `// TODO: fix later`, workaround kabul edilmez. Kök nedeni bul.

---

## 3. HIZLI BAŞLANGIÇ

```bash
python3 -m http.server 8420      # Yerel sunucu (fetch() CORS gerektirdiği için file:// çalışmaz)
# http://localhost:8420/index.html adresini aç
```

Bu projede npm/build adımı yoktur (v1.0-v2.0). Değişiklik sonrası tarayıcıda manuel test şart.

---

## 4. YENİ TEMA EKLEME (ÖZET)

1. `content/temalar/tema-NN-<isim>.json` dosyasını PRD §15 şemasına uygun oluştur (`dtz-icerik-uzmani` çağır)
2. Almanca içeriğin doğruluğunu kontrol et (`almanca-dil-uzmani` çağır)
3. Gramer sorularının `konu` etiketlerini taksonomiye göre doğrula (`gramer-taksonomi-uzmani` çağır)
4. Schreiben/Sprechen görevlerini rubriğe göre tasarla (`schreiben-sprechen-uzmani` çağır)
5. `js/app.js` içindeki `TEMALAR` dizisine yeni girdiyi ekle
6. `sw.js` içindeki `APP_SHELL` listesine yeni JSON dosyasını ekle (offline cache için)
7. Bütün soru setini üretime almadan önce denetle (`soru-kontrolcu` çağır)
8. Tarayıcıda uçtan uca test et (dashboard -> tema aç -> 7 adım -> mini test)

---

## 5. UZMAN SUB-AGENT REHBERİ

Bu projede `.claude/agents/` altında **7 uzman sub-agent** tanımlıdır.

### 📋 `dtz-icerik-uzmani`
**Ne zaman çağır:** Yeni bir Tema (Handlungsfeld) içeriği oluşturulacaksa, mevcut bir Tema'nın içeriği genişletilecekse, PRD §15 şemasına uyum kontrolü gerekiyorsa.
**Araçlar:** Read, Write, Edit, Glob, Grep

### 🇩🇪 `almanca-dil-uzmani`
**Ne zaman çağır:** Tema içeriğindeki Almanca cümlelerin (kelime, gramer, lesen, hoeren, schreiben, sprechen) dilbilgisel doğruluğundan emin olmak gerektiğinde.
**Araçlar:** Read, Glob, Grep (sadece okur)

### 🏷️ `gramer-taksonomi-uzmani`
**Ne zaman çağır:** Gramer sorularının `konu` etiketi PRD §8.4'teki 6 kategoriye doğru eşlenip eşlenmediği kontrol edilecekse, yeni bir taksonomi alt-dalı (path) tanımlanacaksa.
**Araçlar:** Read, Glob, Grep (sadece okur)

### ✍️ `schreiben-sprechen-uzmani`
**Ne zaman çağır:** Yeni bir Schreiben görevi (Leitpunkte, register, kelime aralığı) veya Sprechen 3 parçalı görev (Teil 1/2/3) tasarlanacaksa, Redemittel-Bank entegrasyonu planlanacaksa.
**Araçlar:** Read, Write, Edit, Glob, Grep

### ⚙️ `pwa-vanilla-js-uzmani`
**Ne zaman çağır:** `js/app.js`, `js/storage.js`, `js/study-modes/` altında yeni bir Study Mode eklenecekse, service worker/offline cache mantığı değişecekse, LocalStorage veri yapısı genişletilecekse.
**Araçlar:** Read, Write, Edit, Glob, Grep, Bash

### 🔍 `soru-kontrolcu`
**Ne zaman çağır:** Bir Tema'nın tüm soru seti (gramer, hoeren, lesen) üretime alınmadan önce son kontrolden geçirilecekse, şema + pedagojik kalite denetimi gerekiyorsa.
**Araçlar:** Read, Glob, Grep, Bash (sadece okur)

### 🏛️ `mimar-agent`
**Ne zaman çağır:** 3 veya daha fazla dosyayı etkileyen değişiklik planlanıyorsa (örn. yeni Study Mode, istatistik sistemi, IndexedDB geçişi), mevcut mimarinin bir soruna neden olduğu düşünülüyorsa.
**Araçlar:** Read, Glob, Grep, Bash (sadece okur ve analiz eder — **uygulama yapmaz**)

### 🎨 `ui-ux-tasarim-uzmani`
**Ne zaman çağır:** Yeni bir Study Mode/ekran eklendikten sonra tasarım diliyle (spacing/renk/tipografi/navigasyon) tutarlılık kontrolü gerekiyorsa, bir navigasyon/etkileşim şikayeti geldiğinde kök nedeni görsel olarak doğrulamak gerekiyorsa, uygulamanın tamamı veya bir bölümü için uçtan uca bir UX denetimi isteniyorsa, mobil/masaüstü ya da dark/light mode arası görsel tutarlılık şüphesi varsa.
**Araçlar:** Read, Glob, Grep, Bash (yerel sunucu + Playwright ile gerçek ekran görüntüsü alır — **sadece denetler, kod yazmaz**; uygulama `pwa-vanilla-js-uzmani`'ye devredilir)

---

## 6. MİMARİ HARİTA (v1.0)

```
dtz-b1-trainer/
├── PRD.md                          ← Tek doğruluk kaynağı (SSoT)
├── index.html                      ← Uygulama kabuğu
├── manifest.json                   ← PWA manifest
├── sw.js                           ← Offline service worker
├── css/style.css                   ← Tüm stiller (light/dark tema değişkenleri)
├── js/
│   ├── app.js                      ← Dashboard + tema listesi + routing
│   ├── storage.js                  ← LocalStorage katmanı (cevap + ilerleme)
│   └── study-modes/
│       └── tema-modu.js            ← 7 adımlı Tema Modu (v1.0'ın tek modu)
├── content/
│   └── temalar/
│       ├── tema-01-wohnen.json
│       ├── tema-06-gesundheit.json
│       └── tema-09-einkaufen.json
└── assets/
    ├── audio/                      ← Hören ses dosyaları (AI TTS ile üretildi)
    └── fotos/                      ← Sprechen Teil 2 fotoğrafları (AI ile üretildi)
```

**Roadmap (PRD §25):** v1.5 Zayıf Konular Modu + Redemittel-Bank, v2.0 DTZ Sınav Modu + istatistik, v3.0 AI Öğretmen (ChatGPT API entegrasyonu — o zaman `guvenlik-uzmani` benzeri bir agent eklenmeli).

---

## 7. ÇALIŞMA AKIŞI

1. **Değişiklik öncesi oku** — PRD.md ilgili bölümünü ve ilgili dosyayı anlamadan satır ekleme/çıkarma.
2. **Şemaya sadık kal** — Tema JSON'ları PRD §15'e uymadan commit etme.
3. **Sub-agent koordinasyonu** — Birden fazla uzmanlık alanı kapsayan iş varsa ilgili agent'ları çağır.
4. **Tarayıcıda test** — Build adımı olmadığı için tek doğrulama yolu tarayıcıda manuel/otomatize (Playwright) testtir.
5. **UX onayı** — Yeni bir Study Mode/ekran eklendiğinde veya mevcut bir ekranın görsel/etkileşim tasarımı değiştiğinde, üretime almadan önce `ui-ux-tasarim-uzmani` ile denetlenir (tutarlılık, navigasyon, erişilebilirlik, mobil/masaüstü ve dark/light parite). Sadece içerik/veri değişikliği (örn. yeni Tema JSON'u, mevcut bir ekranın davranışını değiştirmeyen bug fix) bu adımı gerektirmez.
6. **Dil** — Kullanıcıyla iletişim her zaman **Türkçe**. Almanca gramer terimleri (Konjunktiv, Genitiv, Handlungsfeld...) çevrilmez.
