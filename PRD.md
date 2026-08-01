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

### 7.1 `redemittel-bank.json` JSON Şeması

Bu dosya bir Tema değildir, §15'teki Tema şemasına tabi olmadan kendi basit şemasını kullanır. `kategoriId` alanı sabit 3 değerden biridir (`redeorganisation`, `verstaendnissicherung`, `kompensation`) — kod bu ID'lere doğrudan referans verir, değiştirilemez/genişletilemez. Kategori sırası şema içinde bu 3 değerle sabittir.

```json
{
  "kategoriler": [
    {
      "kategoriId": "redeorganisation",
      "baslik": "Redeorganisation",
      "aciklama": "Söze başlama/bitirme, söz isteme/kesme, devam ettirme",
      "aciklamaEn": "Starting/ending a turn, asking for the floor, continuing",
      "ifadeler": [
        {
          "id": "rb-reor-001",
          "de": "Ich möchte noch etwas dazu sagen.",
          "tr": "Buna bir şey daha eklemek istiyorum.",
          "en": "I would like to add something to that.",
          "kullanim": "Söz almak / devam ettirmek istediğinde",
          "kullanimEn": "When you want to take or keep the floor"
        }
      ]
    },
    {
      "kategoriId": "verstaendnissicherung",
      "baslik": "Verständnissicherung",
      "aciklama": "Anlaşılmayı kontrol etme, tekrar/yavaşlatma isteme, heceletme, teyit etme",
      "aciklamaEn": "Checking understanding, asking for repetition/slower speech, spelling, confirming",
      "ifadeler": [ { "id": "rb-vers-001", "de": "...", "tr": "...", "en": "...", "kullanim": "...", "kullanimEn": "..." } ]
    },
    {
      "kategoriId": "kompensation",
      "baslik": "Kompensation",
      "aciklama": "Kelime bilmediğinde tanımlayarak anlatma, kendini düzeltme, genel ifade kullanma",
      "aciklamaEn": "Describing around an unknown word, self-correcting, using vague expressions",
      "ifadeler": [ { "id": "rb-komp-001", "de": "...", "tr": "...", "en": "...", "kullanim": "...", "kullanimEn": "..." } ]
    }
  ]
}
```

