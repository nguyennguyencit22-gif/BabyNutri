import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    card: {
        width: 270,
        backgroundColor: 'transparent',
        elevation: 0,
    },

    cardContent: {
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    ageCircle: {
        width: 75,
        height: 75,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#5B0010',
        marginBottom: 18,

        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    ageText: {
        color: '#FFFFFF',
        fontSize: 14,
        lineHeight: 10,
        fontWeight: '700',
        textAlign: 'center',
    },

    title: {
        color: '#5B0010',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },

    description: {
        color: '#5B0010',
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        minHeight: 70,
    },

    button: {
        width: '100%',
        borderRadius: 30,
        marginTop: 12,
    },

    buttonContent: {
        height: 50,
    },
});

export default styles;