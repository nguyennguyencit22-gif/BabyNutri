import React from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import styles from '../../styles/profile/profileComponentStyles';

type ProfileHeaderProps = {
    title: string;
    onBack?: () => void;
};

function ProfileHeader({
    title,
    onBack,
}: ProfileHeaderProps) {
    return (
        <View style={styles.container}>
            <IconButton
                icon="arrow-left"
                style={styles.backButton}
                onPress={onBack}
            />

            <Text style={styles.title}>
                {title}
            </Text>
        </View>
    );
}

export default ProfileHeader;