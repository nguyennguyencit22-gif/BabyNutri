import React from 'react';
import {
    Button,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

function HomeScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>BabyNutri Home</Text>

                <Button
                    title="Open Profile"
                    onPress={() => navigation.navigate('Profile')}
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

export default HomeScreen;