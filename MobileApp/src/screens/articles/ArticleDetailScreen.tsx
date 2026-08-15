import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Animated, Share, Alert, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '../../components/common/AppIcon';
import { articleService } from '../../services/article.service';
import { Article } from '../../types/article';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import type { RootState } from '../../store/store';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { addActivity } from '../../store/historySlice';
import RatingSummaryPreview from '../../components/common/RatingSummaryPreview';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';
import { getArticleImage, isLocalArticleImage } from '../../constants/articleImages';

interface CommentItem {
  id: number;
  userName: string;
  avatar: string;
  content: string;
  time: string;
}

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topSafeOffset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20) + 8;
  const id = Number(route?.params?.id);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState('');

  // Save / Bookmark / Rating state
  const { savedArticleIds = [], toggleBookmarkArticle } = useBookmarkStore();
  const isSaved = savedArticleIds.includes(id);
  const [liked, setLiked] = useState(isSaved);

  // Real ratings only (default 0)
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isStaffOrAdmin = authMode === 'authenticated' && (user?.role === 'expert' || user?.role === 'admin');
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const currentUserAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=FF5F70&color=fff&bold=true`;

  const isCurrentUserAuthor = !article?.author || article.author === 'Parent' || article.author === currentUserName;
  const displayAuthor = isCurrentUserAuthor ? currentUserName : article?.author;

  const dispatch = useDispatch();

  const loadSavedComments = useCallback(async () => {
    try {
      const data = await articleService.getComments(id);
      if (Array.isArray(data)) {
        setComments(data.map(c => ({
          id: c.id,
          userName: c.userName || 'User',
          avatar: c.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.userName || 'User')}&background=FF5F70&color=fff&bold=true`,
          content: c.content,
          time: formatRealTimeAgo(c.createdAt),
        })));
      }
    } catch (e) {
      console.error('Load comments error:', e);
    }
  }, [id]);

  const loadRatingData = useCallback(async () => {
    try {
      const summary = await articleService.getRatingSummary(id);
      setAvgRating(summary.averageRating);
      setRatingCount(summary.totalRatings);

      if (authMode !== 'guest') {
        const myR = await articleService.getMyRating(id);
        setUserRating(myR || 0);
      }
    } catch (e) {
      console.error('Load rating data error:', e);
    }
  }, [id, authMode]);

  const saveRatingData = async (newScore: number) => {
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    try {
      await articleService.rate(id, newScore);
      setUserRating(newScore);
      await loadRatingData();

      dispatch(addActivity({
        type: 'rate',
        title: `Rated article ${newScore}⭐: ${article?.title || 'Article'}`,
        details: `Rating saved on server.`,
        icon: '⭐',
      }));

      appAlert.show(
        'Evaluation Saved',
        `You rated "${article?.title}" ${newScore} out of 5 stars!`,
        undefined,
        'star',
      );
    } catch (e) {
      console.error('Save rating error:', e);
    }
  };

  const fetchArticleDetail = useCallback(() => {
    setLoading(true);
    articleService.getById(id)
      .then(setArticle)
      .catch((e) => console.error('Load article error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchArticleDetail();
    loadSavedComments();
    loadRatingData();
  }, [fetchArticleDetail, loadSavedComments, loadRatingData]);

  useEffect(() => {
    setLiked(isSaved);
  }, [isSaved]);

  const handleAddComment = async () => {
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    const text = commentInput.trim();
    if (!text) {
      appAlert.show('Notice', 'Please write a comment first');
      return;
    }

    try {
      await articleService.addComment(id, text);
      setCommentInput('');
      await loadSavedComments();

      dispatch(addActivity({
        type: 'comment',
        title: `Commented on: ${article?.title}`,
        details: `"${text.slice(0, 30)}..."`,
        icon: 'comment',
      }));

      appAlert.show('Success', 'Comment posted successfully!', undefined, 'success');
    } catch (e) {
      appAlert.show('Error', 'Failed to post comment. Please try again.');
    }
  };

  const handleToggleLikeAndSave = () => {
    const isNowSaved = toggleBookmarkArticle(id);
    setLiked(isNowSaved);

    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScaleAnim, { toValue: 1, bounciness: 12, speed: 20, useNativeDriver: true }),
    ]).start();

    if (isNowSaved) {
      dispatch(addActivity({
        type: 'like',
        title: `Liked & Saved: ${article?.title || 'Article'}`,
        details: 'Added to Favourites & Saved Articles tab',
        icon: 'heart',
      }));
      appAlert.show(
        'Saved to Favourites',
        'This article has been saved in your Saved & Favorite Articles list.',
        undefined,
        'heart',
      );
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditArticle', { id });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await articleService.remove(id);
              Alert.alert('Success', 'Article deleted', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              console.error('Delete article error:', e);
              Alert.alert('Error', 'Unable to delete this article');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleExternalShare = async () => {
    if (!article) return;
    try {
      const webUrl = `https://babynutri.app/articles/${article.id}`;
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary || ''}\n\nRead more on Web & App:\n${webUrl}`,
        url: webUrl,
      });

      dispatch(addActivity({
        type: 'action',
        title: `Shared article link: ${article.title}`,
        details: 'External web & app link shared',
        icon: 'link',
      }));
    } catch (e) {
      console.error('Share article error:', e);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF7A59" /></View>;
  if (!article) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Article not found</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ position: 'relative' }}>
          <Image
            source={getArticleImage(article.id, article.image_url)}
            style={styles.image}
            resizeMode={isLocalArticleImage(article.id) ? 'contain' : 'cover'}
          />
          <TouchableOpacity 
            style={[styles.floatingBackBtn, { backgroundColor: colors.surface, top: topSafeOffset }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="chevron-left" size={24} color="#FF7A59" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>
          <Text style={[styles.meta, { color: colors.textSoft }]}>
            Author: {displayAuthor} · {formatRealTimeAgo(article.published_date)}
          </Text>

          {(!!article.category || !!article.target_age || !!article.reading_time) && (
            <View style={styles.badgeRow}>
              {!!article.category && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
                  <Icon source="notebook-outline" size={13} color={colors.textSoft} />
                  <Text style={[styles.badgeText, { color: colors.textSoft }]}>{article.category}</Text>
                </View>
              )}
              {!!article.target_age && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
                  <Icon source="baby-face-outline" size={13} color={colors.textSoft} />
                  <Text style={[styles.badgeText, { color: colors.textSoft }]}>{article.target_age}</Text>
                </View>
              )}
              {!!article.reading_time && (
                <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
                  <Icon source="clock-outline" size={13} color={colors.textSoft} />
                  <Text style={[styles.badgeText, { color: colors.textSoft }]}>{article.reading_time}</Text>
                </View>
              )}
            </View>
          )}

          {/* Edit & Delete Article Buttons (Only Expert or Admin) */}
          {isStaffOrAdmin && (
            <View style={styles.editDeleteRow}>
              <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <Icon source="pencil" size={18} color="#FF7A59" />
                <Text style={styles.editBtnText}>Edit Article</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                <Icon source="delete-outline" size={18} color="#DC2626" />
                <Text style={styles.deleteBtnText}>{deleting ? 'Deleting...' : 'Delete Article'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons: Like (also saves to Favourites) & Share */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, liked && styles.activeActionBtn]} onPress={handleToggleLikeAndSave} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Icon source={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FF3B30' : colors.textSoft} />
              </Animated.View>
              <Text style={[styles.actionBtnText, { color: colors.text }, liked && styles.likedText]}>{liked ? 'Liked & Saved' : 'Like Article'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleExternalShare} activeOpacity={0.8}>
              <Icon source="share-variant" size={20} color={colors.textSoft} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.body, { color: colors.text }]}>{article.content}</Text>

          <RatingSummaryPreview
            avgRating={avgRating}
            ratingCount={ratingCount}
            userRating={userRating}
            onRate={saveRatingData}
            comments={comments.map((item) => ({
              id: item.id,
              userName: item.userName,
              avatar: item.avatar,
              content: item.content,
              time: item.time,
            }))}
            commentInput={commentInput}
            onChangeCommentInput={setCommentInput}
            onSendComment={handleAddComment}
            onPress={() => navigation.navigate('ArticleReviews', { id, name: article.title })}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 260 },
  floatingBackBtn: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#2E2E2E', marginBottom: 6, lineHeight: 28 },
  meta: { fontSize: 13, color: '#888888', marginBottom: 16 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -8, marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  editDeleteRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF0ED', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FFE2DB' },
  editBtnText: { color: '#FF7A59', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  deleteBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#F5F5F5',
  },
  activeActionBtn: {
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#65676B' },
  likedText: { color: '#FF3B30', fontWeight: '700' },
  savedText: { color: '#FF7A59', fontWeight: '700' },
  body: { fontSize: 15, color: '#333333', lineHeight: 24, marginBottom: 4 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 16 },
});

export default ArticleDetailScreen;