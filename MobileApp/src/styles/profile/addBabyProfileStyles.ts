import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    //Avatar
    container: {
        height: 150,
        marginTop: 18,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.surfaceAlt,
    },

    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,

        alignItems: 'center',
        justifyContent: 'center',
    },

    cameraButton: {
        position: 'absolute',

        width: 42,
        height: 42,
        borderRadius: 21,

        right: '35%',
        bottom: 20,

        alignItems: 'center',
        justifyContent: 'center',

        borderWidth: 3,
        borderColor: colors.surfaceAlt,

        backgroundColor: colors.border,
    },

    cameraButtonPressed: {
        opacity: 0.75,
        transform: [
            {
                scale: 0.95,
            },
        ],
    },

    testText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    //Avatar
    //Input
    containerInput: {
        marginTop: 26,
    },

    label: {
        marginBottom: 12,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },

    input: {
        backgroundColor: colors.surface,
    },

    outline: {
        borderRadius: 28,
        borderWidth: 1.5,
    },

    inputContent: {
        paddingHorizontal: 18,
        fontSize: 15,
    },
    errorText: {
        marginTop: 6,
        marginLeft: 14,
        color: colors.danger,
        fontSize: 13,
    },
    //Input

    // Color Picker
    containerColor: {
        marginTop: 24,
    },

    labelColor: {
        marginBottom: 14,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },

    colorPanel: {
        minHeight: 90,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 34,

        paddingHorizontal: 14,
        paddingVertical: 14,

        backgroundColor: colors.surface,
    },

    colorOption: {
        width: 46,
        height: 46,
        borderWidth: 1.5,
        borderRadius: 23,

        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.surface,
    },

    colorOptionSelected: {
        borderWidth: 3,
        transform: [
            {
                scale: 1.08,
            },
        ],
    },

    colorOptionPressed: {
        opacity: 0.75,
    },

    colorCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    // Coler Picker
    // Gender select
    containerGender: {
        flexDirection: 'row',
        alignItems: 'center',

        marginTop: 20,
        borderRadius: 34,
        padding: 6,

        backgroundColor: colors.surfaceAlt,
    },

    option: {
        flex: 1,
        minHeight: 58,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 28,
    },

    optionSelected: {
        backgroundColor: colors.surface,

        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    optionPressed: {
        opacity: 0.75,
    },

    genderOptionText: {
        marginLeft: 12,
        color: colors.textSoft,
        fontSize: 20,
        fontWeight: '600',
    },

    optionTextSelected: {
        color: colors.text,
    },
    // Gender select
    //Allergies Modal
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: colors.overlay,
    },

    modalContainer: {
        maxHeight: '72%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 24,
        backgroundColor: colors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        marginBottom: 12,
        paddingHorizontal: 8,
    },

    title: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },

    optionRow: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',

        borderBottomWidth: 1,
        borderBottomColor: colors.border,

        paddingHorizontal: 10,
    },

    radioOuter: {
        width: 24,
        height: 24,
        borderWidth: 1.5,
        borderColor: colors.text,
        borderRadius: 12,

        alignItems: 'center',
        justifyContent: 'center',

        marginRight: 18,
    },

    radioOuterSelected: {
        borderColor: colors.primary,
    },

    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },

    modalOptionText: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
    },

    doneButton: {
        marginTop: 18,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 26,
        backgroundColor: colors.primary,
    },

    doneButtonText: {
        color: colors.onPrimary,
        fontSize: 17,
        fontWeight: '700',
    },
    //Allergies Modal

});

export default createStyles;
