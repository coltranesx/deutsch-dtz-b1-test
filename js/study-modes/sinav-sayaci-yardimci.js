const SinavSayaciYardimci = (() => {
  // Saf zaman hesaplama yardımcısı — Storage'a/DOM'a bağımlı değildir.
  // DTZ Sınav Modu'nun (§17.3) "deadline timestamp'inden hesaplanan sayaç"
  // ilkesini uygular: sayfa yenilense/dashboard'a çıkılıp dönülse bile
  // `remainingMs(deadline)` her zaman doğru kalan süreyi verir.

  function createDeadline(durationMs) {
    return Date.now() + durationMs;
  }

  function remainingMs(deadline) {
    return Math.max(0, deadline - Date.now());
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // ms -> "MM:SS" (pad'li).
  function formatRemaining(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad2(minutes)}:${pad2(seconds)}`;
  }

  return { createDeadline, remainingMs, formatRemaining };
})();
