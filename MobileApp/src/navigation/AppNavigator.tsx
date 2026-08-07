import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { RootStackParamList } from '../types/navigation/navigationTopTypes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import QuestionnaireScreen from '../screens/questions/QuestionnaireScreen';
import MainTabNavigator from './MainTabNavigator';
import FeatureIntroScreen from '../screens/onboarding/FeatureIntroScreen';
import AddBabyProfileScreen from '../screens/profile/AddBabyProfileScreen';
import InvitationCodeScreen from '../screens/profile/InvitationCodeScreen';
import EditBabyProfileScreen from '../screens/profile/EditBabyProfileScreen';
import AccountSettingsScreen from '../screens/settings/AccountSettingsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ThemeSettingsScreen from '../screens/settings/ThemeSettingsScreen';
import LanguageSettingsScreen from '../screens/settings/LanguageSettingsScreen';
import MeasurementSettingsScreen from '../screens/settings/MeasurementSettingsScreen';
import AboutScreen from '../screens/settings/AboutScreen';

import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import AddRecipeScreen from '../screens/recipes/AddRecipeScreen';
import EditRecipeScreen from '../screens/recipes/EditRecipeScreen';
import SearchRecipeScreen from '../screens/recipes/SearchRecipeScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import AddArticleScreen from '../screens/articles/AddArticleScreen';
import SavedItemsScreen from '../screens/saved/SavedItemsScreen';
import FavoriteRecipesScreen from '../screens/recipes/FavoriteRecipesScreen';

import { ChildListScreen } from '../screens/children/ChildListScreen';
import { ChildDetailScreen } from '../screens/children/ChildDetailScreen';
import { AddEditChildScreen } from '../screens/children/AddEditChildScreen';
import { MealPlanListScreen } from '../screens/mealPlans/MealPlanListScreen';
import { MealPlanDetailScreen } from '../screens/mealPlans/MealPlanDetailScreen';
import { FAQScreen } from '../screens/questions/FAQScreen';
import MealSchedulerScreen from '../screens/recipes/MealSchedulerScreen';

const Stack = createNativeStackNavigator<any>();

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

      {/* Recipe & Article Stack Screens */}
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Recipe Details', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: 'Add New Recipe', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="EditRecipe"
        component={EditRecipeScreen}
        options={{ title: 'Edit Recipe', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="SearchRecipe"
        component={SearchRecipeScreen}
        options={{ title: 'Search Recipes', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: 'Article Details', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddArticle"
        component={AddArticleScreen}
        options={{ title: 'Create Shared Article', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="FavoriteRecipes"
        component={FavoriteRecipesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SavedItems"
        component={SavedItemsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MealScheduler"
        component={MealSchedulerScreen}
        options={{ headerShown: false }}
      />

      {/* Child Profile, Meal Plan & FAQ Stack Screens */}
      <Stack.Screen
        name="ChildList"
        component={ChildListScreen}
        options={{ title: 'Child Profiles List', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="ChildDetail"
        component={ChildDetailScreen}
        options={{ title: 'Child Profile Details', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddEditChild"
        component={AddEditChildScreen}
        options={{ title: 'Child Profile', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="MealPlanList"
        component={MealPlanListScreen}
        options={{ title: 'Weaning Meal Plan', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="MealPlanDetail"
        component={MealPlanDetailScreen}
        options={{ title: 'Meal Plan Details', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ title: 'Help & FAQ', headerTintColor: '#FF5F70' }}
      />

      {/* Settings screens (Member A) */}
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
