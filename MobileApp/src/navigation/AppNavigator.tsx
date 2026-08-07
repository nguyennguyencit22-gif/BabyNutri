import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';
import { RootStackParamList } from '../types/navigation/navigationTopTypes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import QuestionnaireScreen from '@/screens/questions/QuestionnaireScreen';
import MainTabNavigator from './MainTabNavigator';
import FeatureIntroScreen from '../screens/onboarding/FeatureIntroScreen';
import AddBabyProfileScreen from '@/screens/profile/AddBabyProfileScreen';
import InvitationCodeScreen from '../screens/profile/InvitationCodeScreen';
import EditBabyProfileScreen from '@/screens/profile/EditBabyProfileScreen';
import AccountSettingsScreen from '@/screens/settings/AccountSettingsScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import ThemeSettingsScreen from '@/screens/settings/ThemeSettingsScreen';
import LanguageSettingsScreen from '@/screens/settings/LanguageSettingsScreen';
import MeasurementSettingsScreen from '@/screens/settings/MeasurementSettingsScreen';
import AboutScreen from '@/screens/settings/AboutScreen';
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
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      /> */}
      <Stack.Screen
        name="AddBabyProfile"
        component={AddBabyProfileScreen}
        options={{ headerShown: false }}
      />
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
      <Stack.Screen
        name="InvitationCode"
        component={InvitationCodeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditBabyProfile"
        component={EditBabyProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MeasurementSettings"
        component={MeasurementSettingsScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default AppNavigator;