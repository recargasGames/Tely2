const CACHE_NAME = 'mi-cine-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/peliculas.html',
    '/series.html',
    '/mi-lista.html',
    '/perfil.html',
    '/reproductor.html',
    '/login.html',
    '/registro.html',
    '/css/styles.css',
    '/css/player.css',
    '/js/firebase-config.js',
    '/js/auth.js',
    '/js/tmdb-api.js',
    '/js/database.js',
    '/js/player.js',
    '/js/recommendations.js'
];

// Instalación
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache abierto');
                return cache.addAll(ASSETS);
            })
    );
});

// Activación
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});
