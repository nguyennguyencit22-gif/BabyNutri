import { StyleSheet } from 'react-native';
import { HomeColors } from '../../constants/generalHome/homeTheme';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 120,
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
        backgroundColor: HomeColors.primary,
    },
    babyName: {
        marginLeft: 12,
        color: HomeColors.primary,
        fontSize: 22,
        fontWeight: '700',
    },
    babyAge: {
        marginTop: 2,
        marginLeft: 12,
        color: HomeColors.textSoft,
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
        backgroundColor: '#FFC6D0',
    },
    placeholderSection: {
        marginHorizontal: 20,
        marginTop: 28,
        borderRadius: 24,
        padding: 24,
        backgroundColor: HomeColors.surface,
    },
    placeholderTitle: {
        color: HomeColors.text,
        fontSize: 22,
        fontWeight: '700',
    },
    placeholderText: {
        marginTop: 10,
        color: HomeColors.textSoft,
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
    },

    categoryButtonActive: {
        backgroundColor: HomeColors.primary,
    },

    categoryText: {
        color: HomeColors.primary,
        fontSize: 15,
        fontWeight: "500",
    },

    categoryTextActive: {
        color: "#fff",
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
        color: HomeColors.text,
        textAlign: 'center',
    },

    weaningDescription: {
        marginTop: 10,
        textAlign: 'center',
        color: HomeColors.textSoft,
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
        color: HomeColors.text,
    },
    // Weaning Introduction
    //Journey Section
    journeySection: {
        backgroundColor: '#92D8EC',
        marginTop: 28,
        paddingTop: 28,
        paddingBottom: 32,
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

});

export default styles;