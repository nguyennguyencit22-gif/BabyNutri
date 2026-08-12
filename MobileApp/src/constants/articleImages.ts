import type { ImageSourcePropType } from 'react-native';

// Keyed by articles.id — the 6 weaning-journey stage articles (see
// journey_items.article_id) reuse the same round Seedstick badge artwork
// shown on their Home journey card, bundled locally in public/images, so
// the article you land on visually matches the card you tapped instead of
// showing an unrelated stock photo. Any other article falls back to its DB
// image_url.
const ARTICLE_IMAGES: Record<number, ImageSourcePropType> = {
    1: require('../../public/images/startingSoon-Seedstick.png'),
    2: require('../../public/images/firstTastes-Seedstick.png'),
    3: require('../../public/images/6Months-Seedstick.png'),
    4: require('../../public/images/7Months-Seedstick.png'),
    5: require('../../public/images/10Months-Seedstick.png'),
    6: require('../../public/images/12Months-Seedstick.png'),
};

export function getArticleImage(
    id: number | string | undefined | null,
    fallbackUrl?: string | null,
): ImageSourcePropType {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (numericId != null && ARTICLE_IMAGES[numericId]) {
        return ARTICLE_IMAGES[numericId];
    }

    return { uri: fallbackUrl ?? undefined };
}

// The Seedstick badges are round artwork on a transparent background, so
// they need resizeMode="contain" (letterboxed) instead of "cover" (which
// would crop the circle) — this tells callers which case they're in.
export function isLocalArticleImage(id: number | string | undefined | null): boolean {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return numericId != null && !!ARTICLE_IMAGES[numericId];
}
