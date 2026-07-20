import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";

type AppInputProps = TextInputProps & { label: string; error?: string };

function AppInput({ label, error, style, ...textInputProps }: AppInputProps) {

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
            </Text>
            <TextInput
                {...textInputProps}
                style={[
                    styles.input,
                    error ? styles.inputError : undefined,
                    style,
                ]}
                placeholder="#888"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    input: {
        height: 48,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        color: '#111',
    },
    label: {
        marginBottom: 6,
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    inputError: {
        borderColor: '#D92D20'
    },
    error: {
        marginTop: 5,
        fontSize: 13,
        color: "#D92D20"
    },
});

export default AppInput;
