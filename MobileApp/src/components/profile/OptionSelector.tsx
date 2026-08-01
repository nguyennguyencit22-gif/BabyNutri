import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/optionsSelectorStyles';

type OptionSelectorProps = {
    label: string;
    selectedOptions: string[];
    onPress: () => void;
};

function OptionSelector({
    label,
    selectedOptions,
    onPress,
}:OptionSelectorProps) {
    const summary =
        selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
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
                    {label}
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

export default OptionSelector;