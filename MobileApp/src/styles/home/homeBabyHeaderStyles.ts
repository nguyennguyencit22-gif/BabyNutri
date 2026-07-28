import {
    StyleSheet,
} from 'react-native';

import {
    HomeColors,
} from '../../constants/generalHome/homeTheme';

const styles = StyleSheet.create({

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

        color: HomeColors.primary,

    },

    arrow: {

        marginLeft: 8,

        fontSize: 15,

        color: '#7E6B6B',

    },

    babyAge: {

        marginTop: 4,

        fontSize: 15,

        color: '#8A6E6E',

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
            HomeColors.primarySoft,

    },

});

export default styles;