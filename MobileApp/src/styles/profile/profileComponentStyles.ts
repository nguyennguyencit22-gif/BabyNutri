import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    //Header
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        paddingTop: 12,
        paddingBottom: 0,
    },

    backButton: {
        position: 'absolute',
        left: 0,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#5B0010',
    },
    //Header

    //Profile Card
    card: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        borderWidth: 1,
        borderColor: '#F0D9D3',
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF0EA',
    },

    avatarWrapper: {
        position: 'relative',
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F2D7D2',
    },

    avatarFallback: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF5F70',
    },

    avatarText: {
        color: '#FFFFFF',
        fontSize: 34,
        fontWeight: '700',
    },

    cameraButton: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        width: 38,
        height: 38,
        borderWidth: 3,
        borderColor: '#FFF0EA',
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C735E8',
    },

    cameraButtonPressed: {
        opacity: 0.8,
        transform: [
            {
                scale: 0.95,
            },
        ],
    },

    userInfo: {
        flex: 1,
        marginLeft: 18,
    },

    name: {
        color: '#5B0010',
        fontSize: 22,
        fontWeight: '700',
    },

    email: {
        marginTop: 6,
        color: '#7F4E56',
        fontSize: 15,
    },
    //Profile Card

    // Menu Item
    containerMenu: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 10,
        backgroundColor: '#FFFCF8',
    },

    pressed: {
        opacity: 0.65,
    },

    leftContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconCircle: {
        width: 42,
        height: 42,
        borderWidth: 1,
        borderColor: '#EFE7E4',
        borderRadius: 21,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 14,
        backgroundColor: '#FFFFFF',

        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },

    titleMenu: {
        flexShrink: 1,
        color: '#5B0010',
        fontSize: 16,
        fontWeight: '400',
    },

    dangerTitle: {
        color: '#FF2B2B',
    },
    //Menu Item
});

export default styles;