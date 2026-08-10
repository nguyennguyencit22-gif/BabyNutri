import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import createStyles from '../../styles/profile/weightHeightFieldsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'in';

type WeightHeightFieldsProps = {
    weightText: string;
    weightUnit: WeightUnit;
    onChangeWeightText: (text: string) => void;
    onChangeWeightUnit: (unit: WeightUnit) => void;

    heightText: string;
    heightUnit: HeightUnit;
    onChangeHeightText: (text: string) => void;
    onChangeHeightUnit: (unit: HeightUnit) => void;
};

// Only digits and a single decimal point — otherwise a controlled TextInput
// bound to Number(text) snaps "1." back to "1" and the dot can't be typed.
function sanitizeDecimal(text: string): string {
    const digitsAndDot = text.replace(/[^0-9.]/g, '');
    const [wholePart, ...rest] = digitsAndDot.split('.');

    return rest.length > 0
        ? `${wholePart}.${rest.join('')}`
        : digitsAndDot;
}

function UnitRadio({
    label,
    selected,
    onPress,
    styles,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
    styles: ReturnType<typeof createStyles>;
}) {
    return (
        <Pressable onPress={onPress} style={styles.unitOption}>
            <View
                style={[
                    styles.unitRadio,
                    selected && styles.unitRadioSelected,
                ]}
            />

            <Text style={styles.unitLabel}>
                {label}
            </Text>
        </Pressable>
    );
}

function WeightHeightFields({
    weightText,
    weightUnit,
    onChangeWeightText,
    onChangeWeightUnit,
    heightText,
    heightUnit,
    onChangeHeightText,
    onChangeHeightUnit,
}: WeightHeightFieldsProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <>
            <Text style={styles.sectionLabel}>
                Weight
            </Text>

            <View style={styles.unitRow}>
                <UnitRadio
                    label="pounds"
                    selected={weightUnit === 'lb'}
                    onPress={() => onChangeWeightUnit('lb')}
                    styles={styles}
                />
                <UnitRadio
                    label="kg"
                    selected={weightUnit === 'kg'}
                    onPress={() => onChangeWeightUnit('kg')}
                    styles={styles}
                />
            </View>

            <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={weightText}
                onChangeText={text =>
                    onChangeWeightText(sanitizeDecimal(text))
                }
                placeholder="0.0"
                placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.sectionLabel}>
                Height
            </Text>

            <View style={styles.unitRow}>
                <UnitRadio
                    label="inches"
                    selected={heightUnit === 'in'}
                    onPress={() => onChangeHeightUnit('in')}
                    styles={styles}
                />
                <UnitRadio
                    label="cm"
                    selected={heightUnit === 'cm'}
                    onPress={() => onChangeHeightUnit('cm')}
                    styles={styles}
                />
            </View>

            <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={heightText}
                onChangeText={text =>
                    onChangeHeightText(sanitizeDecimal(text))
                }
                placeholder="0.0"
                placeholderTextColor={colors.textMuted}
            />
        </>
    );
}

export default WeightHeightFields;
