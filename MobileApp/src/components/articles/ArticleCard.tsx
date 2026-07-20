import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ArticleListItem } from '../../types/article';

interface Props {
  article: ArticleListItem;
  onPress: () => void;
}

const ArticleCard: React.FC<Props> = ({ article, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: article.image_url }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      {!!article.summary && <Text style={styles.summary} numberOfLines={2}>{article.summary}</Text>}
      <Text style={styles.date}>
        {article.author}{article.published_date ? ` · ${new Date(article.published_date).toLocaleDateString('vi-VN')}` : ''}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  image: { width: '100%', height: 160, backgroundColor: '#EEE' },
  info: { padding: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#2E2E2E', marginBottom: 4 },
  summary: { fontSize: 13, color: '#6B6B6B', marginBottom: 6 },
  date: { fontSize: 11, color: '#B0B0B0' },
});

export default ArticleCard;