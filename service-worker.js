const CACHE_NAME = 'codigos-urbapark-v88';
const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './script.js',
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
    './manifest.webmanifest',
    './assets/urbapark-logo.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/codigo-rojo.png',
    './assets/codigo-naranja.png',
    './assets/codigo-3d.png',
    './assets/codigo-cat.png',
    './assets/codigo-verde.png',
    './assets/codigo-croc.png',
    './assets/codigo-adam.png',
    './assets/codigo-calma.png',
    './assets/codigo-capta.png'
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
            .then(() => self.clients.matchAll({ type: 'window' }))
            .then(clientList => Promise.all(
                clientList.map(client => client.navigate(client.url).catch(() => null))
            ))
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
                const appClient = clientList.find(client => client.url.includes('/codigos/'));

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
