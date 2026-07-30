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
        justifyContent: 'center',
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
});
export default styles;