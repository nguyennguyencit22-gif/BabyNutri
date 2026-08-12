import {
    StyleSheet,
} from 'react-native';

import type {
    AppColors,
} from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({

    container: {

        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'center',

        paddingHorizontal: 20,

        paddingTop: 20,

        paddingBottom: 18,

    },

    userInfo: {

        flexDirection: 'row',

        alignItems: 'center',

        flex: 1,

    },

    avatar: {

        elevation: 4,

    },

    textContainer: {

        marginLeft: 14,

    },

    nameRow: {

        flexDirection: 'row',

        alignItems: 'center',

    },

    babyName: {

        fontSize: 20,

        fontWeight: '700',

        color: colors.primary,

    },

    arrow: {

        marginLeft: 8,

        fontSize: 15,

        color: colors.textSoft,

    },

    babyAge: {

        marginTop: 4,

        fontSize: 15,

        color: colors.textSoft,

    },

    rightActions: {

        flexDirection: 'row',

        alignItems: 'center',

    },

    profileDot: {

        width: 44,

        height: 44,

        borderRadius: 22,

        marginLeft: 10,

        backgroundColor:
            colors.primarySoft,

    },

});

export default createStyles;
