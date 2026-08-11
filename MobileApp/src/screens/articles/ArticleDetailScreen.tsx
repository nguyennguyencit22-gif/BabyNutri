import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from 'react-native-paper';
import { articleService } from '../../services/article.service';
import { Article } from '../../types/article';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import type { RootState } from '../../store/store';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { addActivity } from '../../store/historySlice';
import StarRating from '../../components/common/StarRating';
import { useAppTheme } from '../../theme/useAppTheme';

interface CommentItem {
  id: number;
  userName: string;
  avatar: string;
  content: string;
  time: string;
}

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const id = Number(route?.params?.id);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Save / Bookmark / Rating state
  const { savedArticleIds = [], toggleBookmarkArticle } = useBookmarkStore();
  const isSaved = savedArticleIds.includes(id);
  const [liked, setLiked] = useState(isSaved);

  // Real ratings only (default 0)
  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkScaleAnim = useRef(new Animated.Value(1)).current;

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const currentUserAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=FF5F70&color=fff&bold=true`;

  const isCurrentUserAuthor = !article?.author || article.author === 'Parent' || article.author === currentUserName;
  const displayAuthor = isCurrentUserAuthor ? currentUserName : article?.author;

  const dispatch = useDispatch();

  const loadSavedComments = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(`article_comments_${id}`);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Load comments error:', e);
    }
  }, [id]);

  const loadRatingData = useCallback(async () => {
    try {
      const storedRating = await AsyncStorage.getItem(`article_rating_${id}`);
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
  }, [id]);

  const saveRatingData = async (newScore: number) => {
    try {
      const storedRating = await AsyncStorage.getItem(`article_rating_${id}`);
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
        `article_rating_${id}`,
        JSON.stringify({
          userRating: newScore,
          ratingsList: list,
          avgRating: avg,
          ratingCount: list.length,
        })
      );

      dispatch(addActivity({
        type: 'rate',
        title: `Rated article ${newScore}⭐: ${article?.title || 'Article'}`,
        details: `Average rating: ${avg}⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`,
        icon: '⭐',
      }));

      Alert.alert('Evaluation Saved ⭐', `You rated "${article?.title}" ${newScore} out of 5 stars!\nAverage score: ${avg} ⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`);
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

  const handleToggleLikeAndSave = () => {
    const isNowSaved = toggleBookmarkArticle(id);
    setLiked(isNowSaved);

    Animated.sequence([
      Animated.timing(heartScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScaleAnim, { toValue: 1, bounciness: 12, speed: 20, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(bookmarkScaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(bookmarkScaleAnim, { toValue: 1, bounciness: 12, speed: 20, useNativeDriver: true }),
    ]).start();

    if (isNowSaved) {
      dispatch(addActivity({
        type: 'like',
        title: `Liked & Saved: ${article?.title || 'Article'}`,
        details: 'Added to Favourites & Saved Articles tab',
        icon: '❤️',
      }));
      Alert.alert('Saved to Favourites ❤️', 'This article has been saved in your Saved & Favorite Articles list.');
    }
  };

  const saveCommentsToStorage = async (newList: CommentItem[]) => {
    setComments(newList);
    try {
      await AsyncStorage.setItem(`article_comments_${id}`, JSON.stringify(newList));
    } catch (e) {
      console.error('Save comments error:', e);
    }
  };

  const handleAddComment = () => {
    const text = commentInput.trim();
    if (!text) {
      Alert.alert('Notice', 'Please write a comment first');
      return;
    }

    const newComment: CommentItem = {
      id: Date.now(),
      userName: currentUserName,
      avatar: currentUserAvatar,
      content: text,
      time: 'Just now',
    };

    const updated = [newComment, ...comments];
    saveCommentsToStorage(updated);
    setCommentInput('');

    dispatch(addActivity({
      type: 'comment',
      title: `Commented on: ${article?.title}`,
      details: `"${text.slice(0, 30)}..."`,
      icon: '💬',
    }));

    Alert.alert('Success', 'Comment posted successfully!');
  };

  const openEditModal = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
    setEditModalVisible(true);
  };

  const handleConfirmEditComment = () => {
    if (!editingText.trim() || !editingCommentId) return;
    const updated = comments.map(c =>
      c.id === editingCommentId ? { ...c, content: editingText.trim(), time: 'Edited' } : c
    );
    saveCommentsToStorage(updated);
    setEditModalVisible(false);
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = comments.filter(c => c.id !== commentId);
            saveCommentsToStorage(updated);
          },
        },
      ]
    );
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF7A59" /></View>;
  if (!article) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>Article not found</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: article.image_url }} style={styles.image} />
          <TouchableOpacity 
            style={[styles.floatingBackBtn, { backgroundColor: colors.surface }]}
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

          {/* Rating Row */}
          <View style={[styles.ratingBarRow, { backgroundColor: isDark ? '#3A2E31' : '#FFFBF0', borderColor: isDark ? '#5A3D42' : '#FEF3C7' }]}>
            <StarRating
              rating={avgRating}
              userRating={userRating}
              interactive={true}
              onRate={saveRatingData}
              showScoreText={true}
              count={ratingCount}
            />
          </View>

          {/* Action Buttons: Like & Save */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, liked && styles.activeActionBtn]} onPress={handleToggleLikeAndSave} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                <Icon source={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FF3B30' : colors.textSoft} />
              </Animated.View>
              <Text style={[styles.actionBtnText, { color: colors.text }, liked && styles.likedText]}>{liked ? 'Liked & Saved' : 'Like Article'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }, isSaved && styles.activeActionBtn]} onPress={handleToggleLikeAndSave} activeOpacity={0.8}>
              <Animated.View style={{ transform: [{ scale: bookmarkScaleAnim }] }}>
                <Icon source={isSaved ? 'bookmark' : 'bookmark-outline'} size={20} color={isSaved ? '#FF7A59' : colors.textSoft} />
              </Animated.View>
              <Text style={[styles.actionBtnText, { color: colors.text }, isSaved && styles.savedText]}>{isSaved ? 'Saved in Favourites' : 'Save Article'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.body, { color: colors.text }]}>{article.content}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Comments section */}
          <View style={styles.commentTitleBox}>
            <Icon source="comment-outline" size={20} color={colors.text} />
            <Text style={[styles.commentHeader, { color: colors.text }]}>Comments ({comments.length})</Text>
          </View>

          {/* Input box */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textSoft}
              value={commentInput}
              onChangeText={setCommentInput}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>

          {/* Comments list */}
          {comments.length === 0 ? (
            <Text style={[styles.emptyCommentText, { color: colors.textSoft }]}>No comments yet. Be the first to share your thoughts!</Text>
          ) : (
            comments.map((item) => (
              <View key={item.id} style={[styles.commentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                <View style={styles.commentContentBox}>
                  <View style={styles.commentHeaderRow}>
                    <Text style={[styles.commentUser, { color: colors.text }]}>{item.userName}</Text>
                    <Text style={[styles.commentTime, { color: colors.textSoft }]}>{item.time}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.text }]}>{item.content}</Text>

                  {/* Comment Owner Controls */}
                  {item.userName === currentUserName && (
                    <View style={styles.commentOwnerControls}>
                      <TouchableOpacity onPress={() => openEditModal(item.id, item.content)}>
                        <Text style={styles.controlEditText}>Edit</Text>
                      </TouchableOpacity>
                      <Text style={styles.controlDot}>·</Text>
                      <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                        <Text style={styles.controlDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Comment Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Comment</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: isDark ? '#3A2E31' : '#F9FAFB', borderColor: colors.border, color: colors.text }]}
              value={editingText}
              onChangeText={setEditingText}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#3A2E31' : '#E5E7EB' }]} onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSoft }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleConfirmEditComment}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  ratingBarRow: {
    marginVertical: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFBF0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignSelf: 'flex-start',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
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
  body: { fontSize: 15, color: '#333333', lineHeight: 24, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 16 },
  commentTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  commentHeader: { fontSize: 16, fontWeight: '700', color: '#2E2E2E' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2E2E2E',
  },
  sendBtn: {
    backgroundColor: '#FF7A59',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyCommentText: { fontSize: 13, color: '#999999', fontStyle: 'italic', marginVertical: 10 },
  commentBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    backgroundColor: '#FAF7F5',
    padding: 12,
    borderRadius: 12,
  },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentContentBox: { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: '700', color: '#2E2E2E' },
  commentTime: { fontSize: 11, color: '#999999' },
  commentText: { fontSize: 14, color: '#444444', lineHeight: 20 },
  commentOwnerControls: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  controlEditText: { fontSize: 12, color: '#FF7A59', fontWeight: '600' },
  controlDeleteText: { fontSize: 12, color: '#FF3B30', fontWeight: '600' },
  controlDot: { fontSize: 12, color: '#999999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#2E2E2E', marginBottom: 12 },
  editInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#EEEEEE' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#666666' },
  modalSaveBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#FF7A59' },
  modalSaveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default ArticleDetailScreen;