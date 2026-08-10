import type { ImageSourcePropType } from 'react-native';

// Keyed by recipes.id — bundled locally in MobileApp/public/images since
// these are the dedicated illustrations for the seeded recipes. Any recipe
// without a matching entry here falls back to its DB image_url.
const RECIPE_IMAGES: Record<number, ImageSourcePropType> = {
    1: require('../../../public/images/recipe1.webp'),
    2: require('../../../public/images/recipe2.webp'),
    3: require('../../../public/images/recipe3.webp'),
    4: require('../../../public/images/recipe4.webp'),
    5: require('../../../public/images/recipe5.webp'),
    6: require('../../../public/images/recipe6.webp'),
};

export function getRecipeImage(
    id: number,
    fallbackUrl: string,
): ImageSourcePropType {
    return RECIPE_IMAGES[id] ?? { uri: fallbackUrl };
}
