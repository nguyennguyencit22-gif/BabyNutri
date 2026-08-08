import { apiGet, apiPost } from './api';

// Language codes are open-ended (whatever the backend's LANGUAGES list
// supports) — they come from @vitalets/google-translate-api's target codes.
export type AppLanguage = string;

export type LanguageOption = {
    code: AppLanguage;
    name: string;
    nativeName: string;
};

type TranslateResponse = {
    originalText: string;
    translatedText: string;
    targetLanguage: AppLanguage;
};

type TranslateBatchResponse = {
    translatedTexts: string[];
    targetLanguage: AppLanguage;
};

type LanguagesResponse = {
    languages: LanguageOption[];
};

export const translateText = (
    text: string,
    targetLanguage: AppLanguage,
): Promise<string> =>
    apiPost<TranslateResponse>('/translate', {
        text,
        targetLanguage,
    }).then((data) => data.translatedText);

export const translateBatch = (
    texts: string[],
    targetLanguage: AppLanguage,
): Promise<string[]> =>
    apiPost<TranslateBatchResponse>('/translate/batch', {
        texts,
        targetLanguage,
    }).then((data) => data.translatedTexts);

export const fetchSupportedLanguages = (): Promise<LanguageOption[]> =>
    apiGet<LanguagesResponse>('/translate/languages').then(
        (data) => data.languages,
    );
