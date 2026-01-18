// Service Worker para PWA - Funciona offline
const CACHE_NAME = 'taberna-tapper-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './game.js',
  './manifest.json',
  './sprite/taberna.png',
  './sprite/barwoman/barwoman_00.png',
  './sprite/barwoman/barwoman_01.png',
  './sprite/barwoman/barwoman_02.png',
  './sprite/barwoman/barwoman_03.png',
  './sprite/barwoman/barwoman_04.png',
  './sprite/barwoman/barwoman_05.png',
  './sprite/barwoman/barwoman_06.png',
  './sprite/barwoman/barwoman_07.png',
  './sprite/barwoman/barwoman_08.png',
  './sprite/barwoman/barwoman_09.png',
  './sprite/elf/elf_00.png',
  './sprite/elf/elf_01.png',
  './sprite/elf/elf_02.png',
  './sprite/elf/elf_03.png',
  './sprite/elf/elf_04.png',
  './sprite/elf/elf_05.png',
  './sprite/elf/elf_06.png',
  './sprite/elf/elf_07.png',
  './sprite/elf/elf_08.png',
  './sprite/elf/elf_09.png',
  './sprite/rogue/rogue_00.png',
  './sprite/rogue/rogue_01.png',
  './sprite/rogue/rogue_02.png',
  './sprite/rogue/rogue_03.png',
  './sprite/rogue/rogue_04.png',
  './sprite/rogue/rogue_05.png',
  './sprite/rogue/rogue_06.png',
  './sprite/rogue/rogue_07.png',
  './sprite/rogue/rogue_08.png',
  './sprite/rogue/rogue_09.png',
  './sprite/dwarves/dwarves_00.png',
  './sprite/dwarves/dwarves_01.png',
  './sprite/dwarves/dwarves_02.png'
];

// Instalar e cachear arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Servir do cache quando offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Limpar cache antigo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
