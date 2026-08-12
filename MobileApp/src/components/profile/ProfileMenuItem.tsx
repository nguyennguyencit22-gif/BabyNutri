import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';
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
                {leftIcon === 'plus' && (
                    <View style={{ marginRight: 10 }}>
                        <Icon source="plus" size={20} color={danger ? colors.danger : colors.primary} />
                    </View>
                )}
                <Text
                    style={[
                        styles.titleMenu,
                        danger && styles.dangerTitle,
                    ]}>
                    {title}
                </Text>
            </View>

            {showArrow ? (
                <Icon
                    source="chevron-right"
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