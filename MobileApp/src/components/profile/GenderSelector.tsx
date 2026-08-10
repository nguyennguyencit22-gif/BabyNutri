import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const BoyIcon = ({ size = 32, color = '#3B82F6' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="7" r="4" />
    <Path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
  </Svg>
);

const GirlIcon = ({ size = 32, color = '#EC4899' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="7" r="4" />
    <Path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
  </Svg>
);

export type BabyGender = 'boy' | 'girl';

type GenderSelectorProps = {
    selectedGender: BabyGender;
    onSelectGender: (gender: BabyGender) => void;
};

function GenderSelector({
    selectedGender,
    onSelectGender,
}: GenderSelectorProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <View style={styles.containerGender}>
            <Pressable
                onPress={() => onSelectGender('boy')}
                style={({ pressed }) => [
                    styles.option,
                    selectedGender === 'boy' &&
                    styles.optionSelected,
                    pressed && styles.optionPressed,
                ]}>
                <BoyIcon
                    size={30}
                    color={selectedGender === 'boy' ? colors.primary : colors.textSoft}
                />

                <Text
                    style={[
                        styles.genderOptionText,
                        selectedGender === 'boy' &&
                        styles.optionTextSelected,
                    ]}>
                    Boy
                </Text>
            </Pressable>

            <Pressable
                onPress={() => onSelectGender('girl')}
                style={({ pressed }) => [
                    styles.option,
                    selectedGender === 'girl' &&
                    styles.optionSelected,
                    pressed && styles.optionPressed,
                ]}>
                <GirlIcon
                    size={30}
                    color={selectedGender === 'girl' ? colors.primary : colors.textSoft}
                />

                <Text
                    style={[
                        styles.genderOptionText,
                        selectedGender === 'girl' &&
                        styles.optionTextSelected,
                    ]}>
                    Girl
                </Text>
            </Pressable>
        </View>
    );
}

export default GenderSelector;