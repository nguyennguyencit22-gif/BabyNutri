import React from 'react';
import {
    Button,

    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, } from "react-native-safe-area-context";

function RegisterScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Register Screen</Text>

                <Button
                    title="Back to Login"
                    onPress={() => navigation.goBack()}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginBottom: 16,
        fontSize: 28,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;