// Service worker — ದಿನದ ಮಾಹಿತಿ ಪುಟ
// ಪುಟ ಮತ್ತು ಐಕಾನ್‌ಗಳನ್ನು ಉಳಿಸಿಕೊಳ್ಳುತ್ತದೆ (ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ತೆರೆಯುತ್ತದೆ).
// ಶೀಟ್/ಸ್ಕ್ರಿಪ್ಟ್ ಡೇಟಾವನ್ನು ಎಂದೂ ಕ್ಯಾಶ್ ಮಾಡುವುದಿಲ್ಲ — ಯಾವಾಗಲೂ ಹೊಸದನ್ನೇ ತರುತ್ತದೆ.
const CACHE = "mdm-data-kusugal-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Google ಡೇಟಾ ಇತ್ಯಾದಿ — ನೇರವಾಗಿ ನೆಟ್‌ವರ್ಕ್‌ಗೆ

  // ಮೊದಲು ನೆಟ್‌ವರ್ಕ್ (ಹೊಸ ಆವೃತ್ತಿ ತಕ್ಷಣ ಬರಲು), ಸಾಧ್ಯವಾಗದಿದ್ದರೆ ಕ್ಯಾಶ್
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
