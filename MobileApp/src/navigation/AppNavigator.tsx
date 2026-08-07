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

import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import AddRecipeScreen from '../screens/recipes/AddRecipeScreen';
import EditRecipeScreen from '../screens/recipes/EditRecipeScreen';
import SearchRecipeScreen from '../screens/recipes/SearchRecipeScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import AddArticleScreen from '../screens/articles/AddArticleScreen';
import SavedItemsScreen from '../screens/saved/SavedItemsScreen';

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

      {/* Screens thuộc Module Công thức & Bài viết */}
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: 'Chi tiết công thức', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: 'Thêm công thức mới', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="EditRecipe"
        component={EditRecipeScreen}
        options={{ title: 'Chỉnh sửa công thức', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="SearchRecipe"
        component={SearchRecipeScreen}
        options={{ title: 'Tìm kiếm công thức', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: 'Chi tiết bài viết', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddArticle"
        component={AddArticleScreen}
        options={{ title: 'Tạo bài viết chia sẻ', headerTintColor: '#FF5F70' }}
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

      {/* Screens thuộc Module Quản lý Bé, Thực đơn & FAQ (Member C) */}
      <Stack.Screen
        name="ChildList"
        component={ChildListScreen}
        options={{ title: 'Danh sách hồ sơ bé', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="ChildDetail"
        component={ChildDetailScreen}
        options={{ title: 'Thông tin chi tiết bé', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="AddEditChild"
        component={AddEditChildScreen}
        options={{ title: 'Hồ sơ bé', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="MealPlanList"
        component={MealPlanListScreen}
        options={{ title: 'Kế hoạch thực đơn', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="MealPlanDetail"
        component={MealPlanDetailScreen}
        options={{ title: 'Chi tiết thực đơn', headerTintColor: '#FF5F70' }}
      />
      <Stack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{ title: 'Hỏi đáp & FAQ', headerTintColor: '#FF5F70' }}
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
    </Stack.Navigator>
  );
}

export default AppNavigator;
