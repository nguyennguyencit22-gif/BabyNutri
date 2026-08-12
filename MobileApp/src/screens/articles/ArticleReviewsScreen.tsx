import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { articleService } from '../../services/article.service';
import type { RootState } from '../../store/store';
import { addActivity } from '../../store/historySlice';
import RatingReviewSection from '../../components/common/RatingReviewSection';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

type RatingBreakdown = { 5: number; 4: number; 3: number; 2: number; 1: number };
const EMPTY_BREAKDOWN: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

const computeBreakdown = (list: number[]): RatingBreakdown => {
  const breakdown = { ...EMPTY_BREAKDOWN };
  list.forEach((score) => {
    const rounded = Math.round(score) as 1 | 2 | 3 | 4 | 5;
    if (rounded >= 1 && rounded <= 5) breakdown[rounded] += 1;
  });
  return breakdown;
};

interface CommentItem {
  id: number;
  userName: string;
  avatar: string;
  content: string;
  time: string;
}

// Full "Ratings & Reviews" page for an article — reached by tapping the
// compact RatingSummaryPreview on ArticleDetailScreen. Owns the rate/comment
// read-write logic (all local/AsyncStorage) that used to live inline on the
// detail screen, including the comment-edit modal.
const ArticleReviewsScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const id = Number(route?.params?.id);
  const articleTitleRef = useRef(route?.params?.name || 'Article');

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>(EMPTY_BREAKDOWN);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const currentUserAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=FF5F70&color=fff&bold=true`;

  const dispatch = useDispatch();

  useEffect(() => {
    articleService.getById(id)
      .then((a) => {
        articleTitleRef.current = a.title;
      })
      .catch((e) => console.error('Load article title error:', e));
  }, [id]);

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
          setRatingBreakdown(computeBreakdown(list));
          return;
        }
      }
      setUserRating(0);
      setAvgRating(0);
      setRatingCount(0);
      setRatingBreakdown(EMPTY_BREAKDOWN);
    } catch (e) {
      console.error('Load rating data error:', e);
      setUserRating(0);
      setAvgRating(0);
      setRatingCount(0);
      setRatingBreakdown(EMPTY_BREAKDOWN);
    }
  }, [id]);

  useEffect(() => {
    loadSavedComments();
    loadRatingData();
  }, [loadSavedComments, loadRatingData]);

  const saveRatingData = async (newScore: number) => {
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

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
      setRatingBreakdown(computeBreakdown(list));

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
        title: `Rated article ${newScore}⭐: ${articleTitleRef.current}`,
        details: `Average rating: ${avg}⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`,
        icon: '⭐',
      }));

      appAlert.show(
        'Evaluation Saved',
        `You rated "${articleTitleRef.current}" ${newScore} out of 5 stars!\nAverage score: ${avg} ⭐ (${list.length} rating${list.length > 1 ? 's' : ''})`,
        undefined,
        'star',
      );
    } catch (e) {
      console.error('Save rating error:', e);
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
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    const text = commentInput.trim();
    if (!text) {
      appAlert.show('Notice', 'Please write a comment first');
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
      title: `Commented on: ${articleTitleRef.current}`,
      details: `"${text.slice(0, 30)}..."`,
      icon: '💬',
    }));

    appAlert.show('Success', 'Comment posted successfully!', undefined, 'success');
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
    appAlert.show(
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
      ],
      'warning',
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <RatingReviewSection
          avgRating={avgRating}
          ratingCount={ratingCount}
          breakdown={ratingBreakdown}
          userRating={userRating}
          onRate={saveRatingData}
          comments={comments.map((item) => ({
            id: item.id,
            userName: item.userName,
            avatar: item.avatar,
            content: item.content,
            time: item.time,
            canEdit: item.userName === currentUserName,
            canDelete: item.userName === currentUserName,
          }))}
          commentInput={commentInput}
          onChangeCommentInput={setCommentInput}
          onSendComment={handleAddComment}
          onEditComment={(commentId, currentText) => openEditModal(Number(commentId), currentText)}
          onDeleteComment={(commentId) => handleDeleteComment(Number(commentId))}
        />
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
  content: { padding: 18 },
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

export default ArticleReviewsScreen;
