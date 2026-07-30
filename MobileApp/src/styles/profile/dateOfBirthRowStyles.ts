import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        minHeight: 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        marginTop: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 8,
    },

    pressed: {
        opacity: 0.65,
    },

    label: {
        color: '#5B0010',
        fontSize: 17,
        fontWeight: '400',
    },

    date: {
        color: '#5B0010',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default styles;