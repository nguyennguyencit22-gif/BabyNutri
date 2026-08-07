import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const ChevronRightIcon = ({ size = 22, color = '#8E7377' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

type ProfileMenuItemProps = {
    title: string;
    leftIcon?: string;
    showArrow?: boolean;
    danger?: boolean;
    onPress?: () => void;
};

function ProfileMenuItem({
    title,
    leftIcon,
    showArrow = true,
    danger = false,
    onPress,
}: ProfileMenuItemProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.containerMenu,
                pressed && styles.pressed,
            ]}>

            <View style={styles.leftContent}>
                <Text
                    style={[
                        styles.titleMenu,
                        danger && styles.dangerTitle,
                    ]}>
                    {title}
                </Text>
            </View>

            {showArrow ? (
                <ChevronRightIcon
                    size={22}
                    color={
                        danger
                            ? colors.danger
                            : colors.text
                    }
                />
            ) : null}
        </Pressable>
    );
}

export default ProfileMenuItem;