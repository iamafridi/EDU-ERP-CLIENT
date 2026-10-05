import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Explicit environment toggle for mock fallbacks (default: false in production, true if explicitly configured)
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cross-tab synchronized JWT Authorization interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hostelpro-auth-store') || sessionStorage.getItem('hostelpro-auth-store');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // corrupted store — ignore
      }
    }
  }
  return config;
});

// Toast / Demo interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes('demo')
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('demo-toast', {
            detail: { message: error.response.data.message },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Generic Type-Safe Request Wrapper with Gated Mock Fallback
 */
export async function request<T = any>(
  config: AxiosRequestConfig,
  mockFallback?: T
): Promise<T> {
  // If mocks are globally forced on (e.g. offline showcase)
  if (USE_MOCKS && mockFallback !== undefined) {
    await delay(150);
    return mockFallback;
  }

  try {
    const res = await apiClient.request<any>(config);
    // Standardized envelope extraction
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (error: any) {
    // If backend request fails and mock fallback is provided, fallback silently and seamlessly
    if (mockFallback !== undefined) {
      await delay(150);
      return mockFallback;
    }
    // In production or when no fallback provided, bubble real error
    throw error;
  }
}
