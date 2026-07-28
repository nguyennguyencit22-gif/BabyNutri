import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/addBabyProfileStyles';

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
                        color="#FFFFFF"
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