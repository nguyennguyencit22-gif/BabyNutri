import {
    getAuth,
    getIdToken,
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
} from '@react-native-firebase/auth';

import {
    GoogleSignin,
    isSuccessResponse,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId:
        '838570278190-06ff9gejlh388s6b2k8bs6ttujo64pt6.apps.googleusercontent.com',
    offlineAccess: false,
});

export async function loginWithGoogle() {
    await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();
    console.log('[Google Auth] signIn response:', JSON.stringify(response));

    let idToken: string | null | undefined = null;

    if (isSuccessResponse(response)) {
        idToken = response.data?.idToken;
    } else if ((response as any)?.idToken) {
        idToken = (response as any).idToken;
    } else if ((response as any)?.data?.idToken) {
        idToken = (response as any).data.idToken;
    }

    // @react-native-firebase/auth (the version in use) requires a non-empty
    // accessToken alongside the idToken, or signInWithCredential throws
    // "[auth/unknown] Exception in HostFunction: accessToken cannot be
    // empty" — always fetch both via getTokens() rather than relying on
    // whatever GoogleSignin.signIn() happened to return.
    let accessToken: string | null | undefined = null;
    try {
        const tokens = await GoogleSignin.getTokens();
        console.log('[Google Auth] getTokens response:', tokens ? 'received tokens' : 'null');
        if (!idToken) idToken = tokens?.idToken;
        accessToken = tokens?.accessToken;
    } catch (e) {
        console.log('[Google Auth] getTokens error:', e);
    }

    if (!idToken) {
        throw new Error(`Google Sign-In response type: ${response?.type || 'unknown'}. Please choose your Google account.`);
    }

    if (!accessToken) {
        throw new Error('Google access token is missing. Please try signing in again.');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken, accessToken);

    const userCredential = await signInWithCredential(
        getAuth(),
        googleCredential,
    );

    const firebaseIdToken = await getIdToken(
        userCredential.user,
        true,
    );

    return {
        user: userCredential.user,
        firebaseIdToken,
    };
}

export async function logoutFromFirebase() {
    await GoogleSignin.signOut();
    await signOut(getAuth());
}