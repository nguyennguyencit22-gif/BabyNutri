import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ArticleListItem } from '../../types/article';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import { getArticleImage, isLocalArticleImage } from '../../constants/articleImages';

interface Props {
  article: ArticleListItem;
  onPress: () => void;
}

const ArticleItem: React.FC<Props> = ({ article, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
    <Image
      source={getArticleImage(article.id, article.image_url)}
      style={styles.thumb}
      resizeMode={isLocalArticleImage(article.id) ? 'contain' : 'cover'}
    />
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
      <Text style={styles.date}>
        {article.author || 'Nutrition Expert'} · {formatRealTimeAgo(article.published_date)}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 8, marginBottom: 10, alignItems: 'center' },
  thumb: { width: 70, height: 70, borderRadius: 10, marginRight: 12, backgroundColor: '#EEE' },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#2E2E2E', marginBottom: 4 },
  date: { fontSize: 11, color: '#B0B0B0' },
});

export default ArticleItem;