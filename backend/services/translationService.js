

const express = require('express');

const SUPPORTED_LANGUAGES = [
    'en',
    'vi',
    'fr',
    'de',
    'ja',
    'ko',
    'zh-CN',
];

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

const translateTexts = async (
    texts,
    targetLanguage = 'vi',
) => {
    if (!Array.isArray(texts)) {
        return [];
    }

    return Promise.all(
        texts.map(text =>
            translateText(text, targetLanguage),
        ),
    );
};

module.exports = {
    translateText,
    translateTexts,
    SUPPORTED_LANGUAGES,
};