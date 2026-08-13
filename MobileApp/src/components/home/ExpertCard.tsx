import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import Icon from '../common/AppIcon';

type ExpertCardProps = {
    name: string;
    role: string;
    image: ImageSourcePropType;
    rating?: number;
    onPress?: () => void;
};

function ExpertCard({
    name,
    role,
    image,
    rating = 4.9,
    onPress,
}: ExpertCardProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image
                source={image}
                style={styles.avatar}
            />

            <Text
                numberOfLines={2}
                style={styles.name}>
                {name}
            </Text>

            <Text
                numberOfLines={1}
                style={styles.role}>
                {role}
            </Text>

            <TouchableOpacity style={styles.ratingBadge} onPress={onPress} activeOpacity={0.7}>
                <Icon source="star" size={11} color="#FFB800" />
                <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 82,
        alignItems: 'center',
    },

    avatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#F3DFDA',
    },

    name: {
        marginTop: 8,
        color: '#4B252B',
        fontSize: 13,
        lineHeight: 17,
        fontWeight: '700',
        textAlign: 'center',
    },

    role: {
        marginTop: 3,
        color: '#9A7378',
        fontSize: 11,
        textAlign: 'center',
    },

    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
        backgroundColor: '#FFF8E7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFE099',
    },

    ratingText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#B38300',
    },
});

export default ExpertCard;