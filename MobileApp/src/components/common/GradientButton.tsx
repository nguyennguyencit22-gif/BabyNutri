import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, {
    Defs,
    LinearGradient,
    Rect,
    Stop,
} from 'react-native-svg';

type GradientButtonProps = {
    title: string;
    onPress: () => void;
};

function GradientButton({
    title,
    onPress,
}: GradientButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.wrapper,
                pressed && styles.pressed,
            ]}>
            <Svg
                width="100%"
                height="100%"
                style={StyleSheet.absoluteFill}>
                <Defs>
                    <LinearGradient
                        id="buttonGradient"
                        x1="0%"
                        y1="50%"
                        x2="100%"
                        y2="50%">
                        <Stop offset="0%" stopColor="#FFD6C7" />
                        <Stop offset="45%" stopColor="#f7babb" />
                        <Stop offset="100%" stopColor="#F26772" />
                    </LinearGradient>
                </Defs>

                <Rect
                    width="100%"
                    height="100%"
                    rx="32"
                    fill="url(#buttonGradient)"
                />
            </Svg>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
    },

    pressed: {
        opacity: 0.8,
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontSize: 19,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default GradientButton;