# DTZ B1 Trainer — Claude Code Gelistirme Protokolu

Bu belge, **DTZ B1 Trainer** projesinde calisan Claude Code'un uymasi gereken kurallari, mimariyi ve uzman sub-agent kullanim rehberini icerir. Detayli urun tanimi icin `PRD.md` dosyasina bakin.

---

## 1. PROJEYI TANIMA

**DTZ B1 Trainer**, Vanilla HTML/CSS/JavaScript ile yazilmis, offline calisan bir Progressive Web App (PWA)'dir. Amac, DTZ (Deutsch-Test fuer Zuwanderer) B1 sinavina hazirlanan ogrencilere pratik yaptirmaktir — konu anlatmaz, pratik yaptirir, hatayi gosterir, tekrar ettirir.

### Temel Kavramlar
| Kavram | Aciklama |
|---|---|
| **Handlungsfeld (Tema)** | DTZ'nin resmi 11 yasam alani (Wohnen, Arbeit, Gesundheit...) — PRD §6 |
| **Sprachhandlung** | Konudan bagimsiz dil islevi etiketi (Informationsaustausch, Handlungsregulierung...) — PRD §8.2 |
| **Gramer Taksonomisi** | 6 ana kategori (Verb, Nomen, Artikelwoerter/Pronomen, Adjektiv, Praeposition, Satz) — PRD §8.4 |
| **Leitpunkt** | Schreiben gorevinde yanitlanmasi zorunlu alt madde — PRD §9 |
| **Tema Modu** | Kelime -> Gramer -> Lesen -> Hoeren -> Schreiben -> Sprechen -> Mini Test akisi — PRD §17 |

### Kritik Dosyalar
```
PRD.md                          — Urun tanimi, tum spesifikasyon (SSoT — Single Source of Truth)
index.html                      — Uygulama kabugu
js/app.js                       — Dashboard, tema listesi, routing
js/storage.js                   — LocalStorage okuma/yazma katmani
js/study-modes/tema-modu.js     — 7 adimli Tema Modu render mantigi
content/temalar/<id>.json       — Her Tema'nin icerigi (PRD §15 semasina uymali)
manifest.json / sw.js           — PWA manifest ve offline service worker
```

---

## 2. KESIN KURALLAR

### Framework Yasagi (v1.0-v2.0)
- Bu proje **Vanilla JavaScript**'tir. React, Vue veya benzeri bir framework/bundler eklenmez. v3.0'a kadar build adimi yoktur — dosyalar dogrudan tarayicida calisir.
- Modul deseni: her `js/` dosyasi bir IIFE (`const X = (() => {...})()`) ile kendi kapsamini olusturur, global scope kirletilmez.

### Icerik Semasi Sabittir
- Her Tema JSON dosyasi PRD.md §15'teki semaya birebir uymalidir: `temaId, temaNo, baslik, handlungsfeld, kelime[], gramer[], lesen, hoeren, schreiben, sprechen, miniTest`.
- Yeni alan eklenecekse once PRD.md §15 guncellenir, sonra kod.
- `konu` alani (gramer sorularinda) PRD §8.4 taksonomisine hiyerarsik path formatinda olmali (orn. `Praeposition.lokal`).

### Kivrik Tirnak Yasagi
- Kivrik/Unicode tirnak isaretleri (`'`, `'`, `"`, `"`) kullanilmaz. Duz ASCII `'` (U+0027) veya `"` (U+0022) kullanilir.
- Almanca ozel karakterler (ae/oe/ue/ss yerine ä/ö/ü/ß) metin icinde kullanilabilir, ama JSON dosyalarinda UTF-8 encoding korunmalidir.

### Veri ve Gizlilik
- v1.0-v2.0'da hicbir API cagrisi veya harici servis yok — her sey cihazda (LocalStorage) calisir.
- v3.0'da AI entegrasyonu eklenince API anahtari yonetimi icin ayri bir guvenlik incelemesi yapilir (henuz gecerli degil).

### Patch Kod Yasak
Gecici `try/catch` ile gizlenmis cozum, `// TODO: fix later`, workaround kabul edilmez. Kok nedeni bul.

---

## 3. HIZLI BASLANGIC

```bash
python3 -m http.server 8420      # Yerel sunucu (fetch() CORS gerektirdigi icin file:// calismaz)
# http://localhost:8420/index.html adresini ac
```

Bu projede npm/build adimi yoktur (v1.0-v2.0). Degisiklik sonrasi tarayicida manuel test sart.

---

## 4. YENI TEMA EKLEME (OZET)

1. `content/temalar/tema-NN-<isim>.json` dosyasini PRD §15 semasina uygun olustur (`dtz-icerik-uzmani` cagir)
2. Almanca icerigin dogrulugunu kontrol et (`almanca-dil-uzmani` cagir)
3. Gramer sorularinin `konu` etiketlerini taksonomiye gore dogrula (`gramer-taksonomi-uzmani` cagir)
4. Schreiben/Sprechen gorevlerini rubrige gore tasarla (`schreiben-sprechen-uzmani` cagir)
5. `js/app.js` icindeki `TEMALAR` dizisine yeni girdiyi ekle
6. `sw.js` icindeki `APP_SHELL` listesine yeni JSON dosyasini ekle (offline cache icin)
7. Butun soru setini uretime almadan once denetle (`soru-kontrolcu` cagir)
8. Tarayicida uctan uca test et (dashboard -> tema ac -> 7 adim -> mini test)

