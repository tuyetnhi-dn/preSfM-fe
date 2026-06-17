export function requestBrowserNotificationPermission() {
  if (typeof window === "undefined") return;

  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined") return;

  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
  }
}
