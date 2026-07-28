import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/allergySelectorStyles';

type AllergySelectorProps = {
    selectedAllergies: string[];
    onPress: () => void;
};

function AllergySelector({
    selectedAllergies,
    onPress,
}: AllergySelectorProps) {
    const summary =
        selectedAllergies.length > 0
            ? `${selectedAllergies.length} selected`
            : '';

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}>
            <View style={styles.textContent}>
                <Text style={styles.label}>
                    Allergies
                </Text>

                {summary ? (
                    <Text style={styles.summary}>
                        {summary}
                    </Text>
                ) : null}
            </View>

            <Icon
                source="chevron-right"
                size={30}
                color="#5B0010"
            />
        </Pressable>
    );
}

export default AllergySelector;