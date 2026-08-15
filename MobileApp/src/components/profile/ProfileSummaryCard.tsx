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
    roleLabel?: string;
    onChangePhoto?: () => void;
    onPress?: () => void;
};

function ProfileSummaryCard({
    name,
    email,
    imageUrl,
    roleLabel,
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
                    <View style={[styles.avatarFallback, roleLabel === 'Administrator' && { backgroundColor: '#8B5CF6' }]}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                        numberOfLines={1}
                        style={[styles.name, { flexShrink: 1 }]}>
                        {name}
                    </Text>
                    {!!roleLabel && (
                        <View style={{ backgroundColor: roleLabel === 'Administrator' ? '#EDE9FE' : '#FFF0F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: roleLabel === 'Administrator' ? '#8B5CF6' : '#FF5F70' }}>
                                {roleLabel}
                            </Text>
                        </View>
                    )}
                </View>

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