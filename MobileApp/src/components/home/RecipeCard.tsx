import React from 'react';
import {
    Image,
    ImageSourcePropType,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/home/recipeCardStyles';

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
                    {title}
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
                    Time
                </Text>

                <Text style={styles.time}>
                    {time}
                </Text>
            </View>
        </Pressable>
    );
}

export default RecipeCard;