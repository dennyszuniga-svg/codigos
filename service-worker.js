const CACHE_NAME = 'codigos-urbapark-v188';
const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './assets/xlsx.full.min.js',
    './assets/pdf-lib.min.js',
    './assets/jszip.min.js',
    './assets/reporte-checklist-por-sede.xlsx',
    './assets/pptxgen.min.js',
    './informe-incidentes.html',
    './informe-incidentes.css',
    './informe-incidentes.js',
    './mantenimiento-control.html',
    './mantenimiento-control.css',
    './mantenimiento-control.js',
    './asistencia.html',
    './asistencia.css',
    './asistencia-status.css',
    './asistencia.js',
    './encuesta.html',
    './encuesta.css',
    './encuesta.js',
    './gdh.html',
    './gdh.css',
    './gdh-media.css',
    './gdh-expedientes.css',
    './gdh-evaluaciones.css',
    './gdh-evaluaciones.js',
    './gdh.js',
    './manifest.webmanifest',
    './assets/urbapark-logo.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    // Version liviana (1200px, ~334KB en total). Los PNG originales a 1586px
    // se piden solo al abrir la vista ampliada y quedan en cache de runtime.
    './assets/codigo-rojo.webp',
    './assets/codigo-naranja.webp',
    './assets/codigo-3d.webp',
    './assets/codigo-cat.webp',
    './assets/codigo-verde.webp',
    './assets/codigo-croc.webp',
    './assets/codigo-adam.webp',
    './assets/codigo-calma.webp',
    './assets/codigo-capta.webp'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === 'navigate') {
        const fallback = requestUrl.pathname.endsWith('/informe-incidentes.html')
            ? './informe-incidentes.html'
            : requestUrl.pathname.endsWith('/encuesta.html')
            ? './encuesta.html'
            : './index.html';
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request).then(response => response || caches.match(fallback)))
        );
        return;
    }

    const recursoActualizable = ['script', 'style'].includes(event.request.destination);

    if (recursoActualizable) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    return response;
                })
            )
            .catch(() => caches.match('./index.html'))
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const modulo = event.notification.data?.module;
    const destino = modulo ? `./?module=${encodeURIComponent(modulo)}` : './';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                const appClient = clientList.find(client => client.url.startsWith(self.location.origin));

                if (appClient) {
                    return appClient.navigate(destino).then(() => appClient.focus());
                }

                return clients.openWindow(destino);
            })
    );
});

self.addEventListener('push', event => {
    let data = {};

    try {
        data = event.data ? event.data.json() : {};
    } catch (_error) {
        data = {
            title: 'Codigo activado',
            body: event.data ? event.data.text() : 'Revisa la app de Codigos de Emergencia.'
        };
    }

    const title = data.title || 'Codigo activado';
    const options = {
        body: data.body || 'Revisa el checklist operativo.',
        icon: 'assets/icons/icon-192.png',
        badge: 'assets/icons/icon-192.png',
        tag: data.tag || 'codigo-activado',
        renotify: true,
        requireInteraction: true,
        vibrate: [300, 120, 300, 120, 500],
        data: data.data || {}
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
