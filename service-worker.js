const CACHE_NAME = "pallet-scanner-v3"; // Increment version to ensure update
const urlsToCache = [
  "/", // Caches the root URL
  "/index.html", // Your main app file
  "/manifest.json", // The manifest file itself
  "/novo_logo_(bug).png", // Your app icon for home screen
  "/novo_logo_(vertical).png" // Your logo displayed in the app
  // No /script.js or /styles.css needed as they are inline in your index.html
];

// Install event: Caches the app's essential assets
self.addEventListener("install", (event) => {
  console.log('Service Worker: Install event triggered. Caching static assets.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Caching failed during install', error);
      })
  );
});

// Fetch event: Serve cached assets when offline. For network requests (POST), try network first.
self.addEventListener("fetch", (event) => {
  // For navigation requests (loading a page), try cache first.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
        .catch(error => {
          console.error('Service Worker: Fetch failed for navigation', error);
          // You could return a custom offline page here
        })
    );
  } else {
    // For other requests (like API calls via fetch, which are critical POSTs),
    // we generally want to try the network first for fresh data,
    // unless you're implementing advanced background sync/offline data storage.
    // For your POST requests, we'll let them hit the network and fail if offline,
    // as the app client-side logic handles the "Failed to send data" message.
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request)) // Fallback to cache if network fails
    );
  }
});

// Activate event: Clean up old caches to save space
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event triggered. Cleaning old caches.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});