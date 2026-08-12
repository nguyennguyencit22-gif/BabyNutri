import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';

import { Icon } from 'react-native-paper';

import createStyles from '../../styles/profile/addBabyProfileStyles';
import { useAppTheme } from '../../theme/useAppTheme';

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
                            <Icon
                                source="close"
                                size={26}
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