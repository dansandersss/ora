import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'ora.sessionToken';

function getWebStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Web session storage is unavailable.');
  }
  return window.localStorage;
}

export const sessionStorage = {
  /** Reads the ORA session token from localStorage on web or encrypted SecureStore on native. */
  async getToken() {
    if (Platform.OS === 'web') return getWebStorage().getItem(SESSION_TOKEN_KEY);
    return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  },

  /** Persists only the opaque session token; credentials and PIN values are never stored here. */
  async setToken(token: string) {
    if (Platform.OS === 'web') {
      getWebStorage().setItem(SESSION_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  },

  /** Removes the current session token from the platform-appropriate storage provider. */
  async removeToken() {
    if (Platform.OS === 'web') {
      getWebStorage().removeItem(SESSION_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  },
};
