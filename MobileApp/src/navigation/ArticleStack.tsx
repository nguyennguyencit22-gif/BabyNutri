import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArticleListScreen from '../screens/articles/ArticleListScreen';
import ArticleDetailScreen from '../screens/articles/ArticleDetailScreen';

export type ArticleStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { id: number };
};

const Stack = createNativeStackNavigator<ArticleStackParamList>();

export default function ArticleStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ArticleList" component={ArticleListScreen} options={{ title: 'Bài viết' }} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ title: 'Chi tiết bài viết' }} />
    </Stack.Navigator>
  );
}