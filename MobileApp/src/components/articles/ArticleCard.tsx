import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Share, Alert, Modal, Pressable, Animated, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { ArticleListItem } from '../../types/article';
import { articleService } from '../../services/article.service';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { useArticleStore } from '../../stores/useArticleStore';
import { formatRealTimeAgo, useRealTimeTicker } from '../../utils/formatRealTime';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { addActivity } from '../../store/historySlice';

interface Props {
  article: ArticleListItem;
  onPress: () => void;
  onRefreshList?: () => void;
}

const HeartIcon = ({ liked, size = 18 }: { liked?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : '#65676B'} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const CommentIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </Svg>
);

const ShareIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
  </Svg>
);

const BookmarkIcon = ({ saved, size = 18 }: { saved: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#FF7A59' : 'none'} stroke={saved ? '#FF7A59' : '#65676B'} strokeWidth={2}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </Svg>
);

const ThreeDotsIcon = ({ color = '#65676B', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M6 12a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" />
  </Svg>
);

const GlobeIcon = ({ size = 12, color = '#65676B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </Svg>
);

const LockIcon = ({ size = 12, color = '#65676B' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0110 0v4" />
  </Svg>
);

const LinkIcon = ({ size = 16, color = '#1C1E21' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <Path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </Svg>
);

const FlagIcon = ({ size = 16, color = '#D97706' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
  </Svg>
);

const TrashIcon = ({ size = 16, color = '#DC2626' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

const ArticleCard: React.FC<Props> = ({ article, onPress, onRefreshList }) => {
  const { savedArticleIds = [], toggleBookmarkArticle } = useBookmarkStore();
  const { fetchArticles } = useArticleStore();
  const saved = Array.isArray(savedArticleIds) ? savedArticleIds.includes(article.id) : false;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  const [quoteModalVisible, setQuoteModalVisible] = useState(false);
  const [quoteCaption, setQuoteCaption] = useState('');
  const [sharing, setSharing] = useState(false);

  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    loadCommentCount();
  }, [article.id]);

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

  const heartScaleAnim = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();

  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(nextLiked ? likeCount + 1 : likeCount - 1);

    if (nextLiked) {
      Animated.sequence([
        Animated.timing(heartScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
        Animated.spring(heartScaleAnim, { toValue: 1, bounciness: 10, speed: 20, useNativeDriver: true }),
      ]).start();

      dispatch(addActivity({
        type: 'like',
        title: `Liked article: ${article.title}`,
        details: 'Added to your activity log',
        icon: '❤️',
      }));
    }
  };

  const handleShareOptions = () => {
    Alert.alert(
      'Share Article',
      'How would you like to share this article?',
      [
        {
          text: 'Share with message (Post)',
          onPress: () => setQuoteModalVisible(true),
        },
        {
          text: 'Share to external apps',
          onPress: async () => {
            try {
              await Share.share({
                message: `${article.title}\n\n${article.summary || ''}\n\nSee more on BabyNutri app!`,
                title: article.title,
              });
            } catch (e) {
              console.error(e);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleConfirmQuoteShare = async () => {
    setSharing(true);
    try {
      await articleService.create({
        title: article.title,
        summary: quoteCaption.trim()
          ? `"${quoteCaption.trim()}"\n\nShared article from ${article.author || 'Nutrition Expert'}`
          : `Shared an article by ${article.author || 'Nutrition Expert'}`,
        content: `${quoteCaption.trim() ? `"${quoteCaption.trim()}"\n\n` : ''}[Original article from ${article.author || 'Nutrition Expert'}]:\n${article.summary || article.title}`,
        imageUrl: article.image_url,
      });

      setQuoteModalVisible(false);
      setQuoteCaption('');
      Alert.alert('Success', 'Posted shared article with your thoughts!');
      await fetchArticles();
      onRefreshList?.();
    } catch (e) {
      console.error('Quote share error:', e);
      Alert.alert('Error', 'Unable to share article right now');
    } finally {
      setSharing(false);
    }
  };

  const toggleSave = () => {
    const isNowSaved = toggleBookmarkArticle(article.id);
    if (isNowSaved) {
      Alert.alert('Article Saved', 'Added article to "Saved Articles"');
    } else {
      Alert.alert('Unsaved', 'Removed article from saved list');
    }
  };

  const handleDeleteArticle = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article?',
      [
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
      ]
    );
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report Sent', 'Thank you for your feedback. BabyNutri team will review this article soon.');
  };

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const currentUserAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=FF5F70&color=fff&bold=true`;

  const isUserArticle = !article.author || article.author === 'Parent' || article.author === 'You (Parent)' || article.author === currentUserName || (user?.email && article.author === user.email.split('@')[0]);
  const displayAuthor = isUserArticle ? currentUserName : article.author;
  const avatarUrl = isUserArticle ? currentUserAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author)}&background=FF7A59&color=fff&bold=true`;

  // Kiểm tra xem bài viết này có phải dạng Bài đăng chia sẻ lồng bài gốc không (Quote Shared Post)
  const isQuotePost = article.summary?.includes('💬 "') || article.summary?.includes(' Shared article');
  let userCaption = '';
  let sharedNote = '';
  if (isQuotePost && article.summary) {
    const parts = article.summary.split('\n\n');
    userCaption = parts[0]?.replace(/^💬 "/, '').replace(/"$/, '') || '';
    sharedNote = parts[1] ? ` ${parts[1]}` : '';
  }

  return (
    <View style={styles.card}>
      {/* Post Header: Avatar + Author + Date + Privacy SVG Icon */}
      <View style={styles.header}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{displayAuthor}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.postMeta}>
              {formatRealTimeAgo(article.published_date)} ·{' '}
            </Text>
            {privacy === 'public' ? (
              <View style={styles.privacyBox}>
                <GlobeIcon size={12} color="#65676B" />
                <Text style={styles.postMeta}>Public</Text>
              </View>
            ) : (
              <View style={styles.privacyBox}>
                <LockIcon size={12} color="#65676B" />
                <Text style={styles.postMeta}>Only me</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuVisible(true)}>
          <ThreeDotsIcon size={18} color="#65676B" />
        </TouchableOpacity>
      </View>

      {/* Post Content & Title (Lồng Bài Viết Gốc nếu là Bài Đăng Chia Sẻ) */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.bodyContainer}>
        {isQuotePost ? (
          <View style={styles.quoteWrapper}>
            {!!userCaption && <Text style={styles.quoteCaptionText}>{userCaption}</Text>}
            {/* Khung bài viết gốc nằm lồng bên trong chuẩn Facebook */}
            <View style={styles.embeddedOriginalCard}>
              <Text style={styles.embeddedTag}>{sharedNote || 'Shared Article'}</Text>
              <Text style={styles.embeddedTitle}>{article.title}</Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.title}>{article.title}</Text>
            {!!article.summary && (
              <Text style={styles.summary} numberOfLines={3}>
                {article.summary}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>

      {/* Post Image Banner */}
      {!!article.image_url && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
          <Image source={{ uri: article.image_url }} style={styles.postImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* Dynamic Like & Comment Count Stats Row */}
      {(likeCount > 0 || commentCount > 0) && (
        <View style={styles.statsRow}>
          {likeCount > 0 ? (
            <View style={styles.likeBox}>
              <HeartIcon liked={true} size={14} />
              <Text style={styles.statsText}>{likeCount} likes</Text>
            </View>
          ) : <View />}

          {commentCount > 0 && (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
              <Text style={styles.statsText}>{commentCount} comments</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <HeartIcon liked={liked} size={18} />
          </Animated.View>
          <Text style={[styles.actionLabel, liked && styles.likedLabel]}>{liked ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
          <CommentIcon size={18} />
          <Text style={styles.actionLabel}>Comment{commentCount > 0 ? ` (${commentCount})` : ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleShareOptions} activeOpacity={0.7}>
          <ShareIcon size={18} />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={toggleSave} activeOpacity={0.7}>
          <BookmarkIcon saved={saved} size={18} />
        </TouchableOpacity>
      </View>

      {/* Modal 3 Chấm Action Menu */}
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
                  <LockIcon size={18} color="#1C1E21" />
                  <Text style={styles.menuItemText}>Switch to Private mode</Text>
                </View>
              ) : (
                <View style={styles.menuRow}>
                  <GlobeIcon size={18} color="#1C1E21" />
                  <Text style={styles.menuItemText}>Switch to Public mode</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleShareOptions}>
              <View style={styles.menuRow}>
                <LinkIcon size={18} color="#1C1E21" />
                <Text style={styles.menuItemText}>Share this article</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <View style={styles.menuRow}>
                <FlagIcon size={18} color="#D97706" />
                <Text style={[styles.menuItemText, { color: '#D97706' }]}>Report violating article</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteArticle}>
              <View style={styles.menuRow}>
                <TrashIcon size={18} color="#DC2626" />
                <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Delete article</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelMenuItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Modal Chia sẻ Kèm Lời nhắn (Quote Repost Modal chuẩn Facebook) */}
      <Modal visible={quoteModalVisible} transparent animationType="slide" onRequestClose={() => setQuoteModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setQuoteModalVisible(false)}>
          <View style={styles.quoteModalBox}>
            <Text style={styles.quoteModalTitle}>Share article with message</Text>
            <TextInput
              style={styles.quoteInput}
              placeholder="What's on your mind about this article?..."
              placeholderTextColor="#9CA3AF"
              value={quoteCaption}
              onChangeText={setQuoteCaption}
              multiline
            />

            {/* Xem trước bài viết gốc được lồng bên dưới */}
            <View style={styles.previewOriginalBox}>
              <Text style={styles.previewOriginalLabel}>Original article attached:</Text>
              <Text style={styles.previewOriginalTitle} numberOfLines={2}>{article.title}</Text>
              <Text style={styles.previewOriginalAuthor}>Author: {article.author || 'Nutrition Expert'}</Text>
            </View>

            <View style={styles.quoteBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setQuoteModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareSubmitBtn} onPress={handleConfirmQuoteShare} disabled={sharing}>
                <Text style={styles.shareSubmitText}>{sharing ? 'Sharing...' : 'Post Shared Article'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
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
  quoteWrapper: {
    gap: 8,
  },
  quoteCaptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 6,
  },
  embeddedOriginalCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B4A',
  },
  embeddedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B4A',
    marginBottom: 4,
  },
  embeddedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#F5F5F5',
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#65676B',
    marginLeft: 6,
  },
  likedLabel: {
    color: '#FF3B30',
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
  quoteModalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  quoteModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  quoteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 14,
    backgroundColor: '#FAFAFA',
    color: '#111827',
  },
  previewOriginalBox: {
    backgroundColor: '#FFF8F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE0D6',
    marginBottom: 16,
  },
  previewOriginalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B4A',
    marginBottom: 4,
  },
  previewOriginalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  previewOriginalAuthor: {
    fontSize: 11,
    color: '#6B7280',
  },
  quoteBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '700',
  },
  shareSubmitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B4A',
    shadowColor: '#FF6B4A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  shareSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ArticleCard;