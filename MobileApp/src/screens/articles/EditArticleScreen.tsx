import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, Image } from 'react-native';
import Icon from '../../components/common/AppIcon';
import { articleService } from '../../services/article.service';
import { useAppTheme } from '../../theme/useAppTheme';
import { ChipSelectRow, ARTICLE_CATEGORIES, ARTICLE_AGE_RANGES, ARTICLE_READING_TIMES } from '../../components/articles/ArticleFieldChips';

const EditArticleScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const id = Number(route?.params?.id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [targetAge, setTargetAge] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [tags, setTags] = useState('');

  const fetchArticleDetail = useCallback(() => {
    setLoading(true);
    articleService.getById(id)
      .then((a) => {
        setTitle(a.title);
        setSummary(a.summary || '');
        setImageUrl(a.image_url || '');
        setContent(a.content || '');
        setCategory(a.category || '');
        setTargetAge(a.target_age || '');
        setReadingTime(a.reading_time || '');
        setTags(a.tags || '');
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchArticleDetail();
  }, [fetchArticleDetail]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and detailed content.');
      return;
    }

    setSubmitting(true);
    try {
      await articleService.update(id, {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        category: category || undefined,
        targetAge: targetAge || undefined,
        readingTime: readingTime || undefined,
        tags: tags.trim() || undefined,
      });
      Alert.alert('Success', 'Article updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error('Update article error:', e);
      Alert.alert('Error', 'Unable to update article right now');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF7A59" /></View>;

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.coverCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {imageUrl.trim() ? (
          <Image source={{ uri: imageUrl.trim() }} style={styles.coverPreview} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Icon source="book-open-outline" size={26} color={colors.textSoft} />
            <Text style={[styles.coverPlaceholderTitle, { color: colors.text }]}>Add a cover image</Text>
          </View>
        )}
        <TextInput
          style={[styles.coverUrlInput, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Paste cover image URL..."
          placeholderTextColor={colors.textSoft}
        />
      </View>

      <Text style={[styles.label, { color: colors.textSoft }]}>Article Title</Text>
      <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Category</Text>
      <ChipSelectRow options={ARTICLE_CATEGORIES} value={category} onChange={setCategory} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Target Baby Age</Text>
      <ChipSelectRow options={ARTICLE_AGE_RANGES} value={targetAge} onChange={setTargetAge} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Reading Time</Text>
      <ChipSelectRow options={ARTICLE_READING_TIMES} value={readingTime} onChange={setReadingTime} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Tags</Text>
      <TextInput style={inputStyle} value={tags} onChangeText={setTags} placeholder="e.g. nutrition, baby food" placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Short Summary</Text>
      <TextInput style={inputStyle} value={summary} onChangeText={setSummary} placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Detailed Content</Text>
      <TextInput style={[inputStyle, styles.multiline]} value={content} onChangeText={setContent} multiline placeholderTextColor={colors.textSoft} />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
  multiline: { height: 160, textAlignVertical: 'top' },
  coverCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  coverPreview: { width: '100%', height: 130 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 4 },
  coverPlaceholderTitle: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  coverUrlInput: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default EditArticleScreen;
