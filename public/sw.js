// AfterMe Service Worker for Push Notifications
const CACHE_NAME = "afterme-v1";
const OFFLINE_URL = "/offline";

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/offline",
        "/favicon.svg",
      ]).catch((error) => {
        console.log("[SW] Cache addAll failed:", error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Push notification received
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let data = {
    title: "AfterMe",
    body: "You have a new notification",
    icon: "/favicon.svg",
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      console.error("[SW] Error parsing push data:", error);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.svg",
    badge: data.badge || "/favicon.svg",
    tag: data.tag || "default",
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  let targetUrl = "/dashboard";

  if (action) {
    switch (action) {
      case "taken":
        targetUrl = "/dashboard/eldercare";
        break;
      case "snooze":
        return;
      case "check-in":
        targetUrl = "/dashboard/eldercare";
        break;
      case "call":
        targetUrl = "/dashboard/family";
        break;
      case "review":
        targetUrl = notificationData.url || "/dashboard/legacy";
        break;
      case "respond":
        targetUrl = "/dashboard/settings";
        break;
      default:
        targetUrl = notificationData.url || "/dashboard";
    }
  } else if (notificationData.url) {
    targetUrl = notificationData.url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Notification close handler
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-memories") {
    event.waitUntil(syncMemories());
  }
});

async function syncMemories() {
  console.log("[SW] Syncing memories...");
}

// Fetch handler - network first, fall back to cache
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});
