import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFCF8',
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    title: {
        color: '#5B0010',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },

    profileCard: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#FFF0EA',
    },

    avatar: {
        width: 78,
        height: 78,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 39,
        backgroundColor: '#FF5F70',
    },

    avatarText: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: '700',
    },

    userInfo: {
        marginLeft: 16,
        flex: 1,
    },

    name: {
        color: '#5B0010',
        fontSize: 22,
        fontWeight: '700',
    },

    email: {
        marginTop: 6,
        color: '#8B5F65',
        fontSize: 15,
    },

    testText: {
        marginTop: 30,
        color: '#8B5F65',
        fontSize: 16,
        textAlign: 'center',
    },

    sectionLabel: {
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 8,

        color: '#7F7478',
        fontSize: 13,
        fontWeight: '500',
    },

    otherSettingLabel: {
        marginTop: 28,
        marginBottom: 8,
        marginLeft: 8,

        color: '#7F7478',
        fontSize: 12,
        fontWeight: '500',
    },
    deactiveAccount: {
        marginBottom: 10
    }
});

export default styles;