import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RecipeListScreen from '../screens/recipes/RecipeListScreen';
import RecipeDetailScreen from '../screens/recipes/RecipeDetailScreen';
import RecipeReviewsScreen from '../screens/recipes/RecipeReviewsScreen';
import AddRecipeScreen from '../screens/recipes/AddRecipeScreen';
import EditRecipeScreen from '../screens/recipes/EditRecipeScreen';
import SearchRecipeScreen from '../screens/recipes/SearchRecipeScreen';
import SavedItemsScreen from '../screens/saved/SavedItemsScreen';

export type RecipeStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { id: number };
  RecipeReviews: { id: number; name?: string };
  AddRecipe: undefined;
  EditRecipe: { id: number };
  SearchRecipe: undefined;
  SavedItems: undefined;
};

const Stack = createNativeStackNavigator<RecipeStackParamList>();

export default function RecipeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }} />
      <Stack.Screen name="RecipeReviews" component={RecipeReviewsScreen} options={{ title: 'Ratings & Reviews' }} />
      <Stack.Screen name="AddRecipe" component={AddRecipeScreen} options={{ title: 'Add Recipe' }} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={{ title: 'Edit Recipe' }} />
      <Stack.Screen name="SearchRecipe" component={SearchRecipeScreen} options={{ title: 'Search Recipes' }} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}