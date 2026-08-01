import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArticleListScreen from '../screens/articles/ArticleListScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';
import AddArticleScreen from '../screens/articles/AddArticleScreen';
import SavedItemsScreen from '../screens/saved/SavedItemsScreen';

export type ArticleStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { id: number };
  AddArticle: undefined;
  SavedItems: undefined;
};

const Stack = createNativeStackNavigator<ArticleStackParamList>();

export default function ArticleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ArticleList" component={ArticleListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: 'Chi tiết bài viết' }} />
      <Stack.Screen name="AddArticle" component={AddArticleScreen} options={{ title: 'Tạo bài viết chia sẻ' }} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}