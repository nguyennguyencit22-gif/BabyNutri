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
import AllergySelector from '../../components/profile/OptionSelector';
import AllergyModal from '../../components/profile/OptionModalForChild';

import {
    PROFILE_COLORS,
    ALLERGY_OPTIONS,
    NUTRITION_GOAL_OPTIONS,
    FOOD_PREFERENCE_OPTIONS,
} from '../../constants/profile/babyProfileData';

import {
    deleteBaby,
    updateBaby,
} from '../../store/babySlice';

import type {
    RootState,
} from '../../store/Store';
import createStyles from '@/styles/profile/editBabyProfileStyles';
import DeleteBabyProfileModal from '@/components/profile/DeleteBabyProfileModal';
import { useAppTheme } from '@/theme/useAppTheme';
function EditBabyProfileScreen({
    navigation,
    route,
}: any) {
    const { babyId } = route.params;

    const dispatch = useDispatch();

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

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

    const [
        selectedNutritionGoal,
        setSelectedNutritionGoal,
    ] = React.useState(
        baby?.nutritionGoal ?? '',
    );

    const [
        selectedFoodPreferences,
        setSelectedFoodPreferences,
    ] = React.useState<string[]>(
        baby?.foodPreferences ?? [],
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

    const [
        showNutritionGoalModal,
        setShowNutritionGoalModal,
    ] = React.useState(false);

    const [
        showFoodPreferenceModal,
        setShowFoodPreferenceModal,
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

    const selectNutritionGoal = (
        goal: string,
    ) => {
        setSelectedNutritionGoal(goal);
    };

    const toggleFoodPreference = (
        food: string,
    ) => {
        setSelectedFoodPreferences(current => {
            if (current.includes(food)) {
                return current.filter(
                    item => item !== food,
                );
            }

            return [...current, food];
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
                nutritionGoal:
                    selectedNutritionGoal,
                foodPreferences:
                    selectedFoodPreferences,
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

    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const handleConfirmDelete = () => {
        if (!baby) {
            return;
        }

        dispatch(deleteBaby(baby.id));

        setShowDeleteModal(false);

        navigation.goBack();
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
                iconColor={colors.text}
                style={styles.deleteButton}
                onPress={() => setShowDeleteModal(true)}
            />

            <DeleteBabyProfileModal
                visible={showDeleteModal}
                babyName={baby.name}
                recordCount={0}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
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
                    label="Allergies"
                    selectedOptions={
                        selectedAllergies
                    }
                    onPress={() =>
                        setShowAllergyModal(
                            true,
                        )
                    }
                />

                <AllergySelector
                    label="Main nutrition goal"
                    selectedOptions={
                        selectedNutritionGoal
                            ? [selectedNutritionGoal]
                            : []
                    }
                    onPress={() =>
                        setShowNutritionGoalModal(
                            true,
                        )
                    }
                />

                <AllergySelector
                    label="Food preferences"
                    selectedOptions={
                        selectedFoodPreferences
                    }
                    onPress={() =>
                        setShowFoodPreferenceModal(
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
                title="Select allergies"
                visible={
                    showAllergyModal
                }
                options={
                    ALLERGY_OPTIONS
                }
                selectedOptions={
                    selectedAllergies
                }
                onToggleOption={
                    toggleAllergy
                }
                onClose={() =>
                    setShowAllergyModal(false)
                }
            />

            <AllergyModal
                title="Select main nutrition goal"
                visible={
                    showNutritionGoalModal
                }
                options={
                    NUTRITION_GOAL_OPTIONS
                }
                selectedOptions={
                    selectedNutritionGoal
                        ? [selectedNutritionGoal]
                        : []
                }
                onToggleOption={
                    selectNutritionGoal
                }
                onClose={() =>
                    setShowNutritionGoalModal(false)
                }
            />

            <AllergyModal
                title="Select food preferences"
                visible={
                    showFoodPreferenceModal
                }
                options={
                    FOOD_PREFERENCE_OPTIONS
                }
                selectedOptions={
                    selectedFoodPreferences
                }
                onToggleOption={
                    toggleFoodPreference
                }
                onClose={() =>
                    setShowFoodPreferenceModal(false)
                }
            />

        </SafeAreaView>
    );
}

export default EditBabyProfileScreen;