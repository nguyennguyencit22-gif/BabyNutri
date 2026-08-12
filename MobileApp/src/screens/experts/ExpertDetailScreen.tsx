import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { fetchExpertById, toggleFollowExpert, ExpertDetail } from '../../services/expert.service';
import { getRecipeImage } from '../../constants/recipeImages';
import { getArticleImage } from '../../constants/articleImages';
import { useAppTheme } from '../../theme/useAppTheme';

export const ExpertDetailScreen = ({ route, navigation }: any) => {
  const { expertId } = route.params || {};
  const { colors, isDark } = useAppTheme();

  const [expert, setExpert] = useState<ExpertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const loadExpert = useCallback(async () => {
    if (!expertId) return;
    setLoading(true);
    try {
      const data = await fetchExpertById(expertId);
      setExpert(data);
      setFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
    } catch (e) {
      console.error('Load expert details error:', e);
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useFocusEffect(
    useCallback(() => {
      loadExpert();
    }, [loadExpert])
  );

  const handleToggleFollow = async () => {
    if (!expert) return;
    try {
      const res = await toggleFollowExpert(expert.id);
      setFollowing(res.isFollowing);
      setFollowerCount(res.followerCount);
    } catch (err: any) {
      Alert.alert('Notice', err.message || 'Please log in to follow experts.');
    }
  };

  if (loading || !expert) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.headerBox}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Expert Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: '#FF5F70' }]}>
            <Text style={styles.avatarLetter}>{expert.fullName.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{expert.fullName}</Text>
          <Text style={[styles.spec, { color: '#FF5F70' }]}>
            {expert.specialization || 'Pediatric Nutrition Expert'}
          </Text>

          <View style={styles.badgeRow}>
            {expert.certificate && (
              <View style={styles.badge}>
                <Icon source="shield-check-outline" size={14} color="#10B981" />
                <Text style={styles.badgeText}>{expert.certificate}</Text>
              </View>
            )}
            {!!expert.experienceYear && (
              <View style={styles.badge}>
                <Icon source="star" size={14} color="#F59E0B" />
                <Text style={styles.badgeText}>{expert.experienceYear} Years Exp</Text>
              </View>
            )}
          </View>

          {!!expert.information && (
            <Text style={[styles.bio, { color: colors.textSoft }]}>{expert.information}</Text>
          )}

          {/* Followers Stats & Button */}
          <View style={styles.statsFollowRow}>
            <View style={styles.statGroup}>
              <Text style={[styles.statNum, { color: colors.text }]}>{followerCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>Followers</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={[styles.statNum, { color: colors.text }]}>{expert.recipes?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>Recipes</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={[styles.statNum, { color: colors.text }]}>{expert.articles?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>Articles</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followBtn, following && styles.followingBtn]}
            onPress={handleToggleFollow}
            activeOpacity={0.85}
          >
            <Icon source={following ? 'check' : 'account-plus-outline'} size={18} color="#FFFFFF" />
            <Text style={styles.followBtnText}>{following ? 'Following' : 'Follow Expert'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recipes Section */}
        {expert.recipes && expert.recipes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recipes by {expert.fullName}</Text>
            {expert.recipes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}
                activeOpacity={0.85}
              >
                <Image source={getRecipeImage(item.id, item.image_url)} style={styles.thumb} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSoft }]}>
                    {item.calories} kcal • {item.month_age}+ months
                  </Text>
                </View>
                <Icon source="chevron-right" size={18} color={colors.textSoft} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Articles Section */}
        {expert.articles && expert.articles.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Articles by {expert.fullName}</Text>
            {expert.articles.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('ArticleDetail', { id: item.id })}
                activeOpacity={0.85}
              >
                <Image source={getArticleImage(item.id, item.image_url)} style={styles.thumb} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSoft }]} numberOfLines={1}>
                    {item.summary || item.title}
                  </Text>
                </View>
                <Icon source="chevron-right" size={18} color={colors.textSoft} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 10,
    gap: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 16, paddingBottom: 60 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLetter: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  spec: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#4B3034' },
  bio: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 16, paddingHorizontal: 10 },
  statsFollowRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FFE4E6', marginBottom: 16 },
  statGroup: { alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  followBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF5F70', width: '100%', paddingVertical: 12, borderRadius: 14 },
  followingBtn: { backgroundColor: '#10B981' },
  followBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1, marginBottom: 8, gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#EEE' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  itemSub: { fontSize: 11, marginTop: 2 },
});

export default ExpertDetailScreen;
