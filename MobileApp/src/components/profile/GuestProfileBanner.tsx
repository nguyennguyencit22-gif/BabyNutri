import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';

import createStyles from '../../styles/profile/guestProfileBannerStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type GuestProfileBannerProps = {
    onLogin: () => void;
};

function GuestProfileBanner({
    onLogin,
}: GuestProfileBannerProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

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