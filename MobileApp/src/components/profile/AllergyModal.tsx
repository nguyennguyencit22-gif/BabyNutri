import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';

import { Icon } from 'react-native-paper';

import styles from '../../styles/profile/addBabyProfileStyles';

type AllergyModalProps = {
    visible: boolean;
    options: string[];
    selectedAllergies: string[];
    onToggleAllergy: (allergy: string) => void;
    onClose: () => void;
};

function AllergyModal({
    visible,
    options,
    selectedAllergies,
    onToggleAllergy,
    onClose,
}: AllergyModalProps) {
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
                            Select allergies
                        </Text>

                        <Pressable
                            onPress={onClose}
                            hitSlop={10}>
                            <Icon
                                source="close"
                                size={26}
                                color="#5B0010"
                            />
                        </Pressable>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={item => item}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const selected =
                                selectedAllergies.includes(item);

                            return (
                                <Pressable
                                    onPress={() =>
                                        onToggleAllergy(item)
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

                                    <Text style={styles.optionTextAllergies}>
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

export default AllergyModal;