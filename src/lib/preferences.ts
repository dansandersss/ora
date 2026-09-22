import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'ora.preferences';

export type OraPreferences = {
  hapticsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  notificationSoundEnabled: boolean;
  sessionAlertsEnabled: boolean;
};

export const defaultOraPreferences: OraPreferences = {
  hapticsEnabled: true,
  inAppNotificationsEnabled: true,
  notificationSoundEnabled: true,
  sessionAlertsEnabled: true,
};

export async function getOraPreferences(): Promise<OraPreferences> {
  const stored = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultOraPreferences;
  try { return { ...defaultOraPreferences, ...JSON.parse(stored) as Partial<OraPreferences> }; }
  catch { return defaultOraPreferences; }
}

export function saveOraPreferences(preferences: OraPreferences) {
  return AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
}
