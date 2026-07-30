import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import styles from '../../styles/profile/addBabyProfileStyles';

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
                placeholderTextColor="#B89296"

                outlineColor="#F3E5E1"
                activeOutlineColor="#5B0010"

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