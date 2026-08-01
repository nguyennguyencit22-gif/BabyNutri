import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFF9F7',
    },
    container: {
        flex: 1,
        padding: 24,
    },
    progressBackground: {
        height: 8,
        borderRadius: 8,
        backgroundColor: '#EEDBD7',
        overflow: 'hidden',
    },
    progressValue: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#7A2017',
    },
    stepText: {
        marginTop: 12,
        color: '#9A7672',
        fontSize: 14,
    },
    questionContainer: {
        flex: 1,
    },
    questionContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 16,
    },
    question: {
        marginBottom: 28,
        color: '#5F1813',
        fontSize: 28,
        fontWeight: '700',
    },
    input: {
        borderWidth: 1,
        borderColor: '#C8A5A1',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    optionButton: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#C8A5A1',
        borderRadius: 14,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    optionButtonSelected: {
        borderColor: '#7A2017',
        backgroundColor: '#FCE8E3',
    },
    optionText: {
        color: '#3C2825',
        fontSize: 16,
    },
    optionTextSelected: {
        color: '#7A2017',
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#7A2017',
        borderRadius: 14,
        paddingVertical: 15,
    },
    backButtonText: {
        color: '#7A2017',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 2,
        alignItems: 'center',
        borderRadius: 14,
        paddingVertical: 15,
        backgroundColor: '#7A2017',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dateDescription: {
        marginTop: 110,
        marginBottom: 36,
        paddingHorizontal: 24,
        color: '#8C7A77',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },

    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    datePickerBox: {
        flex: 1,
        height: 52,
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1.3,
        borderColor: '#9C8985',
        borderRadius: 8,
        backgroundColor: '#FFF9F7',
    },

    datePicker: {
        width: '100%',
        height: 52,
        color: '#2D1714',
    },

    agePreview: {
        marginTop: 22,
        color: '#7B312A',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
});
export default styles;