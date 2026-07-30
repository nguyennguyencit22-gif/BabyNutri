import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-start',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(35, 20, 25, 0.30)',
    },

    modalCard: {
        maxHeight: 360,

        marginTop: 92,
        marginHorizontal: 20,

        borderRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 10,

        backgroundColor: '#FFFFFF',

        elevation: 12,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 12,
    },

    title: {
        marginBottom: 10,
        color: '#5B0010',
        fontSize: 19,
        fontWeight: '700',
    },

    babyRow: {
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 8,
        borderRadius: 16,
    },

    babyRowSelected: {
        backgroundColor: '#FFF0EA',
    },

    babyRowPressed: {
        opacity: 0.75,
    },

    avatar: {
        elevation: 3,
    },

    avatarLabel: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },

    babyInfo: {
        flex: 1,
        marginLeft: 14,
    },

    babyName: {
        color: '#5B0010',
        fontSize: 18,
        fontWeight: '600',
    },

    babyNameSelected: {
        color: '#FF5F70',
    },

    babyAge: {
        marginTop: 4,
        color: '#9A7B80',
        fontSize: 14,
    },
});

export default styles;