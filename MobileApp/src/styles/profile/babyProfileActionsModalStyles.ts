import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(40, 25, 30, 0.35)',
    },

    sheet: {
        marginHorizontal: 16,
        marginBottom: 18,

        borderRadius: 24,
        overflow: 'hidden',

        backgroundColor: '#FFFFFF',

        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 10,
    },

    actionRow: {
        minHeight: 58,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 18,
        backgroundColor: '#FFFFFF',
    },

    actionRowPressed: {
        backgroundColor: '#FFF3F0',
    },

    actionText: {
        marginLeft: 18,
        color: '#5B0010',
        fontSize: 16,
    },
});

export default styles;