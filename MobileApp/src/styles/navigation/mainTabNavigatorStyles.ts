import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        overflow: 'hidden',
    },

    blurFill: {
        ...StyleSheet.absoluteFill,
    },

    pill: {
        position: 'absolute',
        top: 0,
        height: 58,
        borderRadius: 29,

        backgroundColor: '#FF5A6E',

        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },

    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    indicator: {
        marginTop: 4,
        width: 16,
        height: 3,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },

    indicatorActive: {
        backgroundColor: '#FFFFFF',
    },
});

export default styles;
