import React from 'react';
import {
    Alert,
    ScrollView,
} from 'react-native';
import {
    SafeAreaView,
} from 'react-native-safe-area-context';
import {
    Button,
    IconButton,
    Text,
} from 'react-native-paper';
import {
    useDispatch,
    useSelector,
} from 'react-redux';

import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import ProfileHeader from '../../components/profile/ProfileHeader';
import BabyAvatarPicker from '../../components/profile/BabyAvatarPicker';
import BabyNameInput from '../../components/profile/BabyNameInput';
import ProfileColorPicker from '../../components/profile/ProfileColorPicker';
import GenderSelector, {
    BabyGender,
} from '../../components/profile/GenderSelector';
import DateOfBirthRow from '../../components/profile/DateOfBirthRow';
import AllergySelector from '../../components/profile/AllergySelector';
import AllergyModal from '../../components/profile/AllergyModal';

import {
    PROFILE_COLORS,
    ALLERGY_OPTIONS,
} from '../../constants/profile/babyProfileData';

import {
    deleteBaby,
    updateBaby,
} from '../../store/babySlice';

import type {
    RootState,
} from '../../store/Store';
import styles from '@/styles/profile/editBabyProfileStyles';
function EditBabyProfileScreen({
    navigation,
    route,
}: any) {
    const { babyId } = route.params;

    const dispatch = useDispatch();

    const baby = useSelector(
        (state: RootState) =>
            state.baby.babies.find(
                item => item.id === babyId,
            ),
    );

    const [babyName, setBabyName] =
        React.useState(
            baby?.name ?? '',
        );

    const [selectedColor, setSelectedColor] =
        React.useState(
            baby?.profileColor ??
            PROFILE_COLORS[0],
        );

    const [selectedGender, setSelectedGender] =
        React.useState<BabyGender>(
            baby?.gender ?? 'boy',
        );

    const [dateOfBirth, setDateOfBirth] =
        React.useState(
            baby
                ? new Date(baby.dateOfBirth)
                : new Date(),
        );

    const [
        selectedAllergies,
        setSelectedAllergies,
    ] = React.useState<string[]>(
        baby?.allergies ?? [],
    );

    const [nameError, setNameError] =
        React.useState('');

    const [
        showDatePicker,
        setShowDatePicker,
    ] = React.useState(false);

    const [
        showAllergyModal,
        setShowAllergyModal,
    ] = React.useState(false);

    const validateForm = (): boolean => {
        if (!babyName.trim()) {
            setNameError(
                'Baby name is required.',
            );
            return false;
        }

        if (babyName.trim().length < 2) {
            setNameError(
                'Baby name must contain at least 2 characters.',
            );
            return false;
        }

        setNameError('');
        return true;
    };

    const handleDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date,
    ) => {
        setShowDatePicker(false);

        if (event.type === 'dismissed') {
            return;
        }

        if (selectedDate) {
            setDateOfBirth(selectedDate);
        }
    };

    const toggleAllergy = (
        allergy: string,
    ) => {
        setSelectedAllergies(current => {
            if (current.includes(allergy)) {
                return current.filter(
                    item => item !== allergy,
                );
            }

            return [...current, allergy];
        });
    };

    const handleUpdate = () => {
        if (!baby || !validateForm()) {
            return;
        }

        dispatch(
            updateBaby({
                id: baby.id,
                name: babyName.trim(),
                profileColor: selectedColor,
                gender: selectedGender,
                dateOfBirth:
                    dateOfBirth.toISOString(),
                allergies:
                    selectedAllergies,
            }),
        );

        Alert.alert(
            'Success',
            'Baby profile has been updated.',
            [
                {
                    text: 'OK',
                    onPress: () =>
                        navigation.goBack(),
                },
            ],
        );
    };

    const handleDelete = () => {
        if (!baby) {
            return;
        }

        Alert.alert(
            'Delete baby profile',
            `Are you sure you want to delete ${baby.name}'s profile?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(
                            deleteBaby(baby.id),
                        );

                        navigation.goBack();
                    },
                },
            ],
        );
    };

    if (!baby) {
        return (
            <SafeAreaView
                style={styles.container}>
                <Text>
                    Baby profile not found.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={styles.container}>

            <ProfileHeader
                title="Edit baby profile"
                onBack={() =>
                    navigation.goBack()
                }
            />

            <IconButton
                icon="delete"
                size={24}
                iconColor="#5B0010"
                style={styles.deleteButton}
                onPress={handleDelete}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.scrollContent
                }>

                <BabyAvatarPicker
                    profileColor={
                        selectedColor
                    }
                    onPressCamera={() => {
                        console.log(
                            'Open image picker',
                        );
                    }}
                />

                <BabyNameInput
                    value={babyName}
                    error={nameError}
                    onChangeText={text => {
                        setBabyName(text);

                        if (nameError) {
                            setNameError('');
                        }
                    }}
                />

                <ProfileColorPicker
                    colors={PROFILE_COLORS}
                    selectedColor={
                        selectedColor
                    }
                    onSelectColor={
                        setSelectedColor
                    }
                />

                <GenderSelector
                    selectedGender={
                        selectedGender
                    }
                    onSelectGender={
                        setSelectedGender
                    }
                />

                <DateOfBirthRow
                    date={dateOfBirth}
                    onPress={() =>
                        setShowDatePicker(true)
                    }
                />

                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="spinner"
                        maximumDate={
                            new Date()
                        }
                        onChange={
                            handleDateChange
                        }
                    />
                )}

                <AllergySelector
                    selectedAllergies={
                        selectedAllergies
                    }
                    onPress={() =>
                        setShowAllergyModal(
                            true,
                        )
                    }
                />

                <Button
                    mode="contained"
                    disabled={
                        !babyName.trim()
                    }
                    style={
                        styles.updateButton
                    }
                    contentStyle={
                        styles.buttonContent
                    }
                    onPress={
                        handleUpdate
                    }>
                    <Text
                        style={
                            styles.buttonText
                        }>
                        Update
                    </Text>
                </Button>
            </ScrollView>

            <AllergyModal
                visible={
                    showAllergyModal
                }
                options={
                    ALLERGY_OPTIONS
                }
                selectedAllergies={
                    selectedAllergies
                }
                onToggleAllergy={
                    toggleAllergy
                }
                onClose={() =>
                    setShowAllergyModal(false)
                }
            />
        </SafeAreaView>
    );
}

export default EditBabyProfileScreen;