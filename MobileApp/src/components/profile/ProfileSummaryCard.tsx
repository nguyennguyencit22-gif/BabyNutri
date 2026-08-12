import React from 'react';
import {
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

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
                    <Icon
                        source="camera"
                        size={22}
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