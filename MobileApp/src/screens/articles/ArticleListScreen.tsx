import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import ArticleCard from '../../components/articles/ArticleCard';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { useArticleStore } from '../../stores/useArticleStore';
import type { RootState } from '../../store/Store';

const PencilIcon = ({ size = 12, color = '#FF7A59' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const PAGE_SIZE = 3;

interface ArticleListScreenProps {
  navigation: any;
  hideTopHeader?: boolean;
}

const ArticleListScreen: React.FC<ArticleListScreenProps> = ({ navigation, hideTopHeader = false }) => {
  const { articles, loading, fetchArticles } = useArticleStore();
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && user?.role === 'expert';

  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const avatarUrl = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FF5F70&color=fff&bold=true`;

  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [fetchArticles])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchArticles();
    setRefreshing(false);
  };

  const recommendedArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    return [...articles].sort((a, b) => (b.id % 5) - (a.id % 5));
  }, [articles]);

  const visibleArticles = useMemo(() => {
    return recommendedArticles.slice(0, page * PAGE_SIZE);
  }, [recommendedArticles, page]);

  const hasMore = visibleArticles.length < recommendedArticles.length;

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prevPage) => prevPage + 1);
      setLoadingMore(false);
    }, 600);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF5F70" /></View>;

  const renderHeader = () => (
    <View style={styles.headerBox}>
      <Text style={styles.headerTitle}>Nutrition Articles</Text>

      {isExpert && (
        <TouchableOpacity
          style={styles.postPrompt}
          onPress={() => navigation.navigate('AddArticle')}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={styles.promptAvatar}
          />
          <Text style={styles.promptText}>What's on your mind?...</Text>
          <View style={styles.badgeContainer}>
            <PencilIcon size={12} color="#FFFFFF" />
            <Text style={styles.postBadgeText}>Post</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF5F70" />
        <Text style={styles.footerText}>Loading more articles...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!hideTopHeader && <TopHeaderBar />}
      <FlatList
        data={visibleArticles}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5F70']} />}
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => navigation.navigate('ArticleDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No articles on newsfeed yet</Text>}
      />
      {isExpert && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddArticle')} activeOpacity={0.85}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F2' },
  headerBox: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14, backgroundColor: '#FFFFFF', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#FFE4E6', shadowColor: '#FF5F70', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#4B3034', marginBottom: 12, letterSpacing: -0.3 },
  postPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F2',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  promptAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  promptText: { flex: 1, fontSize: 13, color: '#8E7377', fontWeight: '500' },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF5F70',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  postBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  list: { paddingBottom: 90 },
  footerLoader: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  footerText: { fontSize: 12, color: '#8E7377', fontWeight: '500' },
  empty: { textAlign: 'center', marginTop: 40, color: '#8E7377', fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF5F70', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#FF5F70', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '300' },
});

export default ArticleListScreen;