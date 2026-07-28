import React from 'react';
import {
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';

import styles from '../../styles/home/recipeCardStyles';

type RecipeCardProps = {
    title: string;
    time: string;
    image: string;
    onPress?: () => void;
};

function RecipeCard({
    title,
    time,
    image,
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
                source={{ uri: image }}
                style={styles.image}
            />

            <View style={styles.content}>
                <Text
                    numberOfLines={2}
                    style={styles.title}>
                    {title}
                </Text>

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