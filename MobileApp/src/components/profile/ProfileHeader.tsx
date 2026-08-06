import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type ProfileHeaderProps = {
    title: string;
    onBack?: () => void;
};

function ProfileHeader({
    title,
    onBack,
}: ProfileHeaderProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <View style={styles.container}>
            {onBack && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    activeOpacity={0.8}
                >
                    <ArrowLeftIcon size={24} color={colors.primary || "#FF5F70"} />
                </TouchableOpacity>
            )}

            <Text style={styles.title}>
                {title}
            </Text>
        </View>
    );
}

export default ProfileHeader;