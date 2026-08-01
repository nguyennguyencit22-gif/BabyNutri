import {
    StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 18,
        alignItems: 'center',
        backgroundColor: '#FFD2D9',
    },

    title: {
        color: '#5B0010',
        fontSize: 17,
        fontWeight: '700',
    },

    description: {
        marginTop: 8,
        color: '#7F5058',
        fontSize: 14,
        lineHeight: 21,
        textAlign: 'center',
    },

    loginButton: {
        marginTop: 12,
        minWidth: 96,
        paddingHorizontal: 20,
        paddingVertical: 9,
        borderRadius: 22,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    loginButtonPressed: {
        opacity: 0.75,
    },

    loginButtonText: {
        color: '#5B0010',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default styles;