import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { articleService } from '../../services/article.service';
import { Article } from '../../types/article';

interface CommentItem {
  id: number;
  userName: string;
  avatar: string;
  content: string;
  time: string;
}

const CommentIcon = ({ size = 18, color = '#2E2E2E' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </Svg>
);

const BackIcon = ({ size = 20, color = '#FF7A59' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const id = Number(route?.params?.id);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);

  // State cho Modal Sửa Bình Luận (Cross-platform cho Android & iOS)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

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

  const fetchArticleDetail = useCallback(() => {
    setLoading(true);
    articleService.getById(id)
      .then(setArticle)
      .catch((e) => console.error('Load article error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  // Load bài viết và bình luận đã lưu trong AsyncStorage
  useEffect(() => {
    fetchArticleDetail();
    loadSavedComments();
  }, [fetchArticleDetail, loadSavedComments]);

  const saveCommentsToStorage = async (updatedComments: CommentItem[]) => {
    setComments(updatedComments);
    try {
      await AsyncStorage.setItem(`article_comments_${id}`, JSON.stringify(updatedComments));
    } catch (e) {
      console.error('Save comments error:', e);
    }
  };

  const handleAddComment = () => {
    const text = commentInput.trim();
    if (!text) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    const newComment: CommentItem = {
      id: Date.now(),
      userName: 'Minh Nguyên',
      avatar: 'https://ui-avatars.com/api/?name=Minh+Nguyen&background=FF7A59&color=fff&bold=true',
      content: text,
      time: 'Vừa xong',
    };

    const updated = [newComment, ...comments];
    saveCommentsToStorage(updated);
    setCommentInput('');
    Alert.alert('Thành công', 'Đã đăng bình luận của bạn!');
  };

  const openEditModal = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
    setEditModalVisible(true);
  };

  const handleConfirmEditComment = () => {
    if (!editingText.trim() || !editingCommentId) return;
    const updated = comments.map(c =>
      c.id === editingCommentId ? { ...c, content: editingText.trim(), time: 'Đã chỉnh sửa' } : c
    );
    saveCommentsToStorage(updated);
    setEditModalVisible(false);
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const updated = comments.filter(c => c.id !== commentId);
            saveCommentsToStorage(updated);
          },
        },
      ]
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;
  if (!article) return <View style={styles.center}><Text>Article not found</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: article.image_url }} style={styles.image} />
          <TouchableOpacity 
            style={styles.floatingBackBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <BackIcon size={20} color="#FF7A59" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.meta}>
          Tác giả: {article.author || 'Chuyên Gia Dinh Dưỡng'}
          {article.published_date ? ` · ${new Date(article.published_date).toLocaleDateString('vi-VN')}` : ''}
        </Text>
        <Text style={styles.body}>{article.content}</Text>

        <View style={styles.divider} />

        {/* Khung Bình luận với SVG Icon */}
        <View style={styles.commentTitleBox}>
          <CommentIcon size={18} color="#2E2E2E" />
          <Text style={styles.commentHeader}>Bình luận ({comments.length})</Text>
        </View>

        {/* Ô nhập bình luận */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Viết bình luận của bạn..."
            value={commentInput}
            onChangeText={setCommentInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment}>
            <Text style={styles.sendBtnText}>Gửi</Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách bình luận */}
        {comments.length === 0 ? (
          <Text style={styles.emptyCommentText}>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!</Text>
        ) : (
          comments.map((item) => (
            <View key={item.id} style={styles.commentBox}>
              <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContentBox}>
                <View style={styles.commentHeaderRow}>
                  <Text style={styles.commentUser}>{item.userName}</Text>
                  <Text style={styles.commentTime}>{item.time}</Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>

                {/* Nút Sửa & Xóa Bình luận */}
                <View style={styles.commentActionRow}>
                  <TouchableOpacity onPress={() => openEditModal(item.id, item.content)}>
                    <Text style={styles.commentActionText}>Sửa</Text>
                  </TouchableOpacity>
                  <Text style={styles.dotSeparator}>·</Text>
                  <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                    <Text style={[styles.commentActionText, { color: '#DC2626' }]}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Modal Sửa Bình luận tương thích 100% Android & iOS */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <View style={styles.editModalBox}>
            <Text style={styles.editModalTitle}>Chỉnh sửa bình luận</Text>
            <TextInput
              style={styles.editModalInput}
              value={editingText}
              onChangeText={setEditingText}
              multiline
              placeholder="Nhập bình luận mới..."
            />
            <View style={styles.editModalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmEditComment}>
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220, backgroundColor: '#EEE' },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#2E2E2E', marginBottom: 8 },
  meta: { fontSize: 12, color: '#8A8A8A', marginBottom: 16 },
  body: { fontSize: 15, color: '#3A3A3A', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 20 },
  commentTitleBox: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  commentHeader: { fontSize: 17, fontWeight: '700', color: '#2E2E2E' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  commentInput: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, marginRight: 10 },
  sendBtn: { backgroundColor: '#FF7A59', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11 },
  sendBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  commentBox: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-start' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#EEE' },
  commentContentBox: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontWeight: '700', fontSize: 13, color: '#2E2E2E' },
  commentTime: { fontSize: 11, color: '#999999' },
  commentText: { fontSize: 14, color: '#444444', lineHeight: 19 },
  commentActionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  commentActionText: { fontSize: 12, fontWeight: '600', color: '#65676B' },
  dotSeparator: { fontSize: 12, color: '#999' },
  emptyCommentText: { fontSize: 13, color: '#999', fontStyle: 'italic', marginVertical: 10, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  editModalBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  editModalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  editModalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, height: 90, textAlignVertical: 'top', marginBottom: 16 },
  editModalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F3F4F6' },
  cancelBtnText: { color: '#6B7280', fontWeight: '600' },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#FF7A59' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
  floatingBackBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default ArticleDetailScreen;