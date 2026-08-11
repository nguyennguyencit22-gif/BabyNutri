import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import type {
    ChildQuestionnaire,
    Gender,
} from '../../types/auth/questionnaire';
import { SafeAreaView } from 'react-native-safe-area-context';
import createStyles from '../../styles/questions/questionnaireStyles';
import { useAppTheme } from '../../theme/useAppTheme';
import { Picker } from '@react-native-picker/picker';
import { getBabyAge, calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';
import {
    MONTHS,
    getYears,
    getDaysInMonth,
} from '../../utils/dateUtils';
import { useDispatch } from 'react-redux';
import { PROFILE_COLORS } from '@/constants/profile/babyProfileData';
import { saveBaby } from '@/store/babySlice';
import type { AppDispatch } from '../../store/Store';
import { ALLERGY_OPTIONS, NUTRITION_GOAL_OPTIONS, FOOD_PREFERENCE_OPTIONS } from '@/constants/profile/babyProfileData';

// hasChild, name, DOB, gender, weight, height, allergies, nutritionGoal, foodPreferences
const TOTAL_STEPS = 9;

const GENDER_OPTIONS: Array<{
    label: string;
    value: Gender;
}> = [
        {
            label: 'Boy',
            value: 'Boy',
        },
        {
            label: 'Girl',
            value: 'Girl',
        },
    ];

type UnitOptionProps = {
    title: string;
    selected: boolean;
    onPress: () => void;
};

function UnitOption({ title, selected, onPress }: UnitOptionProps) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <Pressable onPress={onPress} style={styles.unitOption}>
            <View
                style={[
                    styles.unitRadio,
                    selected && styles.unitRadioSelected,
                ]}
            />

            <Text style={styles.unitLabel}>
                {title}
            </Text>
        </Pressable>
    );
}

