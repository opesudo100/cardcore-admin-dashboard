/**
 * Session & Storage Management Service
 * 
 * This service is decoupled from ApiService to prevent circular dependencies.
 */

// Internal private reference for storage singleton instance
let secureStorage: any = null;

/**
 * Lazy-initializes EncryptStorage dynamically strictly inside the client context.
 */
const getStorage = (): any => {
  if (typeof window !== 'undefined') {
    if (!secureStorage) {
      try {
        const { EncryptStorage } = require('encrypt-storage');
        secureStorage = new EncryptStorage(
          process.env.NEXT_PUBLIC_PRIVATE_KEY || 'fallback-secure-key-32-chars-minimum',
          {
            prefix: '@core',
            storageType: 'sessionStorage',
          }
        );
      } catch (err) {
        console.error('Failed to initialize EncryptStorage:', err);
        return null;
      }
    }
    return secureStorage;
  }
  return null;
};

export class SessionService {
  /**
   * Retrieves data from encrypted session storage.
   */
  public static getStorageData(key: string): any {
    const storage = getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(key) ?? null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Saves data to encrypted session storage.
   */
  public static saveStorageData(key: string, value: any): void {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(key, value);
      } catch (err) {
        console.error(`Failed to save storage data for key ${key}:`, err);
      }
    }
  }

  /**
   * Clears all session data and redirects to login.
   */
  public static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear common session cookie keys by backdating them
      const authCookies = ['token', 'session', 'auth_token', 'accessToken', 'secret'];
      authCookies.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      });

      // Only redirect if we are not already on the login page to avoid infinite reloads
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
}
