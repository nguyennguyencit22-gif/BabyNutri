import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';

import styles from '../../styles/profile/guestProfileBannerStyles';

type GuestProfileBannerProps = {
    onLogin: () => void;
};

function GuestProfileBanner({
    onLogin,
}: GuestProfileBannerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Never lose your data!
            </Text>

            <Text style={styles.description}>
                To synchronize and restore your
                data, create an account or log in.
            </Text>

            <Pressable
                onPress={onLogin}
                style={({ pressed }) => [
                    styles.loginButton,
                    pressed &&
                    styles.loginButtonPressed,
                ]}>
                <Text
                    style={
                        styles.loginButtonText
                    }>
                    Log in
                </Text>
            </Pressable>
        </View>
    );
}

export default GuestProfileBanner;