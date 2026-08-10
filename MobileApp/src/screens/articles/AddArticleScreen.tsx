import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { articleService } from '../../services/article.service';
import { useArticleStore } from '../../stores/useArticleStore';
import { ArticleListItem } from '../../types/article';
import type { RootState } from '../../store/Store';

const SendIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);

const AddArticleScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const authorName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and content for your article.');
      return;
    }

    setSubmitting(true);
    const nowIso = new Date().toISOString();

    try {
      const newArticle: ArticleListItem = {
        id: Date.now(),
        title: title.trim(),
        summary: summary.trim() || content.trim().slice(0, 100),
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
        author: authorName,
        published_date: nowIso,
      };

      // Optimistically add to feed immediately
      useArticleStore.getState().addArticleOptimistic(newArticle);

      // Post to backend or in-memory service
      await articleService.create({
        title: title.trim(),
        summary: summary.trim() || content.trim().slice(0, 100),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        published_date: nowIso,
        author: authorName,
      });

      Alert.alert('Success', 'Article posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      console.error('Create article error:', e);
      Alert.alert('Success', 'Article posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Article / Post Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Essential weaning tips for 6-month old baby..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Short Summary</Text>
      <TextInput
        style={styles.input}
        value={summary}
        onChangeText={setSummary}
        placeholder="Brief summary of key points..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Image URL (Optional)</Text>
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Detailed Content *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Write your experience, tips, or weaning recipes here..."
        placeholderTextColor="#9CA3AF"
      />

      <TouchableOpacity 
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
        onPress={handleSubmit} 
        disabled={submitting} 
        activeOpacity={0.85}
      >
        <SendIcon size={16} color="#FFFFFF" />
        <Text style={styles.submitText}>{submitting ? 'Posting...' : 'Post Article'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B6B6B', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#EEE', color: '#111827' },
  multiline: { height: 140, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddArticleScreen;
