import React from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../store/Store';
import { BASE_LANGUAGE } from '../i18n';
import { translateText } from '../services/translationService';

// In-memory only — DB content (recipe names, journey copy, etc.) is
// translated on demand per string, unlike the static UI bundle which is
// batch-translated and persisted once in languageSlice.
const memoryCache = new Map<string, string>();

// Translates arbitrary DB-sourced text (recipe titles, descriptions, ...)
// to whatever language is currently active. Falls back to the original
// text while the request is in flight or if it fails.
export function useTranslatedText(text: string): string {
    const languageCode = useSelector(
        (state: RootState) => state.language.code,
    );

    const [translated, setTranslated] = React.useState(text);

    React.useEffect(() => {
        if (!text || languageCode === BASE_LANGUAGE) {
            setTranslated(text);
            return;
        }

        const cacheKey = `${languageCode}:${text}`;
        const cached = memoryCache.get(cacheKey);

        if (cached) {
            setTranslated(cached);
            return;
        }

        let cancelled = false;
        setTranslated(text);

        translateText(text, languageCode)
            .then((result) => {
                if (!cancelled) {
                    memoryCache.set(cacheKey, result);
                    setTranslated(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setTranslated(text);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [text, languageCode]);

    return translated;
}
