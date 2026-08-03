import React from 'react';
import {
    Pressable,
    Text,
    View,
} from 'react-native';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

type ProfileColorPickerProps = {
    colors: string[];
    selectedColor: string;
    onSelectColor: (color: string) => void;
};

function ProfileColorPicker({
    colors,
    selectedColor,
    onSelectColor,
}: ProfileColorPickerProps) {
    const { colors: themeColors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(themeColors),
        [themeColors],
    );

    return (
        <View style={styles.containerColor}>
            <Text style={styles.labelColor}>
                Profile color
            </Text>

            <View style={styles.colorPanel}>
                {colors.map(color => {
                    const isSelected =
                        selectedColor === color;

                    return (
                        <Pressable
                            key={color}
                            onPress={() =>
                                onSelectColor(color)
                            }
                            style={({ pressed }) => [
                                styles.colorOption,
                                {
                                    borderColor: color,
                                },
                                isSelected &&
                                styles.colorOptionSelected,
                                pressed &&
                                styles.colorOptionPressed,
                            ]}>

                            <View
                                style={[
                                    styles.colorCircle,
                                    {
                                        backgroundColor: color,
                                    },
                                ]}
                            />
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export default ProfileColorPicker;