import React from 'react';
import {
    Pressable,
    Text,
} from 'react-native';

import styles from '../../styles/profile/dateOfBirthRowStyles';

type DateOfBirthRowProps = {
    date: Date;
    onPress: () => void;
};

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function DateOfBirthRow({
    date,
    onPress,
}: DateOfBirthRowProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}>
            <Text style={styles.label}>
                Date of birth
            </Text>

            <Text style={styles.date}>
                {formatDate(date)}
            </Text>
        </Pressable>
    );
}

export default DateOfBirthRow;