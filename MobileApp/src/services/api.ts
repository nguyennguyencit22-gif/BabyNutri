import AsyncStorage from '@react-native-async-storage/async-storage';

// Android Emulator maps 10.0.2.2 back to the host machine's localhost.
// If you run on a physical device, switch this to your computer's LAN IP
// (e.g. http://192.168.x.x:5000/api); on iOS Simulator use http://localhost:5000/api.
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

const AUTH_TOKEN_KEY = '@babynutri/authToken';

export async function getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function setAuthToken(token: string | null): Promise<void> {
    if (token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
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
