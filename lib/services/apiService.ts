import { SessionService } from './sessionService';
import { LoaderService } from './loaderService';
import { toast } from 'react-hot-toast';

export class ApiService {
  /**
   * Resolves the active environment base URL.
   * Dynamically switches workspaces or strips trailing context references.
   */
  private static isAuthEndpoint(endpoint: string): boolean {
    const authEndpoints = [
      '/login',
      '/verify-two-factor',
      '/me',
      '/update-password',
      '/enable-two-factor',
      '/activate-two-factor',
    ];
    return authEndpoints.some(authEp => endpoint.startsWith(authEp));
  }

  private static getBaseUrl(endpoint: string, stripAdmin = false, forceCore = false): string {
    const isAuth = this.isAuthEndpoint(endpoint);
    
    let app: string | null = 'core';
    if (!forceCore && !isAuth && typeof window !== 'undefined') {
      app = window.location.pathname.includes('/cloudcard')
        ? 'cloud'
        : window.location.pathname.includes('/cardcore')
          ? 'core'
          : localStorage.getItem('app');
    }
    
    let baseUrl = (!app || app === 'core' || isAuth) 
      ? process.env.NEXT_PUBLIC_API_URL || '' 
      : process.env.NEXT_PUBLIC_CLOUDCARD_API_URL || '';

    if (stripAdmin || (app === 'cloud' && !isAuth)) {
      baseUrl = baseUrl.replace('/admin', '');
    }

    return baseUrl;
  }

  /**
   * Constructs fully formed URL query query strings.
   */
  private static buildQueryParams(params?: Record<string, any>): string {
    if (!params) return '';
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        query.append(key, String(params[key]));
      }
    }
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Core request engine managing interceptor tasks, authorization state handling, 
   * global loaders, and contextual error evaluation.
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    stripAdmin = false,
    forceCore = false
  ): Promise<T> {
    // 1. Trigger global loading layout stream
    LoaderService.show();

    // 2. Compute true final URI target block
    const baseUrl = this.getBaseUrl(endpoint, stripAdmin, forceCore);
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

    // 3. Resolve authorization tokens from secure storage
    const token = SessionService.getStorageData('secret') || '';

    // 4. Configure unified Headers
    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      // Check if URL is valid before fetching
      if (!url || url.includes('undefined')) {
        throw new Error('Invalid API URL');
      }

      const response = await fetch(url, config);

      // Parse JSON response safely
      let responseData: any = {};
      try {
        const textData = await response.text();
        if (textData) {
          responseData = JSON.parse(textData);
        }
      } catch (parseError) {
        // Ignore JSON parse errors for empty responses
      }

      // Handle HTTP errors
      if (!response.ok) {
        const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/verify-two-factor');
        const errorMessage = responseData.message || responseData.error || `HTTP error! status: ${response.status}`;

        if ((response.status === 403 || response.status === 401) && !isAuthEndpoint) {
          toast.error('Session expired. Please login again.');
          SessionService.logout();
          return {
            failed: true,
            statusCode: response.status,
            httpStatus: response.status,
            message: 'Session expired',
            data: null
          } as any;
        }

        toast.error(errorMessage);
        
        return {
          failed: true,
          statusCode: responseData.statusCode || response.status,
          httpStatus: response.status,
          message: errorMessage,
          data: responseData
        } as any;
      }

      // Handle successful response
      const isActuallySuccessful = response.status === 200 || response.status === 201;
      return {
        failed: !isActuallySuccessful,
        statusCode: responseData.statusCode || response.status,
        httpStatus: response.status,
        message: isActuallySuccessful ? (responseData.message || 'HSM created successfully') : (responseData.message || 'Failed to create HSM'),
        ...responseData,
        data: responseData.data || responseData
      } as any;

    } catch (error: any) {
      const errorMessage = error.message || 'Network error';
      
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request handled:', errorMessage);
      }
      
      if (error.message !== 'Session expired') {
        toast.error(errorMessage);
      }

      return {
        failed: true,
        statusCode: 500,
        message: errorMessage,
        data: null
      } as any;
    } finally {
      LoaderService.hide();
    }
  }

  // ==========================================
  // Standard Workspace Endpoints
  // ==========================================

  public static async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestInit): Promise<T> {
    const queryString = this.buildQueryParams(params);
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET', ...options });
  }

  public static async post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
  }

  public static async put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
  }

  public static async patch<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options });
  }

  public static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  // ==========================================
  // Core Admin Endpoints
  // ==========================================

  public static async getCore<T>(endpoint: string, params?: Record<string, unknown>, options?: RequestInit): Promise<T> {
    const queryString = this.buildQueryParams(params);
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET', ...options }, false, true);
  }

  public static async postCore<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }, false, true);
  }

  public static async putCore<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }, false, true);
  }

  public static async deleteCore<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options }, false, true);
  }

  // ==========================================
  // Non-Admin Endpoints (Bypasses /admin)
  // ==========================================

  public static async getExternal<T>(endpoint: string, params?: Record<string, any>, options?: RequestInit): Promise<T> {
    const queryString = this.buildQueryParams(params);
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET', ...options }, true);
  }

  public static async postExternal<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }, true);
  }

  // ==========================================
  // Special External Assets Endpoints
  // ==========================================

  public static async getAllCountries(): Promise<any> {
    const response = await fetch('/assets/json/countries.json');
    return response.json();
  }

  public static async getOneCountry(countryCode: string): Promise<any> {
    const path = countryCode.length > 3 ? `name/${countryCode}` : `alpha/${countryCode}`;
    const response = await fetch(`https://restcountries.com/v3.1/${path}`);
    return response.json();
  }

  public static async uploadFile<T>(endpoint: string, file: File, options?: RequestInit): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'PUT',
      body: formData,
      ...options,
    });
  }
}
