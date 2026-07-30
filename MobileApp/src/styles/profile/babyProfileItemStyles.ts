import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 16,
        backgroundColor: '#FFFCF8',
    },

    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: '#FF5F70',
        fontSize: 24,
        fontWeight: '500',
    },

    info: {
        flex: 1,
        marginLeft: 14,
    },

    name: {
        color: '#5B0010',
        fontSize: 17,
        fontWeight: '500',
    },

    age: {
        marginTop: 4,
        color: '#B28A8F',
        fontSize: 14,
    },
    deleteAction: {
        width: 96,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
    },

    deleteText: {
        marginTop: 4,
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
});

export default styles;