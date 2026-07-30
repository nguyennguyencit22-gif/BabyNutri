import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Avatar, Icon } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../store/Store';
import { selectBaby } from '../../store/babySlice';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

import styles from '../../styles/home/babySwitcherModalStyles';

type BabySwitcherModalProps = {
    visible: boolean;
    onClose: () => void;
};

function BabySwitcherModal({
    visible,
    onClose,
}: BabySwitcherModalProps) {
    const dispatch = useDispatch();

    const babies = useSelector(
        (state: RootState) => state.baby.babies,
    );

    const selectedBabyId = useSelector(
        (state: RootState) =>
            state.baby.selectedBabyId,
    );

    const handleSelectBaby = (
        babyId: string,
    ) => {
        dispatch(selectBaby(babyId));
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}>

            <View style={styles.overlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onClose}
                />

                <View style={styles.modalCard}>
                    <Text style={styles.title}>
                        Select baby
                    </Text>

                    <FlatList
                        data={babies}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isSelected =
                                item.id ===
                                selectedBabyId;

                            const ageInMonths =
                                calculateBabyAgeInMonths(
                                    item.dateOfBirth,
                                );

                            return (
                                <Pressable
                                    onPress={() =>
                                        handleSelectBaby(
                                            item.id,
                                        )
                                    }
                                    style={({
                                        pressed,
                                    }) => [
                                            styles.babyRow,
                                            isSelected &&
                                            styles.babyRowSelected,
                                            pressed &&
                                            styles.babyRowPressed,
                                        ]}>

                                    <Avatar.Text
                                        size={52}
                                        label={item.name
                                            .charAt(0)
                                            .toUpperCase()}
                                        labelStyle={
                                            styles.avatarLabel
                                        }
                                        style={[
                                            styles.avatar,
                                            {
                                                backgroundColor:
                                                    item.profileColor,
                                            },
                                        ]}
                                    />

                                    <View
                                        style={
                                            styles.babyInfo
                                        }>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.babyName,
                                                isSelected &&
                                                styles.babyNameSelected,
                                            ]}>
                                            {item.name}
                                        </Text>

                                        <Text
                                            style={
                                                styles.babyAge
                                            }>
                                            {ageInMonths}{' '}
                                            months old
                                        </Text>
                                    </View>

                                    {isSelected ? (
                                        <Icon
                                            source="check-circle"
                                            size={24}
                                            color="#FF5F70"
                                        />
                                    ) : null}
                                </Pressable>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}

export default BabySwitcherModal;