---

## 5. UZMAN SUB-AGENT REHBERI

Bu projede `.claude/agents/` altinda **7 uzman sub-agent** tanimlidir.

### 📋 `dtz-icerik-uzmani`
**Ne zaman cagir:** Yeni bir Tema (Handlungsfeld) icerigi olusturulacaksa, mevcut bir Tema'nin icerigi genisletilecekse, PRD §15 semasina uyum kontrolu gerekiyorsa.
**Araclar:** Read, Write, Edit, Glob, Grep

### 🇩🇪 `almanca-dil-uzmani`
**Ne zaman cagir:** Tema icerigindeki Almanca cumlelerin (kelime, gramer, lesen, hoeren, schreiben, sprechen) dilbilgisel dogrulugundan emin olmak gerektiginde.
**Araclar:** Read, Glob, Grep (sadece okur)

### 🏷️ `gramer-taksonomi-uzmani`
**Ne zaman cagir:** Gramer sorularinin `konu` etiketi PRD §8.4'teki 6 kategoriye dogru esitlenip esitlenmedigi kontrol edilecekse, yeni bir taksonomi alt-dali (path) tanimlanacaksa.
**Araclar:** Read, Glob, Grep (sadece okur)

### ✍️ `schreiben-sprechen-uzmani`
**Ne zaman cagir:** Yeni bir Schreiben gorevi (Leitpunkte, register, kelime araligi) veya Sprechen 3 parcali gorev (Teil 1/2/3) tasarlanacaksa, Redemittel-Bank entegrasyonu planlanacaksa.
**Araclar:** Read, Write, Edit, Glob, Grep

### ⚙️ `pwa-vanilla-js-uzmani`
**Ne zaman cagir:** `js/app.js`, `js/storage.js`, `js/study-modes/` altinda yeni bir Study Mode eklenecekse, service worker/offline cache mantigi degisecekse, LocalStorage veri yapisi genisletilecekse.
**Araclar:** Read, Write, Edit, Glob, Grep, Bash

### 🔍 `soru-kontrolcu`
**Ne zaman cagir:** Bir Tema'nin tum soru seti (gramer, hoeren, lesen) uretime alinmadan once son kontrolden gecirilecekse, sema + pedagojik kalite denetimi gerekiyorsa.
**Araclar:** Read, Glob, Grep, Bash (sadece okur)

### 🏛️ `mimar-agent`
**Ne zaman cagir:** 3 veya daha fazla dosyayi etkileyen degisiklik planlaniyorsa (orn. yeni Study Mode, istatistik sistemi, IndexedDB gecisi), mevcut mimarinin bir soruna neden oldugu dusunuluyorsa.
**Araclar:** Read, Glob, Grep, Bash (sadece okur ve analiz eder — **uygulama yapmaz**)

---

## 6. MIMARI HARITA (v1.0)

```
dtz-b1-trainer/
├── PRD.md                          ← Tek dogruluk kaynagi (SSoT)
├── index.html                      ← Uygulama kabugu
├── manifest.json                   ← PWA manifest
├── sw.js                           ← Offline service worker
├── css/style.css                   ← Tum stiller (light/dark tema degiskenleri)
├── js/
│   ├── app.js                      ← Dashboard + tema listesi + routing
│   ├── storage.js                  ← LocalStorage katmani (cevap + ilerleme)
│   └── study-modes/
│       └── tema-modu.js            ← 7 adimli Tema Modu (v1.0'in tek modu)
├── content/
│   └── temalar/
│       └── tema-01-wohnen.json     ← Ilk tema (tam dolu)
└── assets/
    ├── audio/                      ← v1.5+ gercek ses kayitlari
    └── fotos/                      ← v1.5+ Sprechen Teil 2 fotograflari
```

**Roadmap (PRD §25):** v1.5 Zayif Konular Modu + Redemittel-Bank, v2.0 DTZ Sinav Modu + istatistik, v3.0 AI Ogretmen (ChatGPT API entegrasyonu — o zaman `guvenlik-uzmani` benzeri bir agent eklenmeli).

---

## 7. CALISMA AKISI

1. **Degisiklik oncesi oku** — PRD.md ilgili bolumunu ve ilgili dosyayi anlamadan satir ekleme/cikarma.
2. **Semaya sadik kal** — Tema JSON'lari PRD §15'e uymadan commit etme.
3. **Sub-agent koordinasyonu** — Birden fazla uzmanlik alani kapsayan is varsa ilgili agent'lari cagir.
4. **Tarayicida test** — Build adimi olmadigi icin tek dogrulama yolu tarayicida manuel/otomatize (Playwright) testtir.
5. **Dil** — Kullaniciyla iletisim her zaman **Turkce**. Almanca gramer terimleri (Konjunktiv, Genitiv, Handlungsfeld...) cevrilmez.
