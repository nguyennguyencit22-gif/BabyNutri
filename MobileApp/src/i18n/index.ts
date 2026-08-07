import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';

export type ResourceTree = { [key: string]: string | ResourceTree };

export const BASE_LANGUAGE = 'en';

// Turns the nested en.ts object into an ordered [dottedKey, text] list —
// the exact array we send to the backend's batch-translate endpoint.
export function flattenResource(
    tree: ResourceTree,
    prefix = '',
): Array<[string, string]> {
    return Object.entries(tree).flatMap(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        return typeof value === 'string'
            ? ([[fullKey, value]] as Array<[string, string]>)
            : flattenResource(value, fullKey);
    });
}

// Rebuilds a nested resource object from dottedKey -> translatedText pairs,
// mirroring the shape of en.ts so i18next can register it as a bundle.
export function unflattenResource(
    entries: Array<[string, string]>,
): ResourceTree {
    const result: ResourceTree = {};

    entries.forEach(([dottedKey, value]) => {
        const parts = dottedKey.split('.');
        let node = result;

        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                node[part] = value;
            } else {
                node[part] = (node[part] as ResourceTree) ?? {};
                node = node[part] as ResourceTree;
            }
        });
    });

    return result;
}

export const baseResourceEntries = flattenResource(en);

i18n.use(initReactI18next).init({
    lng: BASE_LANGUAGE,
    fallbackLng: BASE_LANGUAGE,
    resources: {
        [BASE_LANGUAGE]: {
            translation: en,
        },
    },
    interpolation: {
        escapeValue: false,
    },
});

export function applyTranslatedBundle(
    code: string,
    bundle: ResourceTree,
): void {
    i18n.addResourceBundle(code, 'translation', bundle, true, true);
}

export function setActiveLanguage(code: string): Promise<unknown> {
    return i18n.changeLanguage(code);
}

export default i18n;
