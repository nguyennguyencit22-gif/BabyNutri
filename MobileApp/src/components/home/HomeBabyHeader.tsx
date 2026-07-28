import React from 'react';
import {
    View,
    Pressable,
} from 'react-native';

import {
    Avatar,
    IconButton,
    Text,
} from 'react-native-paper';

import { useSelector } from 'react-redux';

import type {
    RootState,
} from '../../store/Store';

import {
    calculateBabyAgeInMonths,
} from '../../utils/calculateBabyAge';

import styles from '../../styles/home/homeBabyHeaderStyles';
import { HomeColors } from '../../constants/generalHome/homeTheme';
import BabySwitcherModal from './BabySwitcherModal';

function HomeBabyHeader() {

    const babies = useSelector(
        (state: RootState) =>
            state.baby.babies,
    );

    const selectedBabyId = useSelector(
        (state: RootState) =>
            state.baby.selectedBabyId,
    );

    const selectedBaby =
        babies.find(
            baby =>
                baby.id ===
                selectedBabyId,
        );

    const hasMultipleBaby =
        babies.length > 1;

    const [showBabySwitcher, setShowBabySwitcher] = React.useState(false);
    return (

        <View style={styles.container}>

            <Pressable
                style={styles.userInfo}
                onPress={() => {
                    if (babies.length > 1) {
                        setShowBabySwitcher(true);
                    }
                }}>

                <Avatar.Text
                    size={56}
                    label={
                        selectedBaby
                            ? selectedBaby.name
                                .charAt(0)
                                .toUpperCase()
                            : 'B'
                    }
                    style={[
                        styles.avatar,
                        {
                            backgroundColor:
                                selectedBaby
                                    ?.profileColor ??
                                HomeColors.primary,
                        },
                    ]}
                />

                <View style={styles.textContainer}>

                    <View style={styles.nameRow}>

                        <Text style={styles.babyName}>

                            {selectedBaby
                                ? selectedBaby.name
                                : "Baby's Name"}

                        </Text>

                        {hasMultipleBaby && (

                            <Text
                                style={
                                    styles.arrow
                                }>
                                ▼
                            </Text>

                        )}

                    </View>

                    <Text style={styles.babyAge}>

                        {selectedBaby
                            ? `${calculateBabyAgeInMonths(
                                selectedBaby.dateOfBirth,
                            )} months`
                            : 'Create baby profile'}

                    </Text>

                </View>

            </Pressable>

            <View style={styles.rightActions}>

                <IconButton
                    icon="bell-outline"
                    size={22}
                    iconColor={
                        HomeColors.primary
                    }
                    containerColor={
                        HomeColors.primarySoft
                    }
                    onPress={() => { }}
                />

                <View
                    style={
                        styles.profileDot
                    }
                />

            </View>

            <BabySwitcherModal
                visible={showBabySwitcher}
                onClose={() =>
                    setShowBabySwitcher(false)
                }
            />
        </View>

    );
}

export default HomeBabyHeader;