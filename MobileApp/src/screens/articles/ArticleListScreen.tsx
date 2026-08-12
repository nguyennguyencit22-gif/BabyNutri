import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ArticleCard from '../../components/articles/ArticleCard';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { useArticleStore } from '../../stores/useArticleStore';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';

const PAGE_SIZE = 4;

interface ArticleListScreenProps {
  navigation: any;
  hideTopHeader?: boolean;
}

const ArticleListScreen: React.FC<ArticleListScreenProps> = ({ navigation, hideTopHeader = false }) => {
  const { colors, isDark } = useAppTheme();
  const { articles, loading, fetchArticles } = useArticleStore();
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && (user?.role === 'expert' || (user?.role as any) === 'EXPERT' || user?.role === 'admin');

  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : (isExpert ? 'Nutrition Expert' : 'Parent'));
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

  // Algorithm sorting articles by real interaction counts & high 5-star ratings (no fake default fallback)
  const calculateArticleScore = useCallback((art: any) => {
    const avgRating = Number(art.rating || art.averageRating || 0);
    const ratingCount = Number(art.rating_count || art.ratingCount || 0);
    const likes = Number(art.likes_count || art.likes || 0);
    const comments = Number(art.comments_count || art.comments || 0);

    const score = (avgRating * 25) + Math.min(ratingCount * 3, 60) + (likes * 2) + (comments * 3);
    return score;
  }, []);

  const sortedArticles = useMemo(() => {
    if (!Array.isArray(articles)) return [];
    return [...articles].sort((a, b) => calculateArticleScore(b) - calculateArticleScore(a));
  }, [articles, calculateArticleScore]);

  const visibleArticles = useMemo(() => {
    return sortedArticles.slice(0, page * PAGE_SIZE);
  }, [sortedArticles, page]);

  const hasMore = visibleArticles.length < sortedArticles.length;

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 400);
  };

  const handleArticlePress = (articleId: number) => {
    try {
      navigation.navigate('ArticleDetail', { id: articleId });
    } catch {
      navigation.navigate('Articles', { screen: 'ArticleDetail', params: { id: articleId } });
    }
  };

  const handleCreatePress = () => {
    if (!isExpert) return;
    try {
      navigation.navigate('AddArticle');
    } catch {
      navigation.navigate('Articles', { screen: 'AddArticle' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideTopHeader && <TopHeaderBar />}

      {/* Role Banner */}
      <View style={[styles.roleBannerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.authorRow}>
          <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
            <View style={[styles.roleTag, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
              <Text style={styles.roleTagText}>{isExpert ? 'Verified Expert' : 'Parent Community'}</Text>
            </View>
          </View>

          {isExpert && (
            <TouchableOpacity style={[styles.postBtn, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: colors.border }]} onPress={handleCreatePress} activeOpacity={0.85}>
              <Icon source="pencil" size={14} color="#FF7A59" />
              <Text style={styles.postBtnText}>Publish Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isExpert && (
          <View style={[styles.parentNoticeBox, { backgroundColor: isDark ? '#3A2E31' : '#FEF3C7' }]}>
            <Icon source="star" size={14} color="#D97706" />
            <Text style={[styles.parentNoticeText, { color: isDark ? '#F59E0B' : '#B45309' }]}>
              Parents can rate 5 stars, comment, like & save articles. Expert posts are verified.
            </Text>
          </View>
        )}
      </View>

      {loading && articles.length === 0 ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          key="article-feed-sorted-list"
          data={visibleArticles}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7A59']} />
          }
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={() => handleArticlePress(item.id)}
              onRefreshList={fetchArticles}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#FF7A59" />
                <Text style={[styles.footerText, { color: colors.textSoft }]}>Loading more top articles...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: colors.textSoft }]}>No articles published yet.</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  roleBannerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0D6',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0F2',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B3034',
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5F70',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A59',
  },
  parentNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  parentNoticeText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    lineHeight: 15,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#8E7377',
  },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#888888', fontSize: 14 },
});

export default ArticleListScreen;