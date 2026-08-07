import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android Emulator maps 10.0.2.2 back to the host machine's localhost.
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

const AUTH_TOKEN_KEY = '@babynutri/authToken';

export async function getAuthToken(): Promise<string | null> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) return token;
    return AsyncStorage.getItem('accessToken');
}

export async function setAuthToken(token: string | null): Promise<void> {
    if (token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem('accessToken', token);
    } else {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem('accessToken');
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');

    const body = isJson ? await response.json() : undefined;

    if (!response.ok) {
        const message =
            (body && (body.message || body.error)) ||
            `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return body as T;
}

export function apiGet<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, {
        method: 'POST',
        body: data !== undefined ? JSON.stringify(data) : undefined,
    });
}

export function apiPut<T>(path: string, data?: unknown): Promise<T> {
    return request<T>(path, {
        method: 'PUT',
        body: data !== undefined ? JSON.stringify(data) : undefined,
    });
}

export function apiDelete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API Error]', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Error] Không nhận được phản hồi từ server:', error.message);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
