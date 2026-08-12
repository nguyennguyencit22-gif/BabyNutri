import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const ChevronRightIcon = ({ size = 24, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 18l6-6-6-6" />
    </Svg>
);

const PlusIcon = ({ size = 22, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 5v14M5 12h14" />
    </Svg>
);

const MessageIcon = ({ size = 22, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
);

const HistoryIcon = ({ size = 22, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 3v5h5" />
        <Path d="M3.05 13A9 9 0 106 5.3L3 8" />
        <Path d="M12 7v5l4 2" />
    </Svg>
);

const DeleteIcon = ({ size = 22, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
    </Svg>
);

const DotIcon = ({ size = 22, color = '#4B3034' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" fill={color} />
    </Svg>
);

const LEFT_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    plus: PlusIcon,
    'message-text-outline': MessageIcon,
    history: HistoryIcon,
    delete: DeleteIcon,
    'delete-outline': DeleteIcon,
};

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

    const iconColor = danger ? colors.danger : colors.text;
    const LeftIconComponent = leftIcon ? LEFT_ICONS[leftIcon] ?? DotIcon : null;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.containerMenu,
                pressed && styles.pressed,
            ]}>

            <View style={styles.leftContent}>
                {LeftIconComponent ? (
                    <View style={styles.iconCircle}>
                        <LeftIconComponent
                            size={22}
                            color={iconColor}
                        />
                    </View>
                ) : null}

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
                    size={28}
                    color={iconColor}
                />
            ) : null}
        </Pressable>
    );
}

export default ProfileMenuItem;