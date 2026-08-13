import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { followExpert, unfollowExpert, checkFollowStatus } from '../../services/expert.service';
import RecipeCard from '../../components/recipes/RecipeCard';
import ArticleCard from '../../components/articles/ArticleCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { appAlert } from '../../utils/appAlert';
import ExpertRatingBreakdownModal from '../../components/experts/ExpertRatingBreakdownModal';

export const ExpertDetailScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const expertId = Number(route?.params?.expertId || route?.params?.id || 4);
  const expertName = route?.params?.expertName || route?.params?.name || 'Nutrition Expert';

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const [activeTab, setActiveTab] = useState<'recipes' | 'articles'>('recipes');

  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [ratingBreakdownVisible, setRatingBreakdownVisible] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  const loadExpertData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRecipes, allArticles] = await Promise.all([
        recipeService.getAll().catch(() => []),
        articleService.getAll().catch(() => []),
      ]);

      const expertRecipes = allRecipes.filter((r) => r.expert_id === expertId || r.author === expertName);
      const expertArticles = allArticles.filter((a) => a.expert_id === expertId || a.author === expertName);

      setRecipes(expertRecipes);
      setArticles(expertArticles);

      // Compute weighted rating score
      let totalWeighted = 0;
      let totalCount = 0;

      expertRecipes.forEach((r) => {
        if (r.ratingCount > 0) {
          totalWeighted += r.avgRating * r.ratingCount;
          totalCount += r.ratingCount;
        }
      });

      if (expertArticles.length > 0) {
        const articleSummaries = await Promise.all(
          expertArticles.map((art) => articleService.getRatingSummary(art.id).catch(() => ({ totalRatings: 0, averageRating: 0 })))
        );
        articleSummaries.forEach((s) => {
          if (s.totalRatings > 0) {
            totalWeighted += s.averageRating * s.totalRatings;
            totalCount += s.totalRatings;
          }
        });
      }

      setAvgRating(totalCount > 0 ? totalWeighted / totalCount : 4.8);

      if (authMode !== 'guest') {
        const following = await checkFollowStatus(expertId).catch(() => false);
        setIsFollowing(following);
      }
    } catch (e) {
      console.error('Load expert details error:', e);
    } finally {
      setLoading(false);
    }
  }, [expertId, expertName, authMode]);

  useEffect(() => {
    loadExpertData();
  }, [loadExpertData]);

  const handleToggleFollow = async () => {
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowExpert(expertId);
        setIsFollowing(false);
        appAlert.show('Unfollowed', `You unfollowed ${expertName}`);
      } else {
        await followExpert(expertId);
        setIsFollowing(true);
        appAlert.show('Following', `You are now following ${expertName}. You will receive notifications when new articles/recipes are published!`);
      }
    } catch (e) {
      appAlert.show('Error', 'Unable to update follow status');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.goBack()}>
          <Icon source="arrow-left" size={20} color="#FF5F70" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expert Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF5F70" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image
              source={{ uri: route?.params?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(expertName)}&background=8B5CF6&color=fff&bold=true` }}
              style={styles.avatar}
            />
            <Text style={[styles.expertName, { color: colors.text }]}>{expertName}</Text>
            <View style={styles.verifiedBadge}>
              <Icon source="check-decagram" size={16} color="#8B5CF6" />
              <Text style={styles.verifiedText}>Verified Pediatric Specialist</Text>
            </View>

            <TouchableOpacity
              style={[styles.followBtn, { backgroundColor: isFollowing ? colors.surface : '#8B5CF6', borderColor: '#8B5CF6' }]}
              onPress={handleToggleFollow}
              activeOpacity={0.85}
            >
              <Icon source={isFollowing ? 'account-check' : 'account-plus'} size={18} color={isFollowing ? '#8B5CF6' : '#FFFFFF'} />
              <Text style={[styles.followBtnText, { color: isFollowing ? '#8B5CF6' : '#FFFFFF' }]}>
                {isFollowing ? 'Following' : '+ Follow Expert'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.statBox} onPress={() => setRatingBreakdownVisible(true)} activeOpacity={0.7}>
              <Text style={styles.statVal}>{avgRating > 0 ? avgRating.toFixed(1) : '4.8'}</Text>
              <Text style={[styles.statSub, { color: colors.textSoft }]}>Avg Rating</Text>
            </TouchableOpacity>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{recipes.length}</Text>
              <Text style={[styles.statSub, { color: colors.textSoft }]}>Recipes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{articles.length}</Text>
              <Text style={[styles.statSub, { color: colors.textSoft }]}>Articles</Text>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? '#3A2E31' : '#F5F5F5' }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'recipes' && styles.activeTabBtn]}
              onPress={() => setActiveTab('recipes')}
            >
              <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'recipes' && styles.activeTabText]}>
                Recipes ({recipes.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'articles' && styles.activeTabBtn]}
              onPress={() => setActiveTab('articles')}
            >
              <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'articles' && styles.activeTabText]}>
                Articles ({articles.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content List */}
          {activeTab === 'recipes' ? (
            recipes.length > 0 ? (
              <View style={styles.recipeGrid}>
                {recipes.map((r) => (
                  <View style={styles.gridItem} key={String(r.id)}>
                    <RecipeCard recipe={r} onPress={() => navigation.navigate('RecipeDetail', { id: r.id })} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: colors.textSoft }]}>No recipes published yet.</Text>
              </View>
            )
          ) : articles.length > 0 ? (
            <View style={styles.articleList}>
              {articles.map((a) => (
                <ArticleCard key={String(a.id)} article={a} onPress={() => navigation.navigate('ArticleDetail', { id: a.id })} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: colors.textSoft }]}>No articles published yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <ExpertRatingBreakdownModal
        visible={ratingBreakdownVisible}
        expertId={expertId}
        expertName={expertName}
        onClose={() => setRatingBreakdownVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  expertName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTabBtn: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  articleList: {
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default ExpertDetailScreen;
