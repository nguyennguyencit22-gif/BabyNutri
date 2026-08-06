import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

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
                {leftIcon ? (
                    <View style={styles.iconCircle}>
                        <Icon
                            source={leftIcon}
                            size={22}
                            color={
                                danger
                                    ? colors.danger
                                    : colors.text
                            }
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