import { API_BASE_URL, apiDelete, setAuthToken } from './api';

export type BackendRole = 'Admin' | 'Expert' | 'Parent';

export type BackendUser = {
    id: number;
    fullName: string;
    email: string;
    avatar: string | null;
    role: BackendRole;
};

type FirebaseLoginResponse = {
    token: string;
    user: BackendUser;
};

// Exchanges a Firebase ID token for our own backend JWT. Uses a raw fetch
// (not apiPost from api.ts) because this specific call must send the
// Firebase ID token as the bearer, not whatever JWT we already have stored.
export async function loginWithFirebaseToken(
    firebaseIdToken: string,
): Promise<FirebaseLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseIdToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? 'Firebase login failed.');
    }

    await setAuthToken(data.token);

    return data as FirebaseLoginResponse;
}

export async function loginWithGoogleDirect(
    email: string = 'khoa.nguyenhoang.cit22@eiu.edu.vn',
): Promise<FirebaseLoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google-direct`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? 'Google direct login failed.');
    }

    await setAuthToken(data.token);

    return data as FirebaseLoginResponse;
}

export async function loginWithEmail(
    email: string,
    password: string,
): Promise<{ token: string; user: BackendUser }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message ?? 'Login failed.');
    }

    await setAuthToken(data.token);

    return {
        token: data.token,
        user: {
            id: data.user.id,
            fullName: data.user.full_name || data.user.fullName || data.user.email,
            email: data.user.email,
            avatar: data.user.avatar || null,
            role: data.user.role || 'Parent',
        },
    };
}

// Permanently deletes the current user's account and all associated data
// (children, favorites, ratings, comments, chats, meal plans...). Irreversible.
export async function deleteMyAccount(): Promise<void> {
    await apiDelete<{ message: string }>('/auth/me');
}
