import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF9',
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 42,
    },

    deleteButton: {
        position: 'absolute',
        top: 60,
        right: 18,
        zIndex: 10,
    },

    updateButton: {
        width: 150,
        alignSelf: 'center',
        marginTop: 28,
        borderRadius: 30,
        backgroundColor: '#FF5F70',
    },

    buttonContent: {
        height: 52,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default styles;