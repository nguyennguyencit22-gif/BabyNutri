import React from 'react';
import {
    Pressable,
    Text,
} from 'react-native';

import createStyles from '../../styles/profile/dateOfBirthRowStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type DateOfBirthRowProps = {
    date: Date;
    onPress: () => void;
};

function formatDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
        return 'Select date of birth';
    }
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
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

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