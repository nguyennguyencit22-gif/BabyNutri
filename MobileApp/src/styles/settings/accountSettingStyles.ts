import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F7F3F2',
    },

    profileCard: {
        minHeight: 250,
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 10,
        paddingHorizontal: 28,

        backgroundColor: '#FFFFFF',
    },

    avatarWrapper: {
        position: 'relative',
    },

    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
    },

    cameraButton: {
        position: 'absolute',
        right: -8,
        top: -6,

        width: 42,
        height: 42,
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 3,
        borderColor: '#FFFFFF',
        backgroundColor: '#B7A8B0',
    },

    email: {
        flex: 1,
        marginLeft: 26,

        color: '#40383D',
        fontSize: 20,
    },

    actionRow: {
        minHeight: 105,
        justifyContent: 'center',

        marginTop: 4,
        paddingHorizontal: 28,

        backgroundColor: '#FFFFFF',
    },

    actionRowPressed: {
        backgroundColor: '#FFF0EA',
    },

    actionText: {
        color: '#40383D',
        fontSize: 22,
        fontWeight: '700',
    },
});

export default styles;