import React, { useId } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
    Defs,
    Ellipse,
    LinearGradient,
    Stop,
} from 'react-native-svg';

type BackgroundVariant = 'welcome' | 'auth' | 'soft';

type BabyNutriBackgroundProps = {
    variant?: BackgroundVariant;
    style?: StyleProp<ViewStyle>;
};

function GradientEllipse({
    id,
    colors,
}: {
    id: string;
    colors: [string, string, string];
}) {
    return (
        <Svg width="100%" height="100%">
            <Defs>
                <LinearGradient
                    id={id}
                    x1="75%"
                    y1="0%"
                    x2="25%"
                    y2="100%">
                    <Stop offset="0%" stopColor={colors[0]} />
                    <Stop offset="50%" stopColor={colors[1]} />
                    <Stop offset="100%" stopColor={colors[2]} />
                </LinearGradient>
            </Defs>

            <Ellipse
                cx="50%"
                cy="50%"
                rx="50%"
                ry="50%"
                fill={`url(#${id})`}
            />
        </Svg>
    );
}

function BabyNutriBackground({
    variant = 'welcome',
    style,
}: BabyNutriBackgroundProps) {
    const uniqueId = useId().replace(/:/g, '');

    const variantStyles = {
        welcome: styles.welcomeBackground,
        auth: styles.authBackground,
        soft: styles.softBackground,
    };

    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                variantStyles[variant],
                style,
            ]}>
            <View style={styles.topShape}>
                <GradientEllipse
                    id={`top-${uniqueId}`}
                    colors={['#FDECE4', '#f6bfc6', '#FF8E9E']}
                />
            </View>

            <View style={styles.rightShape}>
                <GradientEllipse
                    id={`right-${uniqueId}`}
                    colors={['#FFD6E1', '#fce4d9', '#FFD9C7']}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        overflow: 'hidden',
    },

    welcomeBackground: {
        backgroundColor: '#FFD8CC',
    },

    authBackground: {
        backgroundColor: '#FFFFFF',
    },

    softBackground: {
        backgroundColor: '#FFF7F5',
    },

    topShape: {
        position: 'absolute',
        top: 90,
        left: -430,
        width: 820,
        height: 860,
    },

    rightShape: {
        position: 'absolute',
        top: 250,
        right: -370,
        width: 690,
        height: 950,
    },

});

export default BabyNutriBackground;