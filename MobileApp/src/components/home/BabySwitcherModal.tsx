import React from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../store/Store';
import { selectBaby } from '../../store/babySlice';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

import createStyles from '../../styles/home/babySwitcherModalStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const CheckCircleIcon = ({ size = 24, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <Path d="M22 4L12 14.01l-3-3" />
  </Svg>
);

type BabySwitcherModalProps = {
    visible: boolean;
    onClose: () => void;
};

function BabySwitcherModal({
    visible,
    onClose,
}: BabySwitcherModalProps) {
    const dispatch = useDispatch();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

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
                                        <CheckCircleIcon
                                            size={24}
                                            color={colors.primary}
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