Her `ifadeler[]` maddesi 4 alan zorunludur: `id` (`rb-<kategori-kısaltması>-<3hane>` formatında; kısaltmalar `reor`/`vers`/`komp`), `de` (Almanca ifade), `tr` (Türkçe çevirisi), `kullanim` (ifadenin ne zaman/hangi bağlamda kullanılacağını açıklayan kısa Türkçe not). `id` alanı v2.0'da bireysel ifade bazlı istatistik/tekrar takibi için ileriye dönük genişletilebilirlik amacıyla eklenmiştir. **v1.5 eki:** `en` (`tr`'nin İngilizce karşılığı) ve `kullanimEn` (`kullanim`'ın İngilizce karşılığı) alanları eklemeli olarak eklenir; `kategoriler[].aciklama` için de aynı şekilde `aciklamaEn` eklenir — bkz. §15.1.

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
    { "id": "t01-w001", "de": "die Wohnung", "tr": "daire", "en": "apartment", "beispiel": "Ich suche eine 2-Zimmer-Wohnung.", "kategori": "Nomen", "zorlukSeviyesi": "orta" }
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
      "aciklamaEn": "'im' = 'in dem'; used when stating a floor, e.g. 'im dritten Stock'.",
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

### 15.1 Çok Dilli Arayüz İçin İçerik Alanları (v1.5)

Uygulama, arayüz/çeviri dili olarak `js/i18n.js`'teki `LANGUAGES` listesinde tanımlı diller arasında geçiş yapabilir (bkz. §17). Taban dil (`BASE_LANG`) Türkçe'dir — mevcut `tr`/`aciklama`/`kullanim` gibi alanlar hep taban dili taşır, hiçbir zaman değiştirilmez veya yeniden adlandırılmaz. `LANGUAGES` listesine yeni bir dil eklendiğinde (örn. `en`), o dile ait alanlar **eklemeli** olarak konur: taban alan `tr`'nin karşılığı doğrudan o dilin kodudur (`kelime[].en`), `aciklama`/`kullanim` gibi diğer alanların karşılığı `<alan><Dil>` formatındadır (örn. `gramer[].aciklamaEn`, Redemittel-Bank `ifadeler[].kullanimEn`). Kod tarafında `I18n.contentField(obj, key)` bu eşlemeyi `LANGUAGES`'tan bağımsız, genel bir kuralla çözer — yeni bir dil eklenince bu fonksiyonda değişiklik gerekmez, sadece içerik dosyalarına yeni alanlar eklenir.

**Kesin kural:** `de` hiçbir zaman bir arayüz/çeviri dili olamaz — Almanca öğretilen dildir, `kelime[].de` zaten hedef kelime alanı olarak kullanılıyor; bu alanla çakışacağı ve kavramsal olarak anlamsız olacağı için `LANGUAGES` listesine eklenmez.

Lesen/Hören/Schreiben/Sprechen içindeki Almanca metinler (soru, metin, transkript, görev, Leitpunkt'ler) bu kapsamın tamamen dışındadır — onlar sınavın kendisi, arayüz dilinden bağımsız olarak her zaman Almanca kalır.

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

### 17.1 `kamp-21-gun.json` JSON Şeması

Bu dosya bir Tema değildir, §15'teki Tema şemasına tabi olmadan kendi basit şemasını kullanır. 21 Günlük Kamp, tek bir `content/kamp-21-gun.json` dosyasında tanımlanan sabit bir müfredattır; her gün ya mevcut bir Tema'daki gerçek soruya işaret eden (`tur:"referans"`) ya da kampa özgü yeni bir soru taşıyan (`tur:"ozel"`) görevlerden oluşur. `tur:"ozel"` görevler, `adimTipi`'ne göre §15'teki ilgili Tema alt-şemasıyla (kelime/gramer/lesen/hoeren/schreiben/sprechen) birebir aynı alan setini taşır — böylece mevcut SoruKart bileşeni hiçbir özel durum kodu olmadan hem Tema Modu'nda hem Kamp'ta aynı şekilde çalışır. `adimTipi:"tekrar"` özel bir durumdur, önceki günlerden seçilmiş bir `referans` görev kümesini tekrar sunar.

```json
{
  "kampId": "kamp-21-gun",
  "baslik": "21 Günlük Kamp",
  "gunler": [
    {
      "gunNo": 1,
      "baslik": "Gün 1 — Wohnen'e Giriş",
      "odakTemalar": ["tema-01-wohnen"],
      "gorevler": [
        {
          "id": "kamp-g01-ref-001",
          "tur": "referans",
          "adimTipi": "kelime",
          "temaId": "tema-01-wohnen",
          "soruId": "t01-w001"
        },
        {
          "id": "kamp-g01-oz-001",
          "tur": "ozel",
          "adimTipi": "gramer",
          "soru": "...",
          "secenekler": ["...", "...", "...", "..."],
          "dogruCevap": "...",
          "konu": "Verb.Tempus.Perfekt",
          "sprachhandlung": ["Informationsaustausch"],
          "aciklama": "...",
          "aciklamaEn": "..."
        }
      ]
    }
  ]
}
```

Her `gunler[]` maddesi `gunNo` (1-21), `baslik`, `odakTemalar` (o güne ait `temaId` listesi, Faz 3'te boş olabilir) ve `gorevler[]` alanlarını zorunlu taşır. `gorevler[]` içindeki her madde önce ortak `id`/`tur`/`adimTipi` alanlarını, sonra `tur`'a göre değişen alan setini içerir:

- **`tur:"referans"`** — sadece `temaId` ve `soruId` taşır, yeni içerik üretmez; ilgili Tema JSON'undaki gerçek soru nesnesine işaret eder (`temaId` §15'teki `temaId`, `soruId` o Tema'nın `kelime[].id`/`gramer[].id`/`lesen.sorular[].id`/`hoeren.sorular[].id` gibi alanlarından biri olmalı).
- **`tur:"ozel"`** — `adimTipi`'ne göre §15'teki ilgili alt-şemanın alanlarını birebir taşır: `adimTipi:"gramer"` için `soru/secenekler/dogruCevap/konu/sprachhandlung/aciklama/aciklamaEn/zorlukSeviyesi`, `adimTipi:"kelime"` için `de/tr/en/beispiel/kategori/zorlukSeviyesi`, `adimTipi:"lesen"` için `metin/sorular[]`, `adimTipi:"hoeren"` için `sesUrl/transkript/sorular[]`, `adimTipi:"schreiben"` için `gorev/register/sprachhandlung/leitpunkte/minKelime/maxKelime`, `adimTipi:"sprechen"` için `teil1FollowUp`/`teil2`/`teil3` alt kümesinden ilgili olanı. `konu` etiketi (gramer görevlerinde) §8.4 taksonomisine uyar, `sprachhandlung` §8.2 listesinden seçilir — bu kural referans/özel ayrımından bağımsız her zaman geçerlidir.
- **`id` önek kuralı:** `kamp-g<gunNo-2hane>-oz-<sıraNo-3hane>` (özel görevler) / `kamp-g<gunNo-2hane>-ref-<sıraNo-3hane>` (referans görevler) — örn. `kamp-g01-ref-001`, `kamp-g12-oz-002`.

**21 günlük dağılım (3 faz):**

- **Faz 1 (Gün 1-11) — Tema Tanıtımı:** Her gün tek bir Handlungsfeld'e odaklanır (`odakTemalar` tek elemanlı), görev karışımı %70 referans / %30 özel. Gün 2'den itibaren her günün başına önceki günden küçük bir `adimTipi:"tekrar"` görev bloğu eklenir.
- **Faz 2 (Gün 12-18) — Çapraz Pekiştirme:** Karışık mikro-dersler, görev karışımı özel görev ağırlıklı (gün başına 1 referans + 3 özel görev, ~%25 referans/%75 özel). Gün 12=Tema1+2, Gün13=Tema3+4, Gün14=Tema5+6, Gün15=Tema7+8, Gün16=Tema9+10, Gün17=Tema11 + genel Sprachhandlung tekrarı, Gün18=tüm Temalardan serbest karma + 1 özel Schreiben mikro-görevi.
- **Faz 3 (Gün 19-21) — Sınav ve Kapanış:** Gün19=Kamp Mini Sınav 1 (Gramer+Hören karışık, tamamı `tur:"ozel"` veya karışık), Gün20=Kamp Mini Sınav 2 (Lesen+Schreiben+Sprechen odaklı), Gün21="Mezuniyet Günü" — `gorevler[]` boş veya sadece özet ekranına işaret eden bir meta görev içerir; yeni soru yoktur, sadece istatistik+tebrik gösterilir.

**Self-paced unlock kuralı:** Günler takvime kilitli değildir. Bir sonraki gün, mevcut gün tamamlanır tamamlanmaz açılır. "Açık gün" ayrı bir state olarak saklanmaz — tamamlanan günler listesinden türetilir (tek doğruluk kaynağı ilkesi, bkz. §12).

**Storage etkisi (özet — detay `js/storage.js`'te):** `data.kamp.gunIlerleme[gunNo] = { tamamlananGorevler: [], tamamlandiMi: bool }` mevcut `answers`/`progress`/Leitner şemasına dokunmayan, izole yeni bir alandır. Özel (`tur:"ozel"`) görevlerin cevapları `"kamp-21-gun"` pseudo-namespace'i altında saklanır; referans (`tur:"referans"`) görevlerin cevapları ise orijinal `temaId` altında saklanır — böylece aynı soruyla kullanıcı Tema Modu'nda tekrar karşılaştığında ilerleme senkron kalır.

**Bilinen sınırlama (v1.6+ takip maddesi):** Kampa özel (`tur:"ozel"`) sorular, v1.5 itibarıyla Zayıf Konular Modu'nun Leitner tekrar havuzuna dahil değildir.

### 17.2 Günlük 15 Dakika — Seçim Algoritması

Bu mod için ayrı bir content JSON'u YOKTUR. Mevcut 11 Tema'nın `gramer[]` + `hoeren.sorular[]` havuzu (Zayıf Konular Modu'nun kullandığı aynı havuz) ile Leitner verisini (`Storage.getLeitnerEntry`) orkestre eden saf bir seçim algoritmasıdır. Sabit oturum boyutu **10 soru = 7 tekrar + 3 yeni**.

- **Tekrar havuzu:** `Storage.getLeitnerEntry(q.id)` mevcut VE `entry.dueAt <= Date.now()` olan sorular. Kutu no artan, ardından `dueAt` artan sıraya göre önceliklendirilir — en zayıf/en geciken soru önce gelir.
- **Yeni havuzu:** `Storage.getLeitnerEntry(q.id)` HİÇ mevcut olmayan (yani hiç cevaplanmamış) sorular. `Storage.isLeitnerDue` burada KULLANILMAZ — o fonksiyon "hiç cevaplanmamış" ile "süresi gelmiş"i aynı kefeye koyar (`!entry || entry.dueAt <= now`), Günlük 15 Dakika'da bu iki durumun ayrıştırılması gerekir. Yeni havuzda seçim öncesi Fisher-Yates ile karıştırma uygulanır, aksi halde her oturumda temaların sırasına göre hep aynı sorular gelir.
- **Fallback kuralı:** tekrar havuzu 7'den azsa eksik kadar yeni havuzdan tamamlanır; yeni havuz 3'ten azsa eksik kadar tekrar havuzundan tamamlanır (çapraz doldurma). İki havuz toplamı 10'dan azsa daha küçük bir set gösterilir (soru uydurulmaz). İki havuz da boşsa bir "boş durum" ekranı gösterilir.
- Takvim/tarih state'i yoktur — günde istediği kadar başlatılabilir, "bugün yapıldı mı" diye bir kilit yoktur; oturum bitince kullanıcı aynı ekrandan taze bir set ile yeniden başlatabilir.
- Yeni bir storage alanı gerekmez — mevcut `recordLeitnerResult`/`saveAnswer` (SoruKart üzerinden) yeterlidir.

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
