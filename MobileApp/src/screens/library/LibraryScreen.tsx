import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

function LibraryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Library
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F2',
    },
    title: {
        color: '#5B0010',
        fontSize: 24,
        fontWeight: '700',
    },
});

export default LibraryScreen;