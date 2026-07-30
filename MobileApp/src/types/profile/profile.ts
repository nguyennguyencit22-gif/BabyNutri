export type UserProfile = {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
};

export type ProfileMenuItemData = {
    id: string;
    title: string;
    icon?: string;
    route?: string | null;
    danger?: boolean;
};