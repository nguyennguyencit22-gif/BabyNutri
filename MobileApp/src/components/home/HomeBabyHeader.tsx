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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type {
    RootState,
} from '../../store/Store';

import type {
    RootStackParamList,
} from '../../types/navigation/navigationTopTypes';

import {
    calculateBabyAgeInMonths,
} from '../../utils/calculateBabyAge';

import createStyles from '../../styles/home/homeBabyHeaderStyles';
import BabySwitcherModal from './BabySwitcherModal';
import BabyProfileActionsModal from '../profile/BabyProfileActionsModal';
import { useAppTheme } from '../../theme/useAppTheme';

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
    const [showBabyActions, setShowBabyActions] = React.useState(false);

    const navigation =
        useNavigation<
            NativeStackNavigationProp<RootStackParamList>
        >();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const handleCloseBabyActions = () => {
        setShowBabyActions(false);
    };

    const handleEditBaby = () => {
        if (!selectedBaby) {
            return;
        }

        handleCloseBabyActions();

        navigation.navigate('EditBabyProfile', {
            babyId: selectedBaby.id,
        });
    };

    return (

        <View style={styles.container}>

            <Pressable
                style={styles.userInfo}
                onPress={() => {
                    if (!selectedBaby) {
                        navigation.navigate('AddBabyProfile');
                    } else {
                        setShowBabyActions(true);
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
                                colors.primary,
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

                            <Pressable
                                onPress={() =>
                                    setShowBabySwitcher(true)
                                }>

                                <Text
                                    style={
                                        styles.arrow
                                    }>
                                    ▼
                                </Text>

                            </Pressable>

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
                        colors.primary
                    }
                    containerColor={
                        colors.primarySoft
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

            <BabyProfileActionsModal
                visible={showBabyActions}
                onClose={handleCloseBabyActions}
                onEditBaby={handleEditBaby}
                onAddCaregiver={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Add caregiver:',
                        selectedBaby.id,
                    );
                }}
                onEditEvents={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Edit events:',
                        selectedBaby.id,
                    );
                }}
                onConfigureMainScreen={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Configure main screen:',
                        selectedBaby.id,
                    );
                }}
                onReminders={() => {
                    if (!selectedBaby) {
                        return;
                    }

                    console.log(
                        'Reminders:',
                        selectedBaby.id,
                    );
                }}
            />
        </View>

    );
}

export default HomeBabyHeader;