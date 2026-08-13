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

    if (!idToken) {
        try {
            const tokens = await GoogleSignin.getTokens();
            console.log('[Google Auth] getTokens response:', tokens ? 'received tokens' : 'null');
            idToken = tokens?.idToken;
        } catch (e) {
            console.log('[Google Auth] getTokens error:', e);
        }
    }

    if (!idToken) {
        throw new Error(`Google Sign-In response type: ${response?.type || 'unknown'}. Please choose your Google account.`);
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);

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