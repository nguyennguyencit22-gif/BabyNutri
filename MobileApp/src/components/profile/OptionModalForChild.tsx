import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CloseIcon = ({ size = 24, color = '#4B3034' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

type OptionModalForChildProps = {
    title: string;
    visible: boolean;
    options: string[];
    selectedOptions: string[];
    onToggleOption: (option: string) => void;
    onClose: () => void;
};

function OptionModalForChild({
    title,
    visible,
    options,
    selectedOptions,
    onToggleOption,
    onClose,
}: OptionModalForChildProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>

            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {title}
                        </Text>

                        <Pressable
                            onPress={onClose}
                            hitSlop={10}>
                            <CloseIcon
                                size={22}
                                color={colors.text}
                            />
                        </Pressable>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={item => item}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const safeSelected = Array.isArray(selectedOptions) ? selectedOptions : [];
                            const selected = safeSelected.includes(item);

                            return (
                                <Pressable
                                    onPress={() =>
                                        onToggleOption(item)
                                    }
                                    style={styles.optionRow}>

                                    <View
                                        style={[
                                            styles.radioOuter,
                                            selected &&
                                            styles.radioOuterSelected,
                                        ]}>
                                        {selected ? (
                                            <View
                                                style={
                                                    styles.radioInner
                                                }
                                            />
                                        ) : null}
                                    </View>

                                    <Text style={styles.modalOptionText}>
                                        {item}
                                    </Text>
                                </Pressable>
                            );
                        }}
                    />

                    <Pressable
                        onPress={onClose}
                        style={styles.doneButton}>
                        <Text style={styles.doneButtonText}>
                            Done
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export default OptionModalForChild;