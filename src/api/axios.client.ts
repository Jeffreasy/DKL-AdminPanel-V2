import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

class AxiosClient {
  private instance: AxiosInstance;
  private refreshPromise: Promise<AxiosResponse> | null = null;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        // Controleer of we niet al een Authorization header hebben (bijv. bij refresh calls)
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // Als we een 401 krijgen, en het is nog niet geprobeerd, en het is NIET de refresh call zelf
        if (
          error.response?.status === 401 && 
          originalRequest && 
          !originalRequest._retry && 
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          originalRequest._retry = true;

          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken();
          }

          try {
            const refreshResponse = await this.refreshPromise;
            const newToken = refreshResponse.data.token;
            const newRefreshToken = refreshResponse.data.refresh_token; 
            
            localStorage.setItem('access_token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            
            // Update de header voor de retry
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login or handle
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/login'; 
            return Promise.reject(refreshError);
          } finally {
            this.refreshPromise = null;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<AxiosResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.instance.post('/auth/refresh', { refresh_token: refreshToken });
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// --- FIX: Zorg dat /api altijd in de URL zit ---

// 1. Haal de URL uit env of gebruik default
let apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 2. Strip eventuele trailing slash
if (apiUrl.endsWith('/')) {
  apiUrl = apiUrl.slice(0, -1);
}

// 3. Veiligheidscheck: als de URL eindigt op :8080 (zonder /api), plak het er dan aan vast
if (!apiUrl.endsWith('/api')) {
  console.warn('VITE_API_BASE_URL mist "/api". Dit wordt automatisch toegevoegd.');
  apiUrl = `${apiUrl}/api`;
}

const axiosClient = new AxiosClient(apiUrl);

export default axiosClient.getInstance();