import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
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
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                activeOpacity={0.8}
            >
                <ArrowLeftIcon size={24} color="#FF5F70" />
            </TouchableOpacity>

            <Text style={styles.title}>
                {title}
            </Text>
        </View>
    );
}

export default ProfileHeader;