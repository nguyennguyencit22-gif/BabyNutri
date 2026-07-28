import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFCF8',
    },

    keyboardView: {
        flex: 1,
    },

    introContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 30,
    },

    illustration: {
        width: '100%',
        height: 300,
        marginTop: 10,
    },

    description: {
        marginTop: 20,
        color: '#40383D',
        fontSize: 19,
        lineHeight: 28,
    },

    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 26,
    },

    tipIcon: {
        marginRight: 14,
        fontSize: 28,
    },

    tipText: {
        flex: 1,
        color: '#40383D',
        fontSize: 18,
        lineHeight: 27,
    },

    divider: {
        height: 1,
        marginHorizontal: -28,
        marginTop: 34,
        backgroundColor: '#E8DEDB',
    },

    secondaryDescription: {
        marginTop: 30,
        color: '#40383D',
        fontSize: 18,
        lineHeight: 28,
    },

    primaryButton: {
        alignSelf: 'center',
        width: 160,
        marginTop: 'auto',
        borderRadius: 30,
        backgroundColor: '#FF7B88',
    },

    buttonContent: {
        height: 56,
    },

    buttonLabel: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },

    codeContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 34,
    },

    instruction: {
        marginTop: 40,
        color: '#40383D',
        fontSize: 19,
        lineHeight: 28,
    },

    codeInput: {
        marginTop: 32,
        backgroundColor: '#FFFFFF',
    },

    inputOutline: {
        borderRadius: 28,
    },

    inputContent: {
        minHeight: 60,
        paddingHorizontal: 18,
        fontSize: 16,
        fontWeight: '600',
    },

    errorText: {
        marginTop: 8,
        marginLeft: 16,
        color: '#D32F2F',
        fontSize: 13,
    },
    activateButton: {
        width: 180,
        alignSelf: 'center',
        marginTop: 'auto',
        borderRadius: 30,
        backgroundColor: '#FF5F70',
    },

    activateButtonDisabled: {
        backgroundColor: '#FFC2CA',
    },
});

export default styles;