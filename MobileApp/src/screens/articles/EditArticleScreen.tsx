import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { articleService } from '../../services/article.service';
import { useAppTheme } from '../../theme/useAppTheme';

const EditArticleScreen = ({ route, navigation }: any) => {
  const { colors } = useAppTheme();
  const id = Number(route?.params?.id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  const fetchArticleDetail = useCallback(() => {
    setLoading(true);
    articleService.getById(id)
      .then((a) => {
        setTitle(a.title);
        setSummary(a.summary || '');
        setImageUrl(a.image_url || '');
        setContent(a.content || '');
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
      <Text style={[styles.label, { color: colors.textSoft }]}>Article Title</Text>
      <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Short Summary</Text>
      <TextInput style={inputStyle} value={summary} onChangeText={setSummary} placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Image (URL)</Text>
      <TextInput style={inputStyle} value={imageUrl} onChangeText={setImageUrl} placeholderTextColor={colors.textSoft} />

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
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default EditArticleScreen;
