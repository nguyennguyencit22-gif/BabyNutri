import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { articleService } from '../../services/article.service';
import { ArticleListItem } from '../../types/article';
import ArticleCard from '../../components/articles/ArticleCard';

const ArticleListScreen = ({ navigation }: any) => {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      const data = await articleService.getAll();
      setArticles(data);
    } catch (e) {
      console.error('Load articles error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bài viết dinh dưỡng</Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadArticles(); }} colors={['#FF7A59']} />}
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có bài viết nào</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2E2E2E', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});

export default ArticleListScreen;