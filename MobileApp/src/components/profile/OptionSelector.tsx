import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import createStyles from '../../styles/profile/optionsSelectorStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const ChevronRightIcon = ({ size = 24, color = '#4B3034' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

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

            <ChevronRightIcon
                size={24}
                color={colors.text}
            />
        </Pressable>
    );
}

export default OptionSelector;