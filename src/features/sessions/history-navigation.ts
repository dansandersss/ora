export type SessionHistoryReturnRoute = 'profile' | 'sessions';

let sessionHistoryReturnRoute: SessionHistoryReturnRoute = 'sessions';

export function setSessionHistoryReturnRoute(route: SessionHistoryReturnRoute) {
  sessionHistoryReturnRoute = route;
}

export function consumeSessionHistoryReturnRoute() {
  const route = sessionHistoryReturnRoute;
  sessionHistoryReturnRoute = 'sessions';
  return route;
}
