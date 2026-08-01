import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';

import type {
    ChildQuestionnaire,
    Gender,
} from '../../types/auth/questionnaire';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../../styles/questions/questionnaireStyles';
import { Picker } from '@react-native-picker/picker';
import { getBabyAge } from '../../utils/calculateBabyAge';
import {
    MONTHS,
    getYears,
    getDaysInMonth,
} from '../../utils/dateUtils';
import { useDispatch } from 'react-redux';
import { PROFILE_COLORS } from '@/constants/profile/babyProfileData';
import { addBaby } from '@/store/babySlice';
import type { AppDispatch, } from '../../store/Store';


const TOTAL_STEPS = 7;

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

const ALLERGY_OPTIONS = [
    'Milk',
    'Eggs',
    'Peanuts',
    'Seafood',
    'None',
];

const NUTRITION_GOAL_OPTIONS = [
    'Healthy growth',
    'Weight gain',
    'Weight management',
    'Balanced diet',
    'Improve appetite',
];

const FOOD_PREFERENCE_OPTIONS = [
    'Rice and noodles',
    'Vegetables',
    'Fruit',
    'Meat',
    'Fish',
];

function QuestionnaireScreen({ navigation, route }: any) {
    const userMode: 'guest' | 'authenticated' =
        route.params?.userMode ?? 'guest';

    const [currentStep, setCurrentStep] = useState(0);

    const dispatch = useDispatch<AppDispatch>();

    const [answers, setAnswers] =
        useState<ChildQuestionnaire>({
            hasChild: null,
            childName: '',
            dateOfBirth: '',
            gender: '',
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
                if (answers.allergies.length === 0) {
                    Alert.alert(
                        'Required',
                        'Please select at least one option.',
                    );
                    return false;
                }
                break;

            case 5:
                if (!answers.nutritionGoal) {
                    Alert.alert(
                        'Required',
                        'Please select a nutrition goal.',
                    );
                    return false;
                }
                break;

            case 6:
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



    const handleNext = () => {
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

        dispatch(
            addBaby({
                id: Date.now().toString(),
                name: answers.childName.trim(),
                profileColor: PROFILE_COLORS[0],
                gender,
                dateOfBirth: answers.dateOfBirth,
                allergies: answers.allergies,
            }),
        );

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
                                    dropdownIconColor="#4A1712"
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
                                    dropdownIconColor="#4A1712"
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
                                    dropdownIconColor="#4A1712"
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
            case 5:
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

            case 6:
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

                <View style={styles.questionContainer}>
                    {renderQuestion()}
                </View>

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