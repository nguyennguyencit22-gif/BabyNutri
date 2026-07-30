import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        width: 185,
        marginRight: 16,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',

        elevation: 3,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.16,
        shadowRadius: 6,
    },

    pressed: {
        opacity: 0.88,
    },

    image: {
        width: 125,
        height: 125,
        alignSelf: 'center',
        marginTop: 14,
        borderRadius: 63,
        backgroundColor: '#F2E4E0',
    },

    content: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 16,
        paddingBottom: 18,
    },

    title: {
        minHeight: 48,
        color: '#3F3032',
        fontSize: 16,
        lineHeight: 22,
        fontWeight: '700',
        textAlign: 'center',
    },

    timeLabel: {
        marginTop: 14,
        color: '#D0C2C4',
        fontSize: 13,
    },

    time: {
        marginTop: 3,
        color: '#8C7B7E',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default styles;