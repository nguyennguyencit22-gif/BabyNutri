import React from 'react';
import {
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CameraIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

type ProfileSummaryCardProps = {
    name: string;
    email: string;
    imageUrl?: string;
    onChangePhoto?: () => void;
    onPress?: () => void;
};

function ProfileSummaryCard({
    name,
    email,
    imageUrl,
    onChangePhoto,
    onPress,
}: ProfileSummaryCardProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && onPress && styles.pressed,
            ]}
            onPress={onPress}
            disabled={!onPress}>
            <View style={styles.avatarWrapper}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>
                            {name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}

                <Pressable
                    onPress={onChangePhoto}
                    style={({ pressed }) => [
                        styles.cameraButton,
                        pressed && styles.cameraButtonPressed,
                    ]}>
                    <CameraIcon
                        size={18}
                        color="#FFFFFF"
                    />
                </Pressable>
            </View>

            <View style={styles.userInfo}>
                <Text
                    numberOfLines={1}
                    style={styles.name}>
                    {name}
                </Text>

                <Text
                    numberOfLines={1}
                    style={styles.email}>
                    {email}
                </Text>
            </View>
        </Pressable>
    );
}

export default ProfileSummaryCard;