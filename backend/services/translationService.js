// @ts-nocheck
const {
    SUPPORTED_LANGUAGE_CODES: SUPPORTED_LANGUAGES,
} = require('../constants/languages');

const translateText = async (
    text,
    targetLanguage = 'vi',
) => {
    if (text === null || text === undefined) {
        return text;
    }

    if (typeof text !== 'string') {
        return text;
    }

    const trimmedText = text.trim();

    if (!trimmedText) {
        return text;
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
        throw new Error(
            `Unsupported language: ${targetLanguage}`,
        );
    }

    try {
        const {
            translate,
        } = await import(
            '@vitalets/google-translate-api'
        );

        const result = await translate(trimmedText, {
            to: targetLanguage,
        });

        return result.text;
    } catch (error) {
        console.error(
            'Translation service error:',
            error.message,
        );

        // Nếu dịch lỗi thì trả lại nội dung gốc
        return text;
    }
};

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Sequential with a small stagger, on purpose: @vitalets/google-translate-api
// hits Google's public endpoint directly, and firing every string at once
// via Promise.all reliably triggers "Too Many Requests" once a bundle grows
// past a handful of keys.
const translateTexts = async (
    texts,
    targetLanguage = 'vi',
) => {
    if (!Array.isArray(texts)) {
        return [];
    }

    const results = [];

    for (const text of texts) {
        results.push(
            await translateText(text, targetLanguage),
        );
        await delay(120);
    }

    return results;
};

module.exports = {
    translateText,
    translateTexts,
    SUPPORTED_LANGUAGES,
};