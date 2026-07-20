import {
    getAuth,
    getIdToken,
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
} from '@react-native-firebase/auth';

import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId:
        '838570278190-06ff9gejlh388s6b2k8bs6ttujo64pt6.apps.googleusercontent.com',
});

export async function loginWithGoogle() {
    await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
    });

    const signInResult = await GoogleSignin.signIn();

    if (!isSuccessResponse(signInResult)) {
        throw new Error('Google sign-in was cancelled.');
    }

    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) {
        throw new Error('Google ID token is missing.');
    }

    const googleCredential =
        GoogleAuthProvider.credential(idToken);

    const userCredential = await signInWithCredential(
        getAuth(),
        googleCredential,
    );

    const firebaseIdToken = await getIdToken(
        userCredential.user,
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

export function getGoogleLoginError(error: unknown): string {
    if (!isErrorWithCode(error)) {
        return error instanceof Error
            ? error.message
            : 'Google sign-in failed.';
    }

    switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
            return 'Google sign-in was cancelled.';

        case statusCodes.IN_PROGRESS:
            return 'Google sign-in is already in progress.';

        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            return 'Google Play Services is unavailable or outdated.';

        default:
            return error.message || 'Google sign-in failed.';
    }
}