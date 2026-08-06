import { StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 34,
    },

    //Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 18,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
    },
    babyName: {
        marginLeft: 12,
        color: colors.primary,
        fontSize: 22,
        fontWeight: '700',
    },
    babyAge: {
        marginTop: 2,
        marginLeft: 12,
        color: colors.textSoft,
        fontSize: 13,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
    },
    placeholderSection: {
        marginHorizontal: 20,
        marginTop: 28,
        borderRadius: 24,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
    },
    placeholderTitle: {
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
    },
    placeholderText: {
        marginTop: 10,
        color: colors.textSoft,
        fontSize: 15,
        lineHeight: 22,
    },
    // Menu
    categoryList: {
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 18,
        paddingBottom: 8,
    },

    categoryButton: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        backgroundColor: colors.surface,
    },

    categoryButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    categoryText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },

    categoryTextActive: {
        color: colors.onPrimary,
    },
    //Menu

    //Weaning Introduction
    weaningSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },

    weaningTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },

    weaningDescription: {
        marginTop: 10,
        textAlign: 'center',
        color: colors.textSoft,
        lineHeight: 22,
    },

    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },

    featureIcon: {
        marginRight: 12,
    },

    featureText: {
        fontSize: 16,
        color: colors.text,
    },
    // Weaning Introduction
    //Journey Section
    journeySection: {
        backgroundColor: '#92D8EC',
        marginTop: 28,
        paddingTop: 28,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#5B0010',
    },

    journeyTitle: {
        color: '#5B0010',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
    },

    journeyListContent: {
        paddingHorizontal: 20,
    },

    cardSeparator: {
        width: 16,
    },
    //Journey Section
    // Expert Card
    expertSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 26,
        alignItems: 'center',
    },

    expertSectionTitle: {
        marginBottom: 20,
        color: colors.text,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },

    expertList: {
        gap: 14,
        paddingHorizontal: 4,
    },

    expertDescription: {
        marginTop: 24,
        color: colors.text,
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },

    expertButton: {
        marginTop: 18,
        minWidth: 150,
        alignItems: 'center',
        borderRadius: 22,
        paddingHorizontal: 26,
        paddingVertical: 12,
        backgroundColor: '#FFD34E',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#5B0010',
    },

    expertButtonText: {
        color: '#5B0010',
        fontSize: 15,
        fontWeight: '700',
    },
    // Expert Card
    //Popular Recipe
    popularSection: {
        paddingTop: 24,
        paddingBottom: 34,
        backgroundColor: '#A896F4',
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#FFFFFF',
    },

    popularTitle: {
        paddingHorizontal: 20,
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
    },

    popularCategoryList: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 22,
    },

    popularChip: {
        marginRight: 10,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#8C44ED',
    },

    popularChipActive: {
        backgroundColor: '#8C44ED',
        borderColor: '#FFFFFF',
    },

    popularChipText: {
        color: '#8C00D8',
        fontSize: 13,
        fontWeight: '700',
    },

    popularChipTextActive: {
        color: '#FFFFFF',
    },

    recipeList: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    //Popular Recipe

});

export default createStyles;
