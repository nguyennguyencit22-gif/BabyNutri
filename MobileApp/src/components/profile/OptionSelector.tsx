import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/optionsSelectorStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type OptionSelectorProps = {
    label: string;
    selectedOptions: string[];
    onPress: () => void;
};

function OptionSelector({
    label,
    selectedOptions,
    onPress,
}: OptionSelectorProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const safeOptions = Array.isArray(selectedOptions) ? selectedOptions : [];
    const summary =
        safeOptions.length > 0
            ? `${safeOptions.length} selected`
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
                color={colors.text}
            />
        </Pressable>
    );
}

export default OptionSelector;