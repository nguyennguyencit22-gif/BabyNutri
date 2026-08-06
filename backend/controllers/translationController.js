// @ts-nocheck
// controllers/translationController.js

const {
    translateText,
    translateTexts,
    SUPPORTED_LANGUAGES,
} = require('../services/translationService');

const {
    LANGUAGES,
} = require('../constants/languages');

const translateContent = async (req, res) => {
    try {
        const {
            text,
            targetLanguage,
        } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                message: 'Text is required.',
            });
        }

        if (!targetLanguage) {
            return res.status(400).json({
                message:
                    'Target language is required.',
            });
        }

        if (
            !SUPPORTED_LANGUAGES.includes(
                targetLanguage,
            )
        ) {
            return res.status(400).json({
                message: 'Unsupported language.',
                supportedLanguages:
                    SUPPORTED_LANGUAGES,
            });
        }

        const translatedText =
            await translateText(
                text,
                targetLanguage,
            );

        return res.status(200).json({
            originalText: text,
            translatedText,
            targetLanguage,
        });
    } catch (error) {
        console.error(
            'Translate controller error:',
            error,
        );

        return res.status(500).json({
            message: 'Cannot translate content.',
        });
    }
};

const translateBatch = async (req, res) => {
    try {
        const {
            texts,
            targetLanguage,
        } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({
                message: 'texts must be a non-empty array.',
            });
        }

        if (!targetLanguage) {
            return res.status(400).json({
                message:
                    'Target language is required.',
            });
        }

        if (
            !SUPPORTED_LANGUAGES.includes(
                targetLanguage,
            )
        ) {
            return res.status(400).json({
                message: 'Unsupported language.',
                supportedLanguages:
                    SUPPORTED_LANGUAGES,
            });
        }

        const translatedTexts =
            await translateTexts(
                texts,
                targetLanguage,
            );

        return res.status(200).json({
            translatedTexts,
            targetLanguage,
        });
    } catch (error) {
        console.error(
            'Translate batch controller error:',
            error,
        );

        return res.status(500).json({
            message: 'Cannot translate content.',
        });
    }
};

const getSupportedLanguages = (req, res) => {
    return res.status(200).json({
        languages: LANGUAGES,
    });
};

module.exports = {
    translateContent,
    translateBatch,
    getSupportedLanguages,
};