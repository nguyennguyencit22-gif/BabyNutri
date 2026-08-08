import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type BabyNameInputProps = {
    value: string;
    error?: string;
    onChangeText: (text: string) => void;
};

function BabyNameInput({
    value,
    error,
    onChangeText,
}: BabyNameInputProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <View style={styles.containerInput}>
            <Text style={styles.label}>
                Baby name
            </Text>

            <TextInput
                mode="outlined"
                placeholder="Add Name"
                value={value}
                error={Boolean(error)}
                onChangeText={onChangeText}
                placeholderTextColor={colors.textMuted}

                outlineColor={colors.border}
                activeOutlineColor={colors.text}

                style={styles.input}
                outlineStyle={styles.outline}
                contentStyle={styles.inputContent}
            />
            {error ? (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

export default BabyNameInput;