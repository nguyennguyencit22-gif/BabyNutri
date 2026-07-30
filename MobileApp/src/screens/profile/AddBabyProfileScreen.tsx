import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';

import BabyAvatarPicker from '../../components/profile/BabyAvatarPicker';
import ProfileColorPicker from '../../components/profile/ProfileColorPicker';
import DateOfBirthRow from '../../components/profile/DateOfBirthRow';
import AllergySelector from '../../components/profile/AllergySelector';
import BabyNameInput from '@/components/profile/BabyNameInput';
import { PROFILE_COLORS, } from '../../constants/profile/babyProfileData';
import GenderSelector, { BabyGender, } from '../../components/profile/GenderSelector';
import DateTimePicker, { DateTimePickerEvent, } from '@react-native-community/datetimepicker';
import AllergyModal from '../../components/profile/AllergyModal';
import { ALLERGY_OPTIONS, } from '../../constants/profile/babyProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { useDispatch } from 'react-redux';
import { addBaby } from '../../store/babySlice';

function AddBabyProfileScreen({ navigation }: any) {
    const [babyName, setBabyName] = React.useState('');
    const [selectedColor, setSelectedColor] = React.useState(PROFILE_COLORS[0]);
    const [selectedGender, setSelectedGender] = React.useState<BabyGender>('boy');

    const [dateOfBirth, setDateOfBirth] = React.useState(new Date());
    const [showDatePicker, setShowDatePicker] = React.useState(false);

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

    const [selectedAllergies, setSelectedAllergies] = React.useState<string[]>([]);
    const [showAllergyModal, setShowAllergyModal] = React.useState(false);

    const toggleAllergy = (allergy: string) => {
        setSelectedAllergies(current => {
            const alreadySelected =
                current.includes(allergy);

            if (alreadySelected) {
                return current.filter(
                    item => item !== allergy,
                );
            }

            return [...current, allergy];
        });
    };

    const [nameError, setNameError] = React.useState('');
    const validateForm = (): boolean => {
        if (!babyName.trim()) {
            setNameError('Baby name is required.');
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
    const dispatch = useDispatch();
    const handleSave = () => {
        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        dispatch(
            addBaby({
                id: Date.now().toString(),
                name: babyName.trim(),
                profileColor: selectedColor,
                gender: selectedGender,
                dateOfBirth: dateOfBirth.toISOString(),
                allergies: selectedAllergies,
            }),
        );

        Alert.alert(
            'Success',
            'Baby profile has been created.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ],
        );
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>

            <ProfileHeader
                title="My Profile"
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <BabyAvatarPicker
                    profileColor={selectedColor}
                    onPressCamera={() => {
                        console.log('Open image picker');
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
                    selectedColor={selectedColor}
                    onSelectColor={setSelectedColor}
                />

                <GenderSelector
                    selectedGender={selectedGender}
                    onSelectGender={setSelectedGender}
                />

                <DateOfBirthRow
                    date={dateOfBirth}
                    onPress={() => setShowDatePicker(true)}
                />
                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                    />
                )}

                <AllergySelector
                    selectedAllergies={selectedAllergies}
                    onPress={() => setShowAllergyModal(true)}
                />

                <Button
                    mode="contained"
                    style={styles.saveButton}
                    disabled={!babyName.trim()}
                    contentStyle={styles.saveButtonContent}
                    onPress={handleSave}>
                    <Text style={styles.saveButtonText}>
                        Save
                    </Text>
                </Button>

            </ScrollView>
            <AllergyModal
                visible={showAllergyModal}
                options={ALLERGY_OPTIONS}
                selectedAllergies={selectedAllergies}
                onToggleAllergy={toggleAllergy}
                onClose={() => setShowAllergyModal(false)}
            />
        </SafeAreaView>
    );
}

export default AddBabyProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF9',
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    input: {
        marginTop: 24,
        marginBottom: 24,
    },

    saveButton: {
        marginTop: 32,
        borderRadius: 30,
        backgroundColor: '#fe6574',
    },

    saveButtonContent: {
        height: 52,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});