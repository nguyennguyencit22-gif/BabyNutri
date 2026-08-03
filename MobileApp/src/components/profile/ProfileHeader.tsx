import React from 'react';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
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