function QuestionnaireScreen({ navigation, route }: any) {
    const userMode: 'guest' | 'authenticated' =
        route.params?.userMode ?? 'guest';

    const [currentStep, setCurrentStep] = useState(0);

    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const dispatch = useDispatch<AppDispatch>();

    const [answers, setAnswers] =
        useState<ChildQuestionnaire>({
            hasChild: null,
            childName: '',
            dateOfBirth: '',
            gender: '',
            weight: 0,
            weightUnit: 'lb',
            height: 0,
            heightUnit: 'in',
            allergies: [],
            nutritionGoal: '',
            foodPreferences: [],
        });

    const updateAnswer = <
        K extends keyof ChildQuestionnaire,
    >(
        key: K,
        value: ChildQuestionnaire[K],
    ) => {
        setAnswers(previous => ({
            ...previous,
            [key]: value,
        }));
    };

    const toggleAllergy = (value: string) => {
        if (value === 'None') {
            updateAnswer('allergies', ['None']);
            return;
        }

        const withoutNone = answers.allergies.filter(
            item => item !== 'None',
        );

        const updated = withoutNone.includes(value)
            ? withoutNone.filter(item => item !== value)
            : [...withoutNone, value];

        updateAnswer('allergies', updated);
    };

    const toggleFoodPreference = (
        value: string,
    ) => {
        const selected =
            answers.foodPreferences;

        const updated = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];

        updateAnswer(
            'foodPreferences',
            updated,
        );
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 0:
                if (answers.hasChild === null) {
                    Alert.alert(
                        'Required',
                        'Please select an option.',
                    );
                    return false;
                }
                break;

            case 1:
                if (!answers.childName.trim()) {
                    Alert.alert(
                        'Required',
                        'Please enter the child’s name.',
                    );
                    return false;
                }

                if (answers.childName.trim().length < 2) {
                    Alert.alert(
                        'Invalid name',
                        'The child’s name must contain at least 2 characters.',
                    );
                    return false;
                }
                break;

            case 2:
                if (!answers.dateOfBirth) {
                    Alert.alert(
                        'Required',
                        'Please select your child’s complete date of birth.',
                    );
                    return false;
                }
                if (calculateBabyAgeInMonths(answers.dateOfBirth) > 60) {
                    Alert.alert(
                        'Age Limit Exceeded',
                        'BabyNutri is designed for infants and children up to 5 years old (60 months). Please select a valid date of birth within 5 years.',
                    );
                    return false;
                }
                break;

            case 3:
                if (!answers.gender) {
                    Alert.alert(
                        'Required',
                        'Please select a gender.',
                    );
                    return false;
                }
                break;
            case 4:
                if (!answers.weight || answers.weight <= 0) {
                    Alert.alert(
                        'Required',
                        "Please enter your child's weight.",
                    );
                    return false;
                }
                break;
            case 5:
                if (!answers.height || answers.height <= 0) {
                    Alert.alert(
                        'Required',
                        "Please enter your child's height.",
                    );
                    return false;
                }
                break;
            case 6:
                if (answers.allergies.length === 0) {
                    Alert.alert(
                        'Required',
                        'Please select at least one option.',
                    );
                    return false;
                }
                break;

            case 7:
                if (!answers.nutritionGoal) {
                    Alert.alert(
                        'Required',
                        'Please select a nutrition goal.',
                    );
                    return false;
                }
                break;

            case 8:
                if (
                    answers.foodPreferences.length === 0
                ) {
                    Alert.alert(
                        'Required',
                        'Please select at least one food.',
                    );
                    return false;
                }
                break;

            default:
                break;
        }

        return true;
    };



    const handleNext = async () => {
        const isValid = validateCurrentStep();

        if (!isValid) {
            return;
        }

        // Người dùng chưa có con:
        // không tạo baby profile và đi thẳng vào Home.
        if (
            currentStep === 0 &&
            answers.hasChild === false
        ) {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Home',
                        params: {
                            userMode,
                            hasChild: false,
                        },
                    },
                ],
            });

            return;
        }

        const isLastStep =
            currentStep === TOTAL_STEPS - 1;

        if (!isLastStep) {
            setCurrentStep(previousStep =>
                previousStep + 1,
            );
            return;
        }

        // Đến đây chắc chắn đã validate gender.
        const gender =
            answers.gender === 'Boy'
                ? 'boy'
                : 'girl';

        const result = await dispatch(
            saveBaby({
                id: Date.now().toString(),
                name: answers.childName.trim(),
                profileColor: PROFILE_COLORS[0],
                gender,
                dateOfBirth: answers.dateOfBirth,
                allergies: answers.allergies,
                nutritionGoal: answers.nutritionGoal,
                foodPreferences: answers.foodPreferences,
                weight: answers.weight,
                weightUnit: answers.weightUnit,
                height: answers.height,
                heightUnit: answers.heightUnit,
            }),
        );

        // For a real account this hit the backend — if that failed, stay
        // on this screen instead of navigating to Home with nothing saved.
        if (saveBaby.rejected.match(result)) {
            Alert.alert(
                'Error',
                'Could not save the baby profile. Please try again.',
            );
            return;
        }

        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'Home',
                    params: {
                        userMode,
                        hasChild: true,
                    },
                },
            ],
        });
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(previous => previous - 1);
            return;
        }

        navigation.goBack();
    };

    const renderSingleOption = (
        label: string,
        selected: boolean,
        onPress: () => void,
    ) => (
        <Pressable
            key={label}
            onPress={onPress}
            style={[
                styles.optionButton,
                selected && styles.optionButtonSelected,
            ]}>
            <Text
                style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                ]}>
                {label}
            </Text>
        </Pressable>
    );

    const [birthDate, setBirthDate] = useState({
        month: '',
        day: '',
        year: '',
    });

    // TextInput must be controlled by the raw string the user typed, not by
    // String(answers.weight) — otherwise "1." immediately re-renders as "1"
    // because Number("1.") === 1, and the decimal point can never be typed.
    const [weightText, setWeightText] = useState('');
    const [heightText, setHeightText] = useState('');

    const sanitizeDecimal = (text: string) => {
        const digitsAndDot = text.replace(/[^0-9.]/g, '');
        const [wholePart, ...rest] = digitsAndDot.split('.');

        return rest.length > 0
            ? `${wholePart}.${rest.join('')}`
            : digitsAndDot;
    };

    const handleWeightChange = (text: string) => {
        const sanitized = sanitizeDecimal(text);
        setWeightText(sanitized);
        updateAnswer('weight', Number(sanitized) || 0);
    };

    const handleHeightChange = (text: string) => {
        const sanitized = sanitizeDecimal(text);
        setHeightText(sanitized);
        updateAnswer('height', Number(sanitized) || 0);
    };

    const years = getYears();

    const days = Array.from(
        {
            length: getDaysInMonth(
                Number(birthDate.month),
                Number(birthDate.year),
            ),
        },
        (_, index) => index + 1,
    );

    const updateBirthDate = (
        key: keyof typeof birthDate,
        value: string,
    ) => {
        let nextBirthDate = {
            ...birthDate,
            [key]: value,
        };

        if (
            key === 'month' ||
            key === 'year'
        ) {
            const maximumDay = getDaysInMonth(
                Number(nextBirthDate.month),
                Number(nextBirthDate.year),
            );

            if (
                nextBirthDate.day &&
                Number(nextBirthDate.day) > maximumDay
            ) {
                nextBirthDate = {
                    ...nextBirthDate,
                    day: '',
                };
            }
        }

        setBirthDate(nextBirthDate);

        const {
            month,
            day,
            year,
        } = nextBirthDate;

        if (!month || !day || !year) {
            updateAnswer('dateOfBirth', '');
            return;
        }

        updateAnswer(
            'dateOfBirth',
            `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        );
    };

    const renderQuestion = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <Text style={styles.question}>
                            Do you have a child?
                        </Text>

                        {renderSingleOption(
                            'Yes, I have a child',
                            answers.hasChild === true,
                            () => updateAnswer('hasChild', true),
                        )}

                        {renderSingleOption(
                            'No, not yet',
                            answers.hasChild === false,
                            () => updateAnswer('hasChild', false),
                        )}
                    </>
                );
            case 1:
                return (
                    <>
                        <Text style={styles.question}>
                            What is your child’s name?
                        </Text>

                        <TextInput
                            value={answers.childName}
                            onChangeText={value =>
                                updateAnswer(
                                    'childName',
                                    value,
                                )
                            }
                            placeholder="Enter child’s name"
                            style={styles.input}
                        />
                    </>
                );

            case 2: {
                const babyAge = answers.dateOfBirth
                    ? getBabyAge(answers.dateOfBirth)
                    : null;

                return (
                    <>
                        <Text style={styles.question}>
                            Enter your child's date of birth.
                        </Text>

                        <Text style={styles.dateDescription}>
                            Your child's age will be calculated in months
                            and used to personalize meal plans and recipes.
                        </Text>

                        <View style={styles.datePickerContainer}>
                            <View style={styles.datePickerBox}>
                                <Picker
                                    selectedValue={birthDate.month}
                                    onValueChange={value =>
                                        updateBirthDate(
                                            'month',
                                            String(value),
                                        )
                                    }
                                    style={styles.datePicker}
                                    dropdownIconColor={colors.text}
                                >
                                    <Picker.Item
                                        label="MM"
                                        value=""
                                        enabled={false}
                                    />

                                    {MONTHS.map(month => (
                                        <Picker.Item
                                            key={month}
                                            label={String(month).padStart(
                                                2,
                                                '0',
                                            )}
                                            value={String(month)}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.datePickerBox}>
                                <Picker
                                    selectedValue={birthDate.day}
                                    onValueChange={value =>
                                        updateBirthDate(
                                            'day',
                                            String(value),
                                        )
                                    }
                                    style={styles.datePicker}
                                    dropdownIconColor={colors.text}
                                >
                                    <Picker.Item
                                        label="DD"
                                        value=""
                                        enabled={false}
                                    />

                                    {days.map(day => (
                                        <Picker.Item
                                            key={day}
                                            label={String(day).padStart(
                                                2,
                                                '0',
                                            )}
                                            value={String(day)}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.datePickerBox}>
                                <Picker
                                    selectedValue={birthDate.year}
                                    onValueChange={value =>
                                        updateBirthDate(
                                            'year',
                                            String(value),
                                        )
                                    }
                                    style={styles.datePicker}
                                    dropdownIconColor={colors.text}
                                >
                                    <Picker.Item
                                        label="YYYY"
                                        value=""
                                        enabled={false}
                                    />

                                    {years.map(year => (
                                        <Picker.Item
                                            key={year}
                                            label={String(year)}
                                            value={String(year)}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {babyAge && (
                            <Text style={styles.agePreview}>
                                Baby age: {babyAge.display}
                            </Text>
                        )}
                    </>
                );
            }

            case 3:
                return (
                    <>
                        <Text style={styles.question}>
                            What is your child’s gender?
                        </Text>

                        {GENDER_OPTIONS.map(option =>
                            renderSingleOption(
                                option.label,
                                answers.gender === option.value,
                                () =>
                                    updateAnswer(
                                        'gender',
                                        option.value,
                                    ),
                            ),
                        )}
                    </>
                );

            case 4:
                return (
                    <>
                        <Text style={styles.question}>
                            Enter your child's weight
                        </Text>

                        <Text style={styles.fieldDescription}>
                            Enter your child's current weight to help
                            BabyNutri calculate growth indicators and
                            provide personalized nutrition recommendations.
                        </Text>

                        <View style={styles.unitRow}>

                            <UnitOption
                                title="pounds"
                                selected={
                                    answers.weightUnit === 'lb'
                                }
                                onPress={() =>
                                    updateAnswer(
                                        'weightUnit',
                                        'lb',
                                    )
                                }
                            />

                            <UnitOption
                                title="kg"
                                selected={
                                    answers.weightUnit === 'kg'
                                }
                                onPress={() =>
                                    updateAnswer(
                                        'weightUnit',
                                        'kg',
                                    )
                                }
                            />

                        </View>

                        <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={weightText}
                            onChangeText={handleWeightChange}
                            placeholder="0.0"
                        />
                    </>
                );


            case 5:
                return (
                    <>
                        <Text style={styles.question}>
                            Enter your child's height
                        </Text>

                        <Text style={styles.fieldDescription}>
                            Enter your child's current height to help
                            BabyNutri calculate growth indicators and
                            provide personalized nutrition recommendations.
                        </Text>

                        <View style={styles.unitRow}>

                            <UnitOption
                                title="inches"
                                selected={
                                    answers.heightUnit === 'in'
                                }
                                onPress={() =>
                                    updateAnswer(
                                        'heightUnit',
                                        'in',
                                    )
                                }
                            />

                            <UnitOption
                                title="cm"
                                selected={
                                    answers.heightUnit === 'cm'
                                }
                                onPress={() =>
                                    updateAnswer(
                                        'heightUnit',
                                        'cm',
                                    )
                                }
                            />

                        </View>

                        <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={heightText}
                            onChangeText={handleHeightChange}
                            placeholder="0.0"
                        />
                    </>
                );
            case 6:
                return (
                    <>
                        <Text style={styles.question}>
                            Does your child have any allergies?
                        </Text>

                        {ALLERGY_OPTIONS.map(option =>
                            renderSingleOption(
                                option,
                                answers.allergies.includes(option),
                                () => toggleAllergy(option),
                            ),
                        )}
                    </>
                );
            case 7:
                return (
                    <>
                        <Text style={styles.question}>
                            What is your main nutrition goal?
                        </Text>

                        {NUTRITION_GOAL_OPTIONS.map(option =>
                            renderSingleOption(
                                option,
                                answers.nutritionGoal === option,
                                () =>
                                    updateAnswer(
                                        'nutritionGoal',
                                        option,
                                    ),
                            ),
                        )}
                    </>
                );

            case 8:
                return (
                    <>
                        <Text style={styles.question}>
                            What foods does your child prefer?
                        </Text>

                        {FOOD_PREFERENCE_OPTIONS.map(option =>
                            renderSingleOption(
                                option,
                                answers.foodPreferences.includes(option),
                                () => toggleFoodPreference(option),
                            ),
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressValue,
                            {
                                width: `${((currentStep + 1) /
                                    TOTAL_STEPS) *
                                    100
                                    }%`,
                            },
                        ]}
                    />
                </View>

                <Text style={styles.stepText}>
                    Step {currentStep + 1} of {TOTAL_STEPS}
                </Text>

                <ScrollView
                    style={styles.questionContainer}
                    contentContainerStyle={
                        styles.questionContent
                    }
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    {renderQuestion()}
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}>
                        <Text style={styles.backButtonText}>
                            Back
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleNext}
                        style={styles.nextButton}>
                        <Text style={styles.nextButtonText}>
                            {currentStep === TOTAL_STEPS - 1
                                ? 'Finish'
                                : 'Continue'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}


export default QuestionnaireScreen;