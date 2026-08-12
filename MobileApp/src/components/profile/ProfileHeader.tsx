import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import createStyles from '../../styles/profile/profileComponentStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const ArrowLeftIcon = ({ size = 24, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

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