import { API_BASE_URL, setAuthToken } from './api';

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
