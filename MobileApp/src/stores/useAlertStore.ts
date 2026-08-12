import { create } from 'zustand';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
    text: string;
    onPress?: () => void;
    style?: AppAlertButtonStyle;
};

export type AppAlertIcon =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'heart'
    | 'star'
    | 'baby';

interface AlertState {
    visible: boolean;
    title: string;
    message?: string;
    buttons: AppAlertButton[];
    icon?: AppAlertIcon;
    show: (
        title: string,
        message?: string,
        buttons?: AppAlertButton[],
        icon?: AppAlertIcon,
    ) => void;
    hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    visible: false,
    title: '',
    message: undefined,
    buttons: [{ text: 'OK' }],
    icon: undefined,

    show: (title, message, buttons, icon) => set({
        visible: true,
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
        icon,
    }),

    hide: () => set({ visible: false }),
}));
