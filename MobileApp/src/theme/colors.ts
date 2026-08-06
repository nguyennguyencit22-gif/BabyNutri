export type AppColors = {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    overlay: string;
    overlayStrong: string;

    text: string;
    textSoft: string;
    textMuted: string;
    onPrimary: string;

    primary: string;
    primarySoft: string;
    secondary: string;
    secondarySoft: string;

    danger: string;
    dangerSoft: string;
};

export const lightColors: AppColors = {
    background: '#FFFDF9',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF0EA',
    border: '#EFE7E4',
    overlay: 'rgba(35, 20, 25, 0.30)',
    overlayStrong: 'rgba(45, 35, 40, 0.42)',

    text: '#40383D',
    textSoft: '#8A6E6E',
    textMuted: '#B0989C',
    onPrimary: '#FFFFFF',

    primary: '#FF5F70',
    primarySoft: '#FFE2E6',
    secondary: '#B445E6',
    secondarySoft: '#E8D9FF',

    danger: '#FF3B30',
    dangerSoft: '#FFD2D9',
};

export const darkColors: AppColors = {
    background: '#1C1719',
    surface: '#2A2225',
    surfaceAlt: '#3A2E31',
    border: '#44383D',
    overlay: 'rgba(0, 0, 0, 0.55)',
    overlayStrong: 'rgba(0, 0, 0, 0.65)',

    text: '#FFF5F2',
    textSoft: '#C9B3B7',
    textMuted: '#8F7A7E',
    onPrimary: '#FFFFFF',

    primary: '#FF5F70',
    primarySoft: '#4A2A30',
    secondary: '#B445E6',
    secondarySoft: '#3A2A4A',

    danger: '#FF6B60',
    dangerSoft: '#4A2A2A',
};
