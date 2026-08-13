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
    scopes: ['profile', 'email'],
});

export async function loginWithGoogle() {
    await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
    });

    const response = await GoogleSignin.signIn();

    let idToken: string | null | undefined = null;

    if (isSuccessResponse(response)) {
        idToken = response.data?.idToken;
    } else if ((response as any)?.idToken) {
        idToken = (response as any).idToken;
    }

    if (!idToken) {
        try {
            const tokens = await GoogleSignin.getTokens();
            idToken = tokens.idToken;
        } catch (e) {
            console.log('getTokens fallback error:', e);
        }
    }

    if (!idToken) {
        throw new Error('Google ID token is missing. Please select your Google account.');
    }

    // GoogleAuthProvider.credential only requires idToken on React Native Firebase
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