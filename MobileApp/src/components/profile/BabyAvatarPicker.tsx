import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type BabyAvatarPickerProps = {
    imageUri?: string | null;
    profileColor?: string;
    onPressCamera?: () => void;
};

function BabyAvatarPicker({
    imageUri,
    profileColor = '#FF8AA0',
    onPressCamera,
}: BabyAvatarPickerProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.avatarCircle,
                    {
                        backgroundColor: profileColor,
                    },
                ]}>

                {imageUri ? (
                    <Text style={styles.testText}>
                        Image
                    </Text>
                ) : (
                    <Icon
                        source="account-outline"
                        size={72}
                        color={colors.onPrimary}
                    />
                )}
            </View>

            <Pressable
                onPress={onPressCamera}
                style={({ pressed }) => [
                    styles.cameraButton,
                    pressed && styles.cameraButtonPressed,
                ]}>
                <Icon
                    source="camera"
                    size={24}
                    color="#FFFFFF"
                />
            </Pressable>
        </View>
    );
}

export default BabyAvatarPicker;