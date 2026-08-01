import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { articleService } from '../../services/article.service';

const SendIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);

const AddArticleScreen = ({ navigation }: any) => {
  const formData = useRef({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const data = formData.current;
    if (!data.title.trim() || !data.content.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề và nội dung bài viết');
      return;
    }
    setSubmitting(true);
    try {
      await articleService.create({
        title: data.title.trim(),
        summary: data.summary.trim(),
        content: data.content.trim(),
        imageUrl: data.imageUrl.trim(),
      });
      Alert.alert('Thành công', 'Đã đăng bài viết mới thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('Create article error:', e);
      Alert.alert('Lỗi', 'Không thể đăng bài viết, thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tiêu đề bài viết / Chia sẻ</Text>
      <TextInput
        style={styles.input}
        onChangeText={(v) => { formData.current.title = v; }}
        placeholder="VD: Mẹo giúp bé ăn dặm hào hứng..."
      />

      <Text style={styles.label}>Tóm tắt ngắn</Text>
      <TextInput
        style={styles.input}
        onChangeText={(v) => { formData.current.summary = v; }}
        placeholder="Tóm tắt nội dung chính..."
      />

      <Text style={styles.label}>Ảnh minh họa (URL)</Text>
      <TextInput
        style={styles.input}
        onChangeText={(v) => { formData.current.imageUrl = v; }}
        placeholder="https://..."
      />

      <Text style={styles.label}>Nội dung chia sẻ chi tiết</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        onChangeText={(v) => { formData.current.content = v; }}
        multiline
        placeholder="Nhập nội dung chia sẻ, kinh nghiệm hoặc mẹo hay tại đây..."
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        <SendIcon size={16} color="#FFFFFF" />
        <Text style={styles.submitText}>{submitting ? 'Đang đăng...' : 'Đăng bài viết'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B6B6B', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#EEE' },
  multiline: { height: 140, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddArticleScreen;
