import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Share, Alert, Modal, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '../common/AppIcon';
import { ArticleListItem } from '../../types/article';
import { articleService } from '../../services/article.service';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useArticleStore } from '../../stores/useArticleStore';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { addActivity } from '../../store/historySlice';
import StarRating from '../common/StarRating';

interface Props {
  article: ArticleListItem;
  onPress: () => void;
  onRefreshList?: () => void;
}

const ArticleCard: React.FC<Props> = ({ article, onPress, onRefreshList }) => {
  const { savedArticleIds = [], toggleBookmarkArticle } = useBookmarkStore();
  const { fetchArticles } = useArticleStore();
  const saved = Array.isArray(savedArticleIds) ? savedArticleIds.includes(article.id) : false;
  const [liked, setLiked] = useState(saved);
  const [likeCount, setLikeCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  const [commentCount, setCommentCount] = useState(0);

  // Real Rating State (No fake initial numbers, default 0)
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkScaleAnim = useRef(new Animated.Value(1)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();

  useEffect(() => {
    loadCommentCount();
    loadRatingData();
    loadLikeCount();
  }, [article.id]);

  useEffect(() => {
    setLiked(saved);
  }, [saved]);

  const loadLikeCount = async () => {
    try {
      const storedLikes = await AsyncStorage.getItem(`article_likes_${article.id}`);
      if (storedLikes) {
        setLikeCount(parseInt(storedLikes, 10) || 0);
      } else {
        setLikeCount(saved ? 1 : 0);
      }
    } catch (e) {
      console.error('Load like count error:', e);
    }
  };

  const loadRatingData = async () => {
    try {
      const storedRating = await AsyncStorage.getItem(`article_rating_${article.id}`);
      if (storedRating) {
        const parsed = JSON.parse(storedRating);
        const list: number[] = Array.isArray(parsed.ratingsList)
          ? parsed.ratingsList
          : (parsed.userRating ? [parsed.userRating] : []);
        const uRating = parsed.userRating || 0;

        if (list.length > 0) {
          const sum = list.reduce((a, b) => a + b, 0);
          const avg = Number((sum / list.length).toFixed(1));
          setUserRating(uRating);
          setAvgRating(avg);
          setRatingCount(list.length);
          return;
        }
      }
      setUserRating(0);
      setAvgRating(0);
      setRatingCount(0);
    } catch (e) {
      console.error('Load rating data error:', e);
      setUserRating(0);
      setAvgRating(0);
      setRatingCount(0);
    }
  };

  const saveRatingData = async (newScore: number) => {
    try {
      const storedRating = await AsyncStorage.getItem(`article_rating_${article.id}`);
      let list: number[] = [];
      if (storedRating) {
        const parsed = JSON.parse(storedRating);
        if (Array.isArray(parsed.ratingsList)) {
          list = parsed.ratingsList;
        }
      }

      if (userRating > 0 && list.length > 0) {
        const userIndex = list.indexOf(userRating);
        if (userIndex !== -1) {
          list[userIndex] = newScore;
        } else {
          list.push(newScore);
        }
      } else {
        list.push(newScore);
      }

      const sum = list.reduce((a, b) => a + b, 0);
      const avg = Number((sum / list.length).toFixed(1));

      setUserRating(newScore);
      setAvgRating(avg);
      setRatingCount(list.length);

      await AsyncStorage.setItem(
        `article_rating_${article.id}`,
        JSON.stringify({
          userRating: newScore,
          ratingsList: list,
          avgRating: avg,
          ratingCount: list.length,
        })
      );

      dispatch(
        addActivity({
          type: 'rate',
          title: `Rated article ${newScore}⭐: ${article.title}`,
          details: `Average rating: ${avg}⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`,
          icon: '⭐',
        })
      );

      Alert.alert('Thank You!', `You rated this article ${newScore} out of 5 stars ⭐\nAverage score: ${avg} ⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`);
    } catch (e) {
      console.error('Save rating error:', e);
    }
  };

  const loadCommentCount = async () => {
    try {
      const stored = await AsyncStorage.getItem(`article_comments_${article.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCommentCount(parsed.length);
        }
      }
    } catch (e) {
      console.error('Load comment count error:', e);
    }
  };

  // Synchronized Heart & Save logic
  const handleToggleLikeAndSave = async () => {
    const isNowSaved = toggleBookmarkArticle(article.id);
    setLiked(isNowSaved);
    const newCount = isNowSaved ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(newCount);

    try {
      await AsyncStorage.setItem(`article_likes_${article.id}`, String(newCount));
    } catch (e) {
      console.error('Save likes error:', e);
    }

    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScaleAnim, { toValue: 1, bounciness: 12, speed: 20, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(bookmarkScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(bookmarkScaleAnim, { toValue: 1, bounciness: 12, speed: 20, useNativeDriver: true }),
    ]).start();

    if (isNowSaved) {
      dispatch(
        addActivity({
          type: 'like',
          title: `Liked & Saved: ${article.title}`,
          details: 'Added to Favourites & Saved Articles tab',
          icon: '❤️',
        })
      );
      Alert.alert('Saved to Favourites ❤️', 'This article has been added to your Saved & Favorite Articles list.');
    }
  };

  // External Share function (Web URL + Deep Link)
  const handleExternalShare = async () => {
    try {
      const webUrl = `https://babynutri.app/articles/${article.id}`;
      await Share.share({
        title: article.title,
        message: `📄 ${article.title}\n\nRead more on BabyNutri Web & App:\n${webUrl}`,
        url: webUrl,
      });

      dispatch(
        addActivity({
          type: 'action',
          title: `Shared link: ${article.title}`,
          details: 'External web & app link shared',
          icon: '🔗',
        })
      );
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  const handleDeleteArticle = () => {
    setMenuVisible(false);
    Alert.alert('Delete Article', 'Are you sure you want to delete this article?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await articleService.remove(article.id);
            Alert.alert('Success', 'Article deleted');
            await fetchArticles();
            onRefreshList?.();
          } catch (e) {
            console.error('Delete article error:', e);
            Alert.alert('Error', 'Unable to delete this article');
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report Sent', 'Thank you for your feedback. BabyNutri team will review this article soon.');
  };

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const currentUserAvatar =
    user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=FF5F70&color=fff&bold=true`;

  const isUserArticle =
    !article.author ||
    article.author === 'Parent' ||
    article.author === 'You (Parent)' ||
    article.author === currentUserName ||
    (user?.email && article.author === user.email.split('@')[0]);
  const displayAuthor = isUserArticle ? currentUserName : article.author;
  const avatarUrl = isUserArticle
    ? currentUserAvatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=FF7A59&color=fff&bold=true`;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: cardScaleAnim }] }]}>
      {/* Post Header: Avatar + Author + Date + Privacy */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{displayAuthor}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.postMeta}>{formatRealTimeAgo(article.published_date)} · </Text>
            {privacy === 'public' ? (
              <View style={styles.privacyBox}>
                <Icon source="earth" size={12} color="#65676B" />
                <Text style={styles.postMeta}>Public</Text>
              </View>
            ) : (
              <View style={styles.privacyBox}>
                <Icon source="lock-outline" size={12} color="#65676B" />
                <Text style={styles.postMeta}>Only me</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuVisible(true)}>
          <Icon source="dots-horizontal" size={20} color="#65676B" />
        </TouchableOpacity>
      </View>

      {/* Post Content & Title */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.bodyContainer}>
        <Text style={styles.title}>{article.title}</Text>
        {!!article.summary && (
          <Text style={styles.summary} numberOfLines={3}>
            {article.summary}
          </Text>
        )}
      </TouchableOpacity>

      {/* Post Image Banner */}
      {!!article.image_url && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Image source={{ uri: article.image_url }} style={styles.postImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* Interactive 5-Star Rating Bar */}
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingLabel}>Rate article:</Text>
        <StarRating
          rating={userRating || avgRating}
          interactive={true}
          onRate={saveRatingData}
          showScoreText={true}
          count={ratingCount}
        />
      </View>

      {/* Like & Comment Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.likeBox}>
          <Icon source="heart" size={14} color="#FF3B30" />
          <Text style={styles.statsText}>{likeCount} likes</Text>
        </View>

        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <Text style={styles.statsText}>{commentCount > 0 ? `${commentCount} comments` : '0 comments'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Action Buttons: Like, Comment, Share Link, Save */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleToggleLikeAndSave} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <Icon source={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#FF3B30' : '#65676B'} />
          </Animated.View>
          <Text style={[styles.actionLabel, liked && styles.likedLabel]}>{liked ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
          <Icon source="comment-outline" size={18} color="#65676B" />
          <Text style={styles.actionLabel}>Comment{commentCount > 0 ? ` (${commentCount})` : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleExternalShare} activeOpacity={0.7}>
          <Icon source="share-variant" size={18} color="#65676B" />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleToggleLikeAndSave} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: bookmarkScaleAnim }] }}>
            <Icon source={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? '#FF7A59' : '#65676B'} />
          </Animated.View>
          <Text style={[styles.actionLabel, saved && styles.savedLabel]}>{saved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal 3 Chấm Options */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>Article Options</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setPrivacy(privacy === 'public' ? 'private' : 'public');
                setMenuVisible(false);
              }}
            >
              {privacy === 'public' ? (
                <View style={styles.menuRow}>
                  <Icon source="lock-outline" size={18} color="#1C1E21" />
                  <Text style={styles.menuItemText}>Switch to Private mode</Text>
                </View>
              ) : (
                <View style={styles.menuRow}>
                  <Icon source="earth" size={18} color="#1C1E21" />
                  <Text style={styles.menuItemText}>Switch to Public mode</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleExternalShare}>
              <View style={styles.menuRow}>
                <Icon source="share-variant" size={18} color="#1C1E21" />
                <Text style={styles.menuItemText}>Share via link</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <View style={styles.menuRow}>
                <Icon source="flag-outline" size={18} color="#D97706" />
                <Text style={[styles.menuItemText, { color: '#D97706' }]}>Report violating article</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteArticle}>
              <View style={styles.menuRow}>
                <Icon source="trash-can-outline" size={18} color="#DC2626" />
                <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Delete article</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelMenuItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEFEA',
    shadowColor: '#FF7A59',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1E21',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postMeta: {
    fontSize: 12,
    color: '#65676B',
  },
  moreBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1E21',
    lineHeight: 22,
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F5F5F5',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FEF3C7',
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsText: {
    fontSize: 12,
    color: '#65676B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginHorizontal: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676B',
    marginLeft: 4,
  },
  likedLabel: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  savedLabel: {
    color: '#FF7A59',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1E21',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1E21',
  },
  cancelMenuItem: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#65676B',
  },
});

export default ArticleCard;