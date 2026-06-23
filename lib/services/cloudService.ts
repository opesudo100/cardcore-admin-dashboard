import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// 1. Environment variables in Next.js use process.env instead of environment.ts
// Note: NEXT_PUBLIC_ prefix is required to expose them to the browser
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const CLOUD_CARD_API_URL =
  process.env.NEXT_PUBLIC_CLOUDCARD_API_URL ||
  process.env.NEXT_PUBLIC_CLOUD_CARD_API_URL ||
  '';

// 2. Helper to safely get base URL (handles server-side rendering check)
export const getUrl = (): string => {
  if (typeof window === 'undefined') return CLOUD_CARD_API_URL; // Default for SSR
  
  const pathname = window.location.pathname;
  const app = pathname.includes('/cloudcard')
    ? 'cloud'
    : pathname.includes('/cardcore')
      ? 'core'
      : localStorage.getItem('app');

  return !app || app === 'core' ? API_URL : CLOUD_CARD_API_URL;
};

// 3. Dynamic base URL wrapper for general endpoints
const getBaseUrl = () => getUrl();

// 4. Dynamic base URL wrapper without '/admin' (replacing the _ methods)
const getBaseUrlWithoutAdmin = () => getUrl().replace('/admin', '');

export const cloudService = {
  // GET request
  get: async <T>(endpoint: string, params?: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.get<T>(`${getBaseUrl()}${endpoint}`, {
        ...config,
        params,
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // POST request
  post: async <T>(endpoint: string, body: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.post<T>(`${getBaseUrl()}${endpoint}`, body, config);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // PUT request
  put: async <T>(endpoint: string, body: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.put<T>(`${getBaseUrl()}${endpoint}`, body, config);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // PATCH request
  patch: async <T>(endpoint: string, body: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.patch<T>(`${getBaseUrl()}${endpoint}`, body, config);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // DELETE request
  delete: async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.delete<T>(`${getBaseUrl()}${endpoint}`, config);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // --- Non-Admin Alternatives (Originally get_ and post_ ---
  
  getWithoutAdmin: async <T>(endpoint: string, params?: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.get<T>(`${getBaseUrlWithoutAdmin()}${endpoint}`, {
        ...config,
        params,
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  postWithoutAdmin: async <T>(endpoint: string, body: any, config?: AxiosRequestConfig) => {
    try {
      const response = await axios.post<T>(`${getBaseUrlWithoutAdmin()}${endpoint}`, body, config);
      return response.data;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Network error';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Cloud Service handled:', errorMessage);
      }
      
      return {
        failed: true,
        statusCode: err?.response?.status || 500,
        message: errorMessage,
        ...err?.response?.data
      } as any;
    }
  },

  // --- Special External API Endpoints ---

  // Fetches from Next.js public folder (e.g., public/assets/json/countries.json)
  getAllCountries: async () => {
    const response = await axios.get('/assets/json/countries.json');
    return response.data;
  },

  getOneCountry: async (countryCode: string) => {
    const url = countryCode.length > 3
      ? `https://restcountries.eu/rest/v2/name/${countryCode}`
      : `https://restcountries.eu/rest/v2/alpha/${countryCode}`;
    
    const response = await axios.get(url);
    return response.data;
  },

  uploadFile: async (url: string, file: any, config?: AxiosRequestConfig) => {
    // Note: Angular code used 'this.url' ignoring the 'url' parameter passed. 
    // Kept as getBaseUrl() here to preserve original behavior.
    const response = await axios.put(getBaseUrl(), file, config);
    return response.data;
  }
};
