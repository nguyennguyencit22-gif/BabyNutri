import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderBottomWidth: 1,
        borderBottomColor: '#EFE7E4',

        paddingHorizontal: 8,
    },

    pressed: {
        opacity: 0.65,
    },

    textContent: {
        flex: 1,
    },

    label: {
        color: '#5B0010',
        fontSize: 17,
    },

    summary: {
        marginTop: 4,
        color: '#A57980',
        fontSize: 13,
    },
});

export default styles;