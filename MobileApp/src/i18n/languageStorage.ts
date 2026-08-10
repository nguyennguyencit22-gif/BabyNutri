import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_CODE_KEY = '@babynutri/languageCode';
const BUNDLE_KEY_PREFIX = '@babynutri/languageBundle:';

export async function getStoredLanguageCode(): Promise<string | null> {
    return AsyncStorage.getItem(LANGUAGE_CODE_KEY);
}

export async function setStoredLanguageCode(code: string): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_CODE_KEY, code);
}

// Bundles are cached per language as a flat { dottedKey: translatedText }
// map so a language only ever needs one Google Translate call, ever.
export async function getStoredBundle(
    code: string,
): Promise<Record<string, string> | null> {
    const raw = await AsyncStorage.getItem(`${BUNDLE_KEY_PREFIX}${code}`);
    return raw ? JSON.parse(raw) : null;
}

export async function setStoredBundle(
    code: string,
    entries: Record<string, string>,
): Promise<void> {
    await AsyncStorage.setItem(
        `${BUNDLE_KEY_PREFIX}${code}`,
        JSON.stringify(entries),
    );
}
