import type { ImageSourcePropType } from 'react-native';

// Keyed by journey_items.image_key — badges are bundled locally in
// MobileApp/public/images since they're pre-rendered artwork, not photos.
const JOURNEY_IMAGES: Record<string, ImageSourcePropType> = {
    'startingSoon-Seedstick': require('../../../public/images/startingSoon-Seedstick.png'),
    'firstTastes-Seedstick': require('../../../public/images/firstTastes-Seedstick.png'),
    '6Months-Seedstick': require('../../../public/images/6Months-Seedstick.png'),
    '7Months-Seedstick': require('../../../public/images/7Months-Seedstick.png'),
    '10Months-Seedstick': require('../../../public/images/10Months-Seedstick.png'),
    '12Months-Seedstick': require('../../../public/images/12Months-Seedstick.png'),
};

export function getJourneyImage(
    imageKey: string | null | undefined,
): ImageSourcePropType | undefined {
    return imageKey ? JOURNEY_IMAGES[imageKey] : undefined;
}
