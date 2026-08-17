self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = {};
  }

  const title =
    data.title || "JobMitra AI 🔴";

  const options = {
    body:
      data.body ||
      "New JobMitra AI update is available.",
    icon:
      data.icon ||
      "./icon-192.png",
    badge:
      data.badge ||
      "./icon-192.png",
    data: {
      url:
        data.url ||
        "./"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );

});

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./";

    event.waitUntil(
      clients.matchAll({
        type:"window",
        includeUncontrolled:true
      }).then(clientList => {

        for(const client of clientList){

          if("focus" in client){

            client.navigate(url);
            return client.focus();

          }

        }

        if(clients.openWindow){

          return clients.openWindow(url);

        }

      })
    );

  }
);
