import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const AccountIcon = ({ size = 72, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const CameraIcon = ({ size = 24, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

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
                    <AccountIcon
                        size={64}
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
                <CameraIcon
                    size={22}
                    color="#FFFFFF"
                />
            </Pressable>
        </View>
    );
}

export default BabyAvatarPicker;