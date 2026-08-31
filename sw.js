const CACHE_NAME = 'moddaker-v1';
const ASSETS_TO_CACHE = [
    './index.htm',
    './style.css',
    './app.js',
    './manifest.json'
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// تشغيل التطبيق من التخزين المؤقت عند عدم وجود إنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});