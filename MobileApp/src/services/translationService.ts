export type AppLanguage =
    | 'en'
    | 'vi'
    | 'fr'
    | 'de'
    | 'ja'
    | 'ko'
    | 'zh-CN';

const API_BASE_URL = 'http://10.0.2.2:5000/api';

type TranslationResponse = {
    originalText: string;
    translatedText: string;
    targetLanguage: AppLanguage;
};

export const translateText = async (
    text: string,
    targetLanguage: AppLanguage,
): Promise<string> => {
    const response = await fetch(
        `${API_BASE_URL}/translate`,
        {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json',
            },
            body: JSON.stringify({
                text,
                targetLanguage,
            }),
        },
    );

    const data =
        (await response.json()) as
        | TranslationResponse
        | { message?: string };

    if (!response.ok) {
        throw new Error(
            'message' in data
                ? data.message
                : 'Cannot translate text.',
        );
    }

    return (
        data as TranslationResponse
    ).translatedText;
};