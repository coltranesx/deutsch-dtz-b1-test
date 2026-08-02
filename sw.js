const CACHE_NAME = "dtz-b1-trainer-v13";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/storage.js",
  "./js/i18n.js",
  "./js/study-modes/karistirma-yardimci.js",
  "./js/components/soru-kart.js",
  "./js/components/redemittel-bank.js",
  "./js/components/istatistik-ekrani.js",
  "./js/components/disa-aktarma.js",
  "./js/study-modes/soru-havuzu-yardimci.js",
  "./js/study-modes/istatistik-yardimci.js",
  "./js/study-modes/disa-aktarma-yardimci.js",
  "./js/study-modes/sinav-sayaci-yardimci.js",
  "./js/study-modes/tema-modu.js",
  "./js/study-modes/zayif-konular-modu.js",
  "./js/study-modes/kamp-21-gun.js",
  "./js/study-modes/gunluk-15-dakika.js",
  "./js/study-modes/dtz-sinav-modu.js",
  "./content/redemittel-bank.json",
  "./content/kamp-21-gun.json",
  "./content/temalar/tema-01-wohnen.json",
  "./content/temalar/tema-02-arbeit.json",
  "./content/temalar/tema-03-arbeitssuche.json",
  "./content/temalar/tema-04-mediennutzung.json",
  "./content/temalar/tema-05-mobilitaet.json",
  "./content/temalar/tema-06-gesundheit.json",
  "./content/temalar/tema-07-ausbildung.json",
  "./content/temalar/tema-08-kinderbetreuung.json",
  "./content/temalar/tema-09-einkaufen.json",
  "./content/temalar/tema-10-behoerden.json",
  "./content/temalar/tema-11-banken.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => cached);
    })
  );
});
