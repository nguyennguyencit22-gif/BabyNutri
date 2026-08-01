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

    if (!isSuccessResponse(response)) {
        throw new Error(
            'Google sign-in was cancelled.',
        );
    }

    /*
     * Với phiên bản Google Sign-In mới,
     * dữ liệu nằm trong response.data.
     */
    let idToken = response.data.idToken;

    /*
     * @react-native-firebase/auth (bản đang dùng) yêu cầu
     * accessToken không rỗng, nên luôn lấy qua getTokens().
     */
    const tokens = await GoogleSignin.getTokens();

    if (!idToken) {
        idToken = tokens.idToken;
    }

    const accessToken = tokens.accessToken;

    if (!idToken) {
        throw new Error(
            'Google ID token is missing.',
        );
    }

    if (!accessToken) {
        throw new Error(
            'Google access token is missing.',
        );
    }

    const googleCredential =
        GoogleAuthProvider.credential(
            idToken,
            accessToken,
        );

    const userCredential =
        await signInWithCredential(
            getAuth(),
            googleCredential,
        );

    const firebaseIdToken =
        await getIdToken(
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