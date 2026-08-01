import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/addBabyProfileStyles';

export type BabyGender = 'boy' | 'girl';

type GenderSelectorProps = {
    selectedGender: BabyGender;
    onSelectGender: (gender: BabyGender) => void;
};

function GenderSelector({
    selectedGender,
    onSelectGender,
}: GenderSelectorProps) {
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
                    color="#5B0010"
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
                <Icon
                    source="face-woman"
                    size={34}
                    color="#5B0010"
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