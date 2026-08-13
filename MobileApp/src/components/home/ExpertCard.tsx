import React from 'react';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

type ExpertCardProps = {
    name: string;
    role: string;
    image: ImageSourcePropType;
    onPress?: () => void;
};

function ExpertCard({
    name,
    role,
    image,
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
});

export default ExpertCard;