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

import { ChevronRightIcon } from 'react-native-heroicons/outline';

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
                            ? '#FF2B2B'
                            : '#FF5F70'
                    }
                />
            ) : null}
        </Pressable>
    );
}

export default ProfileMenuItem;