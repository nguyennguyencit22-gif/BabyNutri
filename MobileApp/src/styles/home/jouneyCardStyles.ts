import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    card: {
        width: 250,
        backgroundColor: 'transparent',
        elevation: 0,
    },

    cardContent: {
        alignItems: 'center',
        paddingHorizontal: 18,
        
    },

    ageCircle: {
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',

    },

    ageNumberText: {
        color: '#FFFFFF',
        fontSize: 20,
        lineHeight: 24,
        fontWeight: '800',
        fontStyle: 'italic',
        textAlign: 'center',
    },

    ageUnitText: {
        color: '#FFFFFF',
        fontSize: 13,
        lineHeight: 16,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
    },

    title: {
        color: '#5B0010',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },

    description: {
        color: '#8A5A63',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        minHeight: 60,
    },

    button: {
        width: '60%',
        borderRadius: 30,
    },

    buttonContent: {
        height: 46,
    },

    buttonLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
});

export default styles;
