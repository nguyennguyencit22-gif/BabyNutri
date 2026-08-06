// controllers/translationController.js

const {
    translateText,
    SUPPORTED_LANGUAGES,
} = require('../services/translationService');

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

module.exports = {
    translateContent,
};