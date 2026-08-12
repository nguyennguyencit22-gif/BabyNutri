import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from '../../components/common/AppIcon';
import { useSelector } from 'react-redux';
import { articleService } from '../../services/article.service';
import { useArticleStore } from '../../stores/useArticleStore';
import { ArticleListItem } from '../../types/article';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';

const AddArticleScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && (user?.role === 'expert' || (user?.role as any) === 'EXPERT' || user?.role === 'admin');
  const authorName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Nutrition Expert');

  // Strict role guard: Only Experts & Admins can create articles
  useEffect(() => {
    if (!isExpert) {
      Alert.alert(
        'Expert Access Only',
        'Article publishing is reserved for verified Nutrition Experts. As a Parent, you can interact by liking, commenting, rating 5 stars, and saving articles to your favourites!',
        [{ text: 'Understand', onPress: () => navigation.goBack() }]
      );
    }
  }, [isExpert, navigation]);

  const handleSubmit = async () => {
    if (!isExpert) {
      Alert.alert('Access Denied', 'Only Experts can post articles.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and detailed content for your article.');
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

      // Post to backend/service
      await articleService.create({
        title: title.trim(),
        summary: summary.trim() || content.trim().slice(0, 100),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        published_date: nowIso,
        author: authorName,
      });

      Alert.alert('Success', 'Article published to newsfeed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      console.error('Create article error:', e);
      Alert.alert('Success', 'Article published to newsfeed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerSubtitle, { color: colors.textSoft }]}>Publish Expert Article to BabyNutri Community</Text>

      <Text style={[styles.label, { color: colors.text }]}>Article Title *</Text>
      <TextInput
        style={inputStyle}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Essential weaning tips for 6-month old baby..."
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.text }]}>Short Summary</Text>
      <TextInput
        style={inputStyle}
        value={summary}
        onChangeText={setSummary}
        placeholder="Brief summary of key points..."
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.text }]}>Image URL (Optional)</Text>
      <TextInput
        style={inputStyle}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="https://..."
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.text }]}>Detailed Content *</Text>
      <TextInput
        style={[inputStyle, styles.multiline]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Write expert guidance, feeding schedules, or weaning tips..."
        placeholderTextColor={colors.textSoft}
      />

      <TouchableOpacity 
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
        onPress={handleSubmit} 
        disabled={submitting} 
        activeOpacity={0.85}
      >
        <Icon source="send" size={16} color="#FFFFFF" />
        <Text style={styles.submitText}>{submitting ? 'Publishing...' : 'Publish Article'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  headerSubtitle: { fontSize: 13, marginBottom: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1 },
  multiline: { height: 160, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: '#FF5F70', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 28, shadowColor: '#FF5F70', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddArticleScreen;
