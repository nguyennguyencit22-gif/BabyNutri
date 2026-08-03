import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

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
                <Icon
                    source="face-man"
                    size={34}
                    color={colors.text}
                />

                <Text
                    style={[
                        styles.optionText,
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
                <Icon
                    source="face-woman"
                    size={34}
                    color={colors.text}
                />

                <Text
                    style={[
                        styles.optionText,
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