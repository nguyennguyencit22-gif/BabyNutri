import { StyleSheet } from 'react-native';

const welcomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: '#FFD8CC',
    },

    content: {
        position: 'absolute',
        top: '31%',
        left: 24,
        right: 24,
        alignItems: 'center',
    },

    logo: {
        width: 145,
        height: 145,
        marginBottom: 22,
    },

    title: {
        fontSize: 30,
        lineHeight: 38,
        fontWeight: '700',
        textAlign: 'center',
        color: '#5C0C0C',
    },

    subtitle: {
        marginTop: 18,
        paddingHorizontal: 8,
        fontSize: 18,
        lineHeight: 26,
        fontWeight: '400',
        textAlign: 'center',
        color: '#6D1A1A',
    },

    bottomSection: {
        position: 'absolute',
        left: 34,
        right: 34,
        bottom: 64,
    },

    loginRow: {
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    loginText: {
        fontSize: 16,
        lineHeight: 22,
        color: '#5C0C0C',
    },

    loginLink: {
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '700',
        color: '#EF6872',
    },
});

export default welcomeStyles;