# DTZ B1 Trainer

**AI Destekli DTZ (Deutsch-Test für Zuwanderer) Öğrenme Platformu**

**Durum: v1.0 geliştirmeye hazır — Master Planlama Dokümanı**

---

## Değişiklik Geçmişi (Özet)

| Aşama | Ne eklendi |
|---|---|
| v1.0-v1.1 | İlk konsept, Dashboard, Kapitel sistemi (kitaba bağlı), JSON şeması, Study Mode fikri |
| v1.2 | Kitaptan bağımsız mimariye geçiş: 12 tahmini Handlungsfeld |
| v1.3 | Resmi 11 Handlungsfeld (BAMF §8.1) + Sprachhandlungen ikinci ekseni (§8.2) |
| v1.4 | Redemittel-Bank — konuşma stratejileri (§8.3) |
| v1.5 | Resmi Gramer Taksonomisi — 6 ana kategori (§8.4) |
| v1.6 | Schreiben Değerlendirme Rubriği + Leitpunkt kavramı (§6.4.1) |
| v1.7 | Sprechen'in gerçek 3 parçalı görev yapısı (§6.4.2) |
| **FINAL** | Her şey tek dokümanda birleştirildi + Claude Code başlangıç kiti eklendi |

---

## 1. Projenin Amacı

DTZ B1 sınavına hazırlanan öğrenciler için tamamen mobil uyumlu, Progressive Web App (PWA) teknolojili, çevrimdışı çalışabilen, kullanıcı ilerlemesini takip eden, yapay zekâ destekli, kişiselleştirilmiş çalışma planı oluşturan modern bir eğitim platformu geliştirmek. Amaç yalnızca Almanca öğretmek değildir — asıl amaç **kullanıcıyı DTZ B1 sınavını geçecek seviyeye ulaştırmaktır.**

## 2. Hedef Kullanıcı

DTZ B1 öğrencileri, Intensivkurs/Integrationskurs öğrencileri, Goethe B1 / TELC B1 / ÖSD B1 öğrencileri — **hangi kitaptan çalışıyor olurlarsa olsunlar.**

## 3. Teknolojiler

