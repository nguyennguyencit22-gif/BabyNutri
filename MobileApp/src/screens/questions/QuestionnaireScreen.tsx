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
import { SafeAreaView, } from 'react-native-safe-area-context';
import styles from '../../styles/questions/questionnaireStyles';
import { Picker } from '@react-native-picker/picker';

const TOTAL_STEPS = 7;

function QuestionnaireScreen({ navigation, route }: any) {
    const userMode: 'guest' | 'authenticated' =
        route.params?.userMode ?? 'guest';

    const [currentStep, setCurrentStep] = useState(0);

    const [answers, setAnswers] =
        useState<ChildQuestionnaire>({
            hasChild: null,
            childName: '',
            ageGroup: '',
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

    const toggleMultiSelect = (
        key: 'allergies' | 'foodPreferences',
        value: string,
    ) => {
        const selectedValues = answers[key];

        const updatedValues = selectedValues.includes(value)
            ? selectedValues.filter(item => item !== value)
            : [...selectedValues, value];

        updateAnswer(key, updatedValues);
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
                break;

            case 2:
                if (!answers.ageGroup) {
                    Alert.alert(
                        'Required',
                        'Please select an age group.',
                    );
                    return false;
                }
                break;
            case 3:
                if (answers.allergies.length === 0) {
                    Alert.alert(
                        'Required',
                        'Please select at least one option.',
                    );
                    return false;
                }
                break;
            case 4:
                if (!answers.gender) {
                    Alert.alert(
                        'Required',
                        'Please select a gender.',
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
                if (answers.foodPreferences.length === 0) {
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
        if (!validateCurrentStep()) {
            return;
        }

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
                        },
                    },
                ],
            });

            return;
        }

        if (currentStep < TOTAL_STEPS - 1) {
            setCurrentStep(previous => previous + 1);
            return;
        }

        handleSubmit();
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(previous => previous - 1);
            return;
        }

        navigation.goBack();
    };

    const handleSubmit = async () => {
        try {
            console.log('User mode:', userMode);
            console.log('Questionnaire answers:', answers);

            // Sau này:
            // guest -> lưu AsyncStorage
            // authenticated -> gửi backend

            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Home',
                        params: {
                            userMode,
                            hasChild: true,
                            questionnaire: answers,
                        },
                    },
                ],
            });
        } catch {
            Alert.alert(
                'Error',
                'Unable to save your answers.',
            );
        }
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
    
    const currentYear = new Date().getFullYear();

    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthYear, setBirthYear] = useState('');

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

            case 2:
                return (
                    <>
                        <Text style={styles.question}>
                            Enter your child's date of birth.
                        </Text>

                        {[
                            'Under 1 year',
                            '1–3 years',
                            '4–6 years',
                            '7–12 years',
                        ].map(option =>
                            renderSingleOption(
                                option,
                                answers.ageGroup === option,
                                () =>
                                    updateAnswer(
                                        'ageGroup',
                                        option,
                                    ),
                            ),
                        )}
                    </>
                );

            case 3:
                return (
                    <>
                        <Text style={styles.question}>
                            What is your child’s gender?
                        </Text>

                        {[
                            {
                                label: 'Male',
                                value: 'male',
                            },
                            {
                                label: 'Female',
                                value: 'female',
                            },
                            {
                                label: 'Other',
                                value: 'other',
                            },
                        ].map(option =>
                            renderSingleOption(
                                option.label,
                                answers.gender === option.value,
                                () =>
                                    updateAnswer(
                                        'gender',
                                        option.value as Gender,
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

                        {[
                            'Milk',
                            'Eggs',
                            'Peanuts',
                            'Seafood',
                            'None',
                        ].map(option =>
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

                        {[
                            'Healthy growth',
                            'Weight gain',
                            'Weight management',
                            'Balanced diet',
                            'Improve appetite',
                        ].map(option =>
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

                        {[
                            'Rice and noodles',
                            'Vegetables',
                            'Fruit',
                            'Meat',
                            'Fish',
                        ].map(option =>
                            renderSingleOption(
                                option,
                                answers.foodPreferences.includes(
                                    option,
                                ),
                                () =>
                                    toggleMultiSelect(
                                        'foodPreferences',
                                        option,
                                    ),
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