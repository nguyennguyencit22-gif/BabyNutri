import React from 'react';
import {
    Image,
    ImageSourcePropType,
    Pressable,
    Text,
    View,
} from 'react-native';
import Icon from '../common/AppIcon';
import { useTranslation } from 'react-i18next';

import styles from '../../styles/home/recipeCardStyles';
import { useTranslatedText } from '../../hooks/useTranslatedText';

type RecipeCardProps = {
    title: string;
    time: string;
    image: ImageSourcePropType;
    rating?: number;
    ratingCount?: number;
    onPress?: () => void;
};

function RecipeCard({
    title,
    time,
    image,
    rating,
    ratingCount,
    onPress,
}: RecipeCardProps) {
    const { t } = useTranslation();
    // `title` comes from the recipes table in MySQL, so it's translated on
    // demand via Google Translate rather than looked up in the static
    // i18next bundle (which only covers hand-authored UI copy).
    const translatedTitle = useTranslatedText(title);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}>

            <Image
                source={image}
                style={styles.image}
            />

            <View style={styles.content}>
                <Text
                    numberOfLines={2}
                    style={styles.title}>
                    {translatedTitle}
                </Text>

                {!!rating && (
                    <View style={styles.ratingRow}>
                        <Icon
                            source="star"
                            color="#FFC62F"
                            size={14}
                        />
                        <Text style={styles.ratingText}>
                            {rating.toFixed(1)}
                            {!!ratingCount && ` (${ratingCount})`}
                        </Text>
                    </View>
                )}

                <Text style={styles.timeLabel}>
                    {t('home.time')}
                </Text>

                <Text style={styles.time}>
                    {time}
                </Text>
            </View>
        </Pressable>
    );
}

export default RecipeCard;