| Katman | Teknoloji |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Mobil | Progressive Web App (PWA) |
| Veri | JSON (içerik), LocalStorage (v1.0), IndexedDB (ileride) |
| AI | ChatGPT API (v3.0'dan itibaren), çoklu LLM desteğine açık mimari |

## 4. Tasarım Felsefesi

Konu anlatan klasik bir eğitim uygulaması değil; pratik yaptıran, yanlışları gösteren, tekrar ettiren, kişisel eksikleri analiz eden, sınava hazırlayan bir sistem.

## 5. Dashboard

Genel başarı, günlük hedef, bugünkü çalışma, tamamlanan Tema, son çalışma tarihi, haftalık ilerleme, günlük seri (streak), başarı yüzdesi, (opsiyonel) hedef sınav tarihi.

## 6. Tema Sistemi (Resmi Handlungsfeld Listesi — BAMF §8.1)

Omurga, herhangi bir kitabın bölümü değil, DTZ'nin resmi 11 yaşam alanıdır:

1. **Wohnen** — konut piyasası, ev sahibi/emlakçı/yönetici/komşu iletişimi
2. **Arbeit** — amir/meslektaş/personel departmanı/müşteri iletişimi
3. **Arbeitssuche** — iş piyasası, resmi kurumlar/potansiyel işveren iletişimi
4. **Mediennutzung** — bilgi edinme, medya/dijital araç kullanımı
5. **Mobilität** — seyahat imkânları, ulaşım şirketleri/yol arkadaşı iletişimi
6. **Gesundheit** — sağlık hizmetleri, doktor/hastane/eczacı/sigorta iletişimi
7. **Aus- und Weiterbildung** — eğitim imkânları, kurumlarla iletişim
8. **Betreuung und Ausbildung der Kinder / Unterricht** — çocuk bakımı/okul/ders ortamı iletişimi
9. **Einkaufen** (Essen/Trinken dahil) — ürün/mağaza bilgisi, satış personeli iletişimi
10. **Ämter und Behörden** — resmi kurum yetkileri, memur iletişimi
11. **Banken und Versicherungen** — banka/sigorta işlemleri, personel iletişimi

**Not:** "Sprache/Sprachen lernen" konusu resmi kaynakta sınav kapsamı dışında bırakıldığı için Tema listesine alınmadı.

### Sprachhandlungen (Konudan Bağımsız Dil İşlevleri — §8.2)

Her Temanın Gramer/Schreiben/Sprechen öğeleri şu işlevlerden en az birini etiketler: **Gestaltung sozialer Kontakte, Informationsaustausch, Handlungsregulierung, Realisierung von Gefühlen/Haltungen/Meinungen, Umgang mit Dissens und Konflikten, Umgang mit der Migrationssituation/interkultureller Begegnung.** Bu ikinci eksen, Zayıf Konular Modu'nun "hangi konuda değil, hangi tür dil işlevinde zayıfsın" tespitini mümkün kılar.

### Her Tema Yapısı
1. Kelime → 2. Gramer → 3. Lesen → 4. Hören → 5. Schreiben → 6. Sprechen → 7. Mini Test

## 7. Redemittel-Bank (§8.3)

Temalardan bağımsız, sabit bir ifade/strateji bankası: **Redeorganisation** (söze başlama/bitirme, söz isteme), **Verständnissicherung** (anlaşılmayı kontrol etme, tekrar/yavaşlatma isteme, heceletme), **Kompensation** (kelime bilmediğinde tanımlayarak anlatma, kendini düzeltme). Sprechen pratiğinde kullanıcı takıldığında "yardım ifadeleri" olarak sunulur — gerçek sınavın canlı/eşli formatında donup kalmamayı öğretir.

## 8. Gramer Yapı Taksonomisi (§8.4)

| # | Kategori | Kapsam (özet) |
|---|---|---|
| 1 | Verb | Tempus, Modus (Konjunktiv II, Passiv), Verbvalenz, Wortbildung (trennbare Vorsilben) |
| 2 | Nomen | Genus, Numerus, Kasus (Nom/Akk/Dat/Gen, n-Deklination), Komposita |
| 3 | Artikelwörter/Pronomen | Definit/Indefinit Artikel, Personal-/Indefinit-/Reziprok-/Präpositionalpronomen |
| 4 | Adjektiv | attributiv/prädikativ/adverbial, Komparation, Wortbildung |
| 5 | Präposition | temporal, lokal, modal, weitere |
| 6 | Satz | Satzklammer, Negation, Fragesatz, Haupt+Nebensatz, Relativsatz, Infinitivsatz, Doppelkonjunktionen |

**İstisna:** Konjunktiv I ve Partizip I aktif üretim sorularında kullanılmaz (düşük frekanslı, resmi kaynakta hariç tutulmuş). `konu` etiketi bu taksonomiye dayalı hiyerarşik path formatındadır (örn. `Präposition.lokal`, `Satz.Nebensatz.weil-da`).

## 9. Schreiben Değerlendirme Rubriği (§6.4.1)

Her Schreiben görevi, yanıtlanması zorunlu **3-4 Leitpunkt (alt madde)** içerir. Değerlendirme 4 kriterle yapılır (her biri B1/A2/A1/0 bandına eşlenen 0-5 puan):

- **Inhalt** — kaç Leitpunkt'un ne kadar tam işlendiği
- **Kommunikative Gestaltung** — metin tutarlılığı, bağlaçlar, Anrede/Grußformel uygunluğu, register (informell/halbformell/formell)
- **Korrektheit** — dilbilgisi/yazım doğruluğu, hatalara rağmen anlaşılırlık
- **Wortschatz** — kelime seçiminin isabetliliği ve çeşitliliği

Bu rubrik hem v1.0'da AI'sız bir öz-kontrol checklist'i ("4 Leitpunkt'u da ele aldın mı?") hem de v3.0'da AI Teacher Mode'un otomatik puanlama mantığı olarak kullanılır.

## 10. Sprechen Görev Yapısı (§6.4.2)

Üç ayrı etkileşim türünden oluşur:

- **Teil 1 — Vorstellen + Nachfragen:** Sabit, Temadan bağımsız kendini-tanıtma şablonu (isim, yaş, medeni durum, meslek, ülke, diller) + Temaya göre değişen bir takip sorusu.
- **Teil 2 — Informationen geben + Vergleichen:** Temayla ilgili bir fotoğraf → betimleme → "Sizin ülkenizde nasıl?" kıyaslaması (kültürlerarası pratik).
- **Teil 3 — Etwas aushandeln:** İki kullanıcı (veya tek kullanıcı + "simüle partner" metni) ortak bir görevi planlar/pazarlık eder — Redemittel-Bank'ın Handlungsregulierung kategorisi burada devreye girer.

Değerlendirme resmi kaynakta iki aşamalı: önce global izlenim, sonra analitik kriter kırılımı, sonra değerlendiriciler arası kalibrasyon — v3.0'daki AI Sprechen değerlendirmesi bu modeli izler.

## 11. Cevap Sistemi ve Kaydetme

HTML form elemanları (Input, Radio, Checkbox, TextArea); her cevap otomatik olarak LocalStorage'a kaydedilir, veri kaybı olmaz.

## 12. İlerleme Takibi ve Tekrar Sistemi

Tema + Sprachhandlung + Gramer-taksonomisi bazlı başarı takibi; yanlışlar otomatik tekrar sırasına girer (Zayıf Konular Modu).

## 13. Dışa Aktarma

TXT, JSON, PDF olarak indirme; tek tuşla kopyalama.

## 14. Arayüz ve PWA

Minimal, Dark/Light Mode, responsive, mobil öncelikli, ana ekrana eklenebilir, offline çalışır.

## 15. İçerik Yönetimi ve Format — Tam Birleşik JSON Şeması

```json
{
  "temaId": "tema-01-wohnen",
  "temaNo": 1,
  "baslik": "Wohnen",
  "handlungsfeld": "Wohnen",
  "kaynakEslesmeleri": [{ "kitap": "Die neue Linie B1", "kapitel": 3, "sayfa": "42-48" }],
  "kelime": [
    { "id": "t01-w001", "de": "die Wohnung", "tr": "daire", "beispiel": "Ich suche eine 2-Zimmer-Wohnung.", "kategori": "Nomen", "zorlukSeviyesi": "orta" }
  ],
  "gramer": [
    {
      "id": "t01-g001",
      "konu": "Präposition.lokal",
      "sprachhandlung": ["Informationsaustausch"],
      "soru": "Die Wohnung ist ___ dritten Stock.",
      "secenekler": ["im", "in", "am", "auf"],
      "dogruCevap": "im",
      "aciklama": "'im' = 'in dem'; kat bildirirken 'im dritten Stock' kullanılır.",
      "zorlukSeviyesi": "orta"
    }
  ],
  "lesen": { "metin": "...", "sorular": [{ "id": "t01-l001", "soru": "...", "cevapTipi": "acikUclu" }] },
  "hoeren": { "sesUrl": "assets/audio/t01-h001.mp3", "sesKaynagi": "kayit", "sorular": [{ "id": "t01-h001", "soru": "...", "secenekler": ["...", "..."], "dogruCevap": "..." }] },
  "schreiben": {
    "gorev": "Ihre Wohnung hat einen Wasserschaden. Schreiben Sie eine E-Mail an den Vermieter.",
    "register": "halbformell",
    "sprachhandlung": ["Handlungsregulierung", "Informationsaustausch"],
    "leitpunkte": ["Problem beschreiben", "Wann es passiert ist", "Was Sie erwarten", "Nach Terminvorschlag fragen"],
    "minKelime": 40,
    "maxKelime": 80
  },
  "sprechen": {
    "teil1FollowUp": { "frage": "Beschreiben Sie Ihre Wohnung.", "sprachhandlung": ["Informationsaustausch"] },
    "teil2": {
      "fotoUrl": "assets/fotos/tema01-wohnung.jpg",
      "beschreibungsPrompt": "Was sehen Sie auf dem Foto?",
      "vergleichsPrompt": "Wie wohnt man in Ihrem Heimatland?",
      "sprachhandlung": ["Informationsaustausch", "Umgang mit interkultureller Begegnung"]
    },
    "teil3": {
      "szenario": "Sie und Ihr Partner möchten zusammen eine Wohnung mieten. Einigen Sie sich, wer welche Aufgaben übernimmt.",
      "sprachhandlung": ["Handlungsregulierung"],
      "modus": "eşli-veya-simule",
      "cevapTipi": "yaziliCevap"
    }
  },
  "miniTest": { "soruIdListesi": ["t01-w001", "t01-g001", "t01-l001", "t01-h001"] }
}
```

**Temadan bağımsız, sabit dosyalar:** `redemittel-bank.json` (§7), `profil-tanitim.json` (Sprechen Teil 1 şablonu).

## 16. Modüler Yapı

Omurga: 11 Tema + Sprachhandlungen + Redemittel-Bank + Gramer Taksonomisi + Schreiben Rubriği + Sprechen 3-Parça Yapısı + Profil-Tanıtım Şablonu. Kitaplar (Die neue Linie B1, Schritte Plus Neu, Menschen, Aspekte Neu, TELC/Goethe Hazırlık...) bu yapıya `kaynakEslesmeleri` üzerinden içerik besleyen eklentilerdir; kod ve Tema yapısı hiçbir zaman değişmez.

## 17. Study Mode (Çalışma Modları)

| Mod | Açıklama | Sürüm |
|---|---|---|
| 📘 Tema Modu | Kelime→Gramer→Lesen→Hören→Schreiben→Sprechen→Mini Test, sıralama zorunlu değil | v1.0 |
| 📝 DTZ Sınav Modu | Tüm Temalardan derlenen, gerçek formatı taklit eden zamanlı deneme | v2.0 |
| 🎯 Zayıf Konular Modu | Tema + Sprachhandlung + Gramer taksonomisi eksenli Leitner tekrarı | v1.5 |
| 📅 21 Günlük Kamp | Sabit 21 günlük müfredat, 11 Temaya dağıtılmış | v1.5 |
| 🔥 Günlük 15 Dakika | %70 tekrar/%30 yeni, kural tabanlı, offline | v1.5 |
| 🧠 AI Koç Modu | Offline kural tabanlı orkestrasyon + online LLM kişiselleştirme | v3.0 |

## 18. AI Teacher Mode

Schreiben: resmi 4 kriterli rubrik + Leitpunkt kontrolü. Sprechen: global izlenim + analitik kriter kırılımı (v3.0), gerçek eşli pratik (v4.0). Redemittel-Bank kullanım eksikliğini tespit edip öneri sunma.

## 19. AI Bağımsız Mimari

Offline → Temalar, Redemittel-Bank, Profil-Tanıtım ve AI Koç hariç tüm modlar çalışır. Online → AI Teacher Mode ve AI Koç Modu aktifleşir.

## 20. Uzun Vadeli Vizyon

A1/A2/B1/B2/C1 seviyeleri, DTZ/Goethe/TELC/ÖSD sınavları modül olarak eklenecek — Tema-bazlı mimari buna hazır.

## 21. Gamification

Günlük hedefler, streak, rozetler, seviye puanları, haftalık grafikler, ödüller.

## 22. İstatistik Sistemi

Güçlü/zayıf Temalar, Sprachhandlungen ve Gramer kategorileri (ısı haritası olarak), kelime başarı oranı, yazma gelişimi.

## 23. Bildirim Sistemi

Günlük hatırlatma, haftalık tekrar, mini sınav zamanı, yeni görev bildirimi.

## 24. Gelecekte Eklenebilecek Özellikler

Telaffuz analizi, ses tanıma, konuşma partneri, AI sohbet modu, flashcard sistemi, kelime oyunu, haftalık canlı deneme, gerçek DTZ simülasyonu.

## 25. Geliştirme Yol Haritası

**v1.0 — Çalışan Temel Uygulama:** Dashboard (temel), ilk 2-3 Tema (Wohnen, Einkaufen, Gesundheit) tam yapıyla, form sistemi, LocalStorage, temel PWA, Tema Modu, Schreiben Leitpunkt-checklist, Sprechen Teil 1+2 (Teil 3 simüle partner ile).

**v1.5 — Akıllı Tekrar:** Konu+Sprachhandlung+Gramer bazlı hata kaydı, Zayıf Konular Modu, 21 Günlük Kamp, Günlük 15 Dakika, Redemittel-Bank, kalan Temalar.

**v2.0 — Akıllı Takip:** Gelişmiş istatistik, PDF/JSON dışa aktarma, DTZ Sınav Modu.

**v3.0 — AI Öğretmen:** Schreiben/Sprechen otomatik değerlendirme, AI soru üretimi, kişisel çalışma planı, AI Koç Modu.

**v4.0 — Tam Eğitim Platformu:** Çoklu kitap/sınav/seviye desteği, öğretmen paneli, bulut senkronizasyonu, çoklu cihaz desteği, gerçek eşli/online Sprechen Teil 3.

## 26. Projenin Temel İlkesi

Bir soru bankası değil; öğretmen, koç, yazma editörü, konuşma partneri, gramer öğretmeni, kelime koçu, ilerleme takip sistemi ve sınav danışmanı rollerini birleştiren, kaynaktan bağımsız, kişisel bir DTZ öğrenme ekosistemi.

## 27. Geliştirme Fikirleri — Gözden Geçirmen İçin

1. İçerik katkı şablonu (CSV/Sheets → JSON)
2. Yanlış cevap sebebi etiketleme
3. Güven puanı (confidence rating)
4. Ayarlanabilir sınav zamanlayıcı sıkılığı
5. Offline TTS fallback
6. Bölgesel varyant etiketi (Ämter/Behörden)
7. Anonim karşılaştırma/benchmark (v4.0+)
8. Sprachhandlung bazlı "işlev kartları"
9. Redemittel-Bank + AI Koç entegrasyonu
10. Gramer taksonomisi ısı haritası
11. Leitpunkt-checklist'in v1.0'a erken eklenmesi
12. Teil 3 için "simüle partner" metinleri

---

## Ek: Doğrulanmış DTZ Sınav Yapısı

Hören 20 soru/25 dk · Lesen 25 soru/45 dk · Puanlama: Hören+Lesen 45 soru üzerinden, 20/45=A2, 33/45=B1 · Schreiben 1 görev (3-4 Leitpunkt) · Sprechen eşli, ~10 dk/kişi, 3 aşama · Genel sonuç: Sprechen + en az bir yazılı bölüm B1 ise toplam B1.

## Kaynaklar

- Perlmann-Balme, M. (Goethe-Institut), Plassmann, S. & Zeidler, B. (telc): *Deutsch-Test für Zuwanderer A2–B1, Prüfungsziele, Testbeschreibung*, Cornelsen Verlag, 2009 — §1, §2, §6.4.1, §6.4.2, §8.1, §8.2, §8.3, §8.4
- [BAMF — DTZ Handbuch (PDF)](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/Modellsaetze/dtz-handbuch_pdf.pdf?__blob=publicationFile&v=8)
- [BAMF — Rahmencurriculum für Integrationskurse](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Integrationskurse/Kurstraeger/KonzepteLeitfaeden/rahmencurriculum-integrationskurs.html?nn=282388)

**Tamamen opsiyonel (istenirse ileride):** §7.1.2.4 Bewertung "Sprechen" (sayfa 80-82, Tabelle 3a) — Sprechen için Schreiben'e simetrik tam analitik kriterler.

---

## EK BÖLÜM: Claude Code Başlangıç Kiti

### Önerilen Proje Klasör Yapısı

```
dtz-b1-trainer/
├── PRD.md                          ← bu doküman
├── index.html
├── manifest.json                   ← PWA manifest
├── sw.js                           ← service worker (offline cache)
├── css/
│   └── style.css
├── js/
│   ├── app.js                      ← ana uygulama mantığı, router
│   ├── storage.js                  ← LocalStorage okuma/yazma yardımcıları
│   └── study-modes/
│       └── tema-modu.js            ← v1.0'ın tek Study Mode'u
├── content/
│   ├── temalar/
│   │   ├── tema-01-wohnen.json
│   │   ├── tema-09-einkaufen.json
│   │   └── tema-06-gesundheit.json
│   ├── redemittel-bank.json         ← v1.5'te dolduruluyor
│   └── profil-tanitim.json
└── assets/
    ├── audio/
    └── fotos/
```

### Kopyala-Yapıştır Hazır Başlangıç Promptu (Claude Code için)

```
Bu klasördeki PRD.md dosyasını oku. Bu dosyaya göre "DTZ B1 Trainer" adlı bir
Progressive Web App'in v1.0 kapsamını (§25 Geliştirme Yol Haritası) uygula:

1. Vanilla HTML/CSS/JS ile temel proje iskeletini kur (index.html, css/style.css,
   js/app.js, js/storage.js).
2. §15'teki JSON şemasına birebir uyan, içi örnek verilerle dolu bir
   content/temalar/tema-01-wohnen.json dosyası oluştur (gerçek DTZ içeriği
   sonradan eklenecek, şimdilik 2-3 örnek soru yeterli).
3. Tema Modu'nu (§17) çalışır hale getir: Kelime → Gramer → Lesen → Hören →
   Schreiben → Sprechen → Mini Test akışını, Wohnen temasıyla uçtan uca test
   edilebilir şekilde bağla.
4. Her cevabı LocalStorage'a otomatik kaydet (§11).
5. Temel bir PWA manifest.json ve basit bir service worker (sw.js) ekle,
   offline açılabilsin.
6. Şimdilik AI, istatistik, diğer Study Mode'lar YOK — sadece v1.0 kapsamı.

Bitirince nasıl test edebileceğimi (örn. hangi komutla local server açacağımı)
söyle.
```

Bu promptu Claude Code'a verdikten sonra gerçek Wohnen/Einkaufen/Gesundheit içeriğini (kelime listeleri, gramer soruları, okuma metinleri) — kitaptan ya da doğrudan DTZ formatına uygun yazarak — birlikte dolduracağız.
