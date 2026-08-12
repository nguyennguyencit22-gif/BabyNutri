import { useAlertStore } from '../stores/useAlertStore';
import type { AppAlertButton, AppAlertIcon } from '../stores/useAlertStore';

// Drop-in replacement for React Native's Alert.alert(title, message, buttons)
// that shows the app's own cute themed popup instead of the plain OS dialog.
// Callable from anywhere (components, plain functions, services) — not just
// inside React components — since it just pushes state into a Zustand store
// that <AppAlert /> (mounted once at the app root) renders.
//
//   appAlert.show('Saved to Favorites', '"Recipe" was added.', undefined, 'heart');
//   appAlert.show('Login Required', 'Please log in to continue.', [
//     { text: 'Later', style: 'cancel' },
//     { text: 'Log In', onPress: () => navigation.navigate('Login') },
//   ]);
export const appAlert = {
    show: (
        title: string,
        message?: string,
        buttons?: AppAlertButton[],
        icon?: AppAlertIcon,
    ) => {
        useAlertStore.getState().show(title, message, buttons, icon);
    },
};
