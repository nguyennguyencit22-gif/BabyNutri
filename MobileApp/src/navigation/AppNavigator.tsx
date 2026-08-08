import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { RootStackParamList } from './navigationTypes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

// Member C Screens
import { ChildListScreen } from '../screens/children/ChildListScreen';
import { ChildDetailScreen } from '../screens/children/ChildDetailScreen';
import { AddEditChildScreen } from '../screens/children/AddEditChildScreen';
import { MealPlanListScreen } from '../screens/mealPlans/MealPlanListScreen';
import { MealPlanDetailScreen } from '../screens/mealPlans/MealPlanDetailScreen';
import { FAQScreen } from '../screens/questions/FAQScreen';

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

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      {/* Member C Screens */}
      <Stack.Screen name="ChildList" component={ChildListScreen} options={{ title: 'Children' }} />
      <Stack.Screen name="ChildDetail" component={ChildDetailScreen} options={{ title: 'Child Details' }} />
      <Stack.Screen name="AddEditChild" component={AddEditChildScreen} options={{ title: 'Edit Child' }} />
      
      <Stack.Screen name="MealPlanList" component={MealPlanListScreen} options={{ title: 'Meal Plans' }} />
      <Stack.Screen name="MealPlanDetail" component={MealPlanDetailScreen} options={{ title: 'Meal Plan Details' }} />
      
      <Stack.Screen name="FAQ" component={FAQScreen} options={{ title: 'FAQ' }} />

    </Stack.Navigator>
  );
}

export default AppNavigator;