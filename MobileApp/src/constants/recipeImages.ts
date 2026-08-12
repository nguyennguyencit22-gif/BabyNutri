import type { ImageSourcePropType } from 'react-native';

// Keyed by recipes.id — bundled locally in MobileApp/public/images so recipe
// photos work offline and don't depend on an external host being reachable.
// Used everywhere a recipe photo is shown (Home's Popular Recipes, recipe
// list/detail, meal scheduler, favorites...) so the same recipe always shows
// the same photo. Any recipe without a matching entry here falls back to
// its DB image_url.
const RECIPE_IMAGES: Record<number, ImageSourcePropType> = {
    1: require('../../public/images/recipe1.webp'),
    2: require('../../public/images/recipe2.webp'),
    3: require('../../public/images/recipe3.webp'),
    4: require('../../public/images/recipe4.webp'),
    5: require('../../public/images/recipe5.webp'),
    6: require('../../public/images/recipe6.webp'),
};

export function getRecipeImage(
    id: number | string | undefined | null,
    fallbackUrl?: string | null,
): ImageSourcePropType {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (numericId != null && RECIPE_IMAGES[numericId]) {
        return RECIPE_IMAGES[numericId];
    }

    return { uri: fallbackUrl ?? undefined };
}
