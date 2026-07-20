import React from 'react';
import {
    Button,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

function ProfileScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Profile Screen</Text>

                <Button
                    title="Back to Home"
                    onPress={() => navigation.goBack()}
                />

                <Button
                    title="Logout temporarily"
                    onPress={() => navigation.replace('Login')}
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
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;