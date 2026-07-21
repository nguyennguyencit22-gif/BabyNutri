import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';
import { RootStackParamList } from './navigationTypes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import QuestionnaireScreen from '@/screens/questions/QuestionnaireScreen';

import FeatureIntroScreen from '../screens/onboarding/FeatureIntroScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />

      {/* <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      /> */}

      <Stack.Screen
        name="Questionnaire"
        component={QuestionnaireScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="FeatureIntro"
        component={FeatureIntroScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;