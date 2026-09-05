const CACHE_NAME = 'moddaker-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.htm',
    './style.css',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('تم فتح التخزين المؤقت');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('تم تثبيت Service Worker');
                return self.skipWaiting();
            })
    );
});

// تنشيط الـ Service Worker وتنظيف التخزين القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('تم حذف التخزين القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('تم تنشيط Service Worker');
            return self.clients.claim();
        })
    );
});

// تشغيل التطبيق من التخزين المؤقت عند عدم وجود إنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إذا وجد الملف في التخزين المؤقت، أعده
                if (response) {
                    return response;
                }
                
                // وإلا، قم بتحميله من الشبكة
                return fetch(event.request)
                    .then((response) => {
                        // تحقق من صحة الرد
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // نسخ الرد وتخزينه
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // إذا كان الملف غير موجود وليس لدينا إنترنت
                        // يمكن عرض صفحة مخصصة للخطأ
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.htm');
                        }
                    });
            })
    );
});