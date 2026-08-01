import { StyleSheet } from 'react-native';

const loginStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 8,
        paddingBottom: 32,
    },

    closeButton: {
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
    },

    closeIcon: {
        fontSize: 52,
        lineHeight: 52,
        fontWeight: '400',
        color: '#52150F',
    },

    header: {
        alignItems: 'center',
        marginTop: 56,
    },

    title: {
        fontSize: 32,
        fontWeight: '500',
        color: '#52150F',
    },

    subtitle: {
        marginTop: 4,
        textAlign: 'center',
        fontSize: 25,
        lineHeight: 32,
        fontWeight: '400',
        color: '#52150F',
    },

    description: {
        marginTop: 76,
        fontSize: 18,
        lineHeight: 27,
        fontWeight: '400',
        color: '#B89592',
    },

    countryRow: {
        marginTop: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    countryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    flagCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D6251F',
    },

    flagText: {
        fontSize: 21,
        color: '#FFE600',
    },

    countryName: {
        marginLeft: 28,
        fontSize: 21,
        fontWeight: '400',
        color: '#52150F',
    },

    editText: {
        fontSize: 19,
        fontWeight: '500',
        color: '#52150F',
    },

    googleButton: {
        height: 66,
        marginTop: 54,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#B89592',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    buttonPressed: {
        opacity: 0.75,
    },

    googleLogo: {
        width: 36,
        height: 36,
    },

    googleButtonText: {
        flex: 1,
        textAlign: 'right',
        fontSize: 20,
        fontWeight: '400',
        color: '#090909',
    },

    agreement: {
        marginTop: 52,
    },

    agreementText: {
        marginBottom: 15,
        fontSize: 18,
        lineHeight: 26,
        color: '#52150F',
    },

    linkContainer: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },

    linkText: {
        fontSize: 18,
        fontWeight: '500',
        textDecorationLine: 'underline',
        color: '#52150F',
    },
    googleButtonDisabled:{
        opacity: 0.55,
    },
});

export default loginStyles;