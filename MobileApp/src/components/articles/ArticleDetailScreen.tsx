import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { articleService } from '../../services/article.service';
import { Article } from '../../types/article';

const ArticleDetailScreen = ({ route }: any) => {
  const { id } = route.params;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getById(id)
      .then(setArticle)
      .catch((e) => console.error('Load article error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;
  if (!article) return <View style={styles.center}><Text>Không tìm thấy bài viết</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: article.image_url }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          Tác giả: {article.author}
          {article.published_date ? ` · ${new Date(article.published_date).toLocaleDateString('vi-VN')}` : ''}
        </Text>
        <Text style={styles.body}>{article.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220, backgroundColor: '#EEE' },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#2E2E2E', marginBottom: 8 },
  meta: { fontSize: 12, color: '#8A8A8A', marginBottom: 16 },
  body: { fontSize: 15, color: '#3A3A3A', lineHeight: 24 },
});

export default ArticleDetailScreen;