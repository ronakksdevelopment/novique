/* ============================================
   NOVIQUE — SERVICE WORKER
   Registered by assets/js/shell.js on every page.

   Strategy:
   - APP SHELL (own HTML/CSS/JS/manifest/icons): precached on
     install, served cache-first so the whole site works offline
     after a single visit.
   - THIRD-PARTY ASSETS (Google Fonts, Font Awesome, Spline,
     Unsplash/randomuser photos): not known ahead of time and not
     safe to hardcode (URLs/query params vary), so they're cached
     opportunistically with a stale-while-revalidate strategy —
     first visit fetches from network and stores a copy; every
     visit after that serves the cached copy instantly while
     quietly refreshing it in the background. That means a page
     someone has already viewed once will keep showing its fonts,
     icons and images offline; a page never visited before will
     still render (from the precached shell) but any images on it
     that were never fetched will show broken until back online —
     there's no way around that for content the browser has never
     downloaded.
   - Bump CACHE_VERSION whenever any precached file changes, so
     returning visitors get the update instead of a stale cache.
   ============================================ */
'use strict';

var CACHE_VERSION = 'v3';
var SHELL_CACHE = 'novique-shell-' + CACHE_VERSION;
var RUNTIME_CACHE = 'novique-runtime-' + CACHE_VERSION;

/* Every same-origin file the app needs to be fully usable offline.
   Paths are relative to the service worker's own scope (site root). */
var SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './robots.txt',
  './sitemap.xml',
  './assets/css/style.css',
  './assets/css/shell.css',
  './assets/js/main.js',
  './assets/js/shell.js',
  './assets/js/nova-chatbot.js',
  './assets/js/doodle-cursor.js',
  './favicon/favicon.ico',
  './favicon/favicon.png',
  './favicon/favicon-16x16.png',
  './favicon/favicon-32x32.png',
  './favicon/apple-touch-icon.png',
  './favicon/android-chrome-192x192.png',
  './favicon/android-chrome-512x512.png',
  './favicon/maskable-icon-192x192.png',
  './favicon/maskable-icon-512x512.png',
  './assets/images/logo.png',
  './assets/images/banner.png',
  './assets/images/banner-og.png',
  './pages/services.html',
  './pages/portfolio.html',
  './pages/pricing.html',
  './pages/process.html',
  './pages/about.html',
  './pages/reviews.html',
  './pages/faq.html',
  './pages/members.html',
  './pages/store.html',
  './pages/contact.html'
];

/* Hosts we're willing to runtime-cache. Keeps the SW from trying to
   (and failing to) cache things like the Nova/OpenRouter API calls,
   which must always hit the network live. */
var RUNTIME_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'unpkg.com',
  'prod.spline.design',
  'images.unsplash.com',
  'randomuser.me',
  'i.ibb.co'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      // addAll fails the whole install if even one request 404s, so
      // fetch individually and keep going on the rest — a missing
      // icon shouldn't block the app shell from being cached at all.
      return Promise.all(
        SHELL_ASSETS.map(function(url){
          return cache.add(url).catch(function(err){
            console.warn('[NoviQue SW] Failed to precache', url, err);
          });
        })
      );
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){
          return key !== SHELL_CACHE && key !== RUNTIME_CACHE;
        }).map(function(key){
          return caches.delete(key);
        })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

function isRuntimeHost(url){
  for(var i = 0; i < RUNTIME_HOSTS.length; i++){
    if(url.hostname.indexOf(RUNTIME_HOSTS[i]) !== -1) return true;
  }
  return false;
}

/* Cache-first for the app shell: instant loads, always available
   offline, refreshed only when CACHE_VERSION changes. */
function handleShellRequest(request){
  return caches.match(request).then(function(cached){
    if(cached) return cached;
    return fetch(request).then(function(response){
      if(response && response.ok){
        var copy = response.clone();
        caches.open(SHELL_CACHE).then(function(cache){ cache.put(request, copy); });
      }
      return response;
    });
  });
}

/* Stale-while-revalidate for third-party assets: serve the cached
   copy immediately if there is one (fast, works offline after the
   first successful fetch), and always try the network in the
   background to keep the cache fresh for next time. */
function handleRuntimeRequest(request){
  return caches.open(RUNTIME_CACHE).then(function(cache){
    return cache.match(request).then(function(cached){
      var networkFetch = fetch(request).then(function(response){
        if(response && response.ok){
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function(){
        // Offline and nothing cached for this asset yet — nothing more
        // we can do; let the caller's own .catch/onerror handle it
        // (fonts/icons/images already degrade gracefully in this site).
        return cached;
      });
      return cached || networkFetch;
    });
  });
}

self.addEventListener('fetch', function(event){
  var request = event.request;
  if(request.method !== 'GET') return;

  var url = new URL(request.url);

  // Never intercept the Nova chatbot's live API calls or anything
  // cross-origin that isn't one of the known static-asset hosts.
  if(url.origin === self.location.origin){
    event.respondWith(handleShellRequest(request));
    return;
  }

  if(isRuntimeHost(url)){
    event.respondWith(handleRuntimeRequest(request));
  }
  // Everything else (e.g. openrouter.ai chat completions) passes
  // straight through to the network, untouched.
});
