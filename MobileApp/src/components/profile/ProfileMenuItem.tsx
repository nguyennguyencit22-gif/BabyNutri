import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/profileComponentStyles';

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
                                    ? '#FF2B2B'
                                    : '#5B0010'
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
                <Icon
                    source="chevron-right"
                    size={28}
                    color={
                        danger
                            ? '#FF2B2B'
                            : '#5B0010'
                    }
                />
            ) : null}
        </Pressable>
    );
}

export default ProfileMenuItem;