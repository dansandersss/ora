export type NotificationReturnRoute = '/home' | '/sessions' | '/profile';

let notificationReturnRoute: NotificationReturnRoute = '/home';

export function setNotificationReturnRoute(route: NotificationReturnRoute) {
  notificationReturnRoute = route;
}

export function consumeNotificationReturnRoute() {
  const route = notificationReturnRoute;
  notificationReturnRoute = '/home';
  return route;
}
