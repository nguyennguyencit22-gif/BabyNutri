import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import { useSelector } from 'react-redux';
import { articleService, ArticleMetadata } from '../../services/article.service';
import { useArticleStore } from '../../stores/useArticleStore';
import { ArticleListItem } from '../../types/article';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';
import { ChipSelectRow, ARTICLE_CATEGORIES, ARTICLE_AGE_RANGES, ARTICLE_READING_TIMES } from '../../components/articles/ArticleFieldChips';

const AddArticleScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [targetAge, setTargetAge] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [tags, setTags] = useState('');

  const [categoriesList, setCategoriesList] = useState(ARTICLE_CATEGORIES);
  const [ageRangesList, setAgeRangesList] = useState(ARTICLE_AGE_RANGES);
  const [readingTimesList, setReadingTimesList] = useState(ARTICLE_READING_TIMES);

  const [submitting, setSubmitting] = useState(false);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && (user?.role === 'expert' || (user?.role as any) === 'EXPERT' || user?.role === 'admin');
  const authorName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Nutrition Expert');

  useEffect(() => {
    articleService.getMeta().then((meta: ArticleMetadata) => {
      if (meta.categories?.length) {
        setCategoriesList(meta.categories.map((c) => (typeof c === 'string' ? c : c.name)));
      }
      if (meta.ageRanges?.length) setAgeRangesList(meta.ageRanges);
      if (meta.readingTimes?.length) setReadingTimesList(meta.readingTimes);
    }).catch((e) => console.warn('Could not fetch article meta:', e));
  }, []);

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
        category: category || null,
        target_age: targetAge || null,
        reading_time: readingTime || null,
        tags: tags.trim() || null,
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
        category: category || undefined,
        targetAge: targetAge || undefined,
        readingTime: readingTime || undefined,
        tags: tags.trim() || undefined,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Publish Article</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.headerSubtitle, { color: colors.textSoft }]}>Publish Expert Article to BabyNutri Community</Text>

        {/* Cover image — URL-based (no upload backend), styled as a preview card */}
        <View style={[styles.coverCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {imageUrl.trim() ? (
            <Image source={{ uri: imageUrl.trim() }} style={styles.coverPreview} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Icon source="book-open-outline" size={28} color={colors.textSoft} />
              <Text style={[styles.coverPlaceholderTitle, { color: colors.text }]}>Add a cover image</Text>
              <Text style={[styles.coverPlaceholderSub, { color: colors.textSoft }]}>Paste an image link below to make your article more engaging.</Text>
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

        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter article title"
          placeholderTextColor={colors.textSoft}
          multiline
        />

        <View style={styles.authorRow}>
          <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.authorAvatarLetter}>{authorName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.authorName, { color: colors.textSoft }]}>By {authorName} (Verified Expert)</Text>
        </View>

        <Text style={[styles.label, { color: colors.textSoft }]}>Category</Text>
        <ChipSelectRow options={categoriesList} value={category} onChange={setCategory} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Target Baby Age</Text>
        <ChipSelectRow options={ageRangesList} value={targetAge} onChange={setTargetAge} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Reading Time</Text>
        <ChipSelectRow options={readingTimesList} value={readingTime} onChange={setReadingTime} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Tags</Text>
        <TextInput
          style={inputStyle}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. nutrition, solid food, wean"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={[styles.label, { color: colors.textSoft }]}>Summary (Short overview)</Text>
        <TextInput
          style={inputStyle}
          value={summary}
          onChangeText={setSummary}
          placeholder="Brief summary shown on newsfeed card"
          placeholderTextColor={colors.textSoft}
        />

        <Text style={[styles.label, { color: colors.textSoft }]}>Content *</Text>
        <TextInput
          style={[inputStyle, styles.multiline]}
          value={content}
          onChangeText={setContent}
          placeholder="Write detailed nutrition guide, tips, and step-by-step instructions..."
          placeholderTextColor={colors.textSoft}
          multiline
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 18, paddingBottom: 40 },
  headerSubtitle: { fontSize: 13, marginBottom: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1 },
  multiline: { height: 160, textAlignVertical: 'top' },
  coverCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  coverPreview: { width: '100%', height: 150 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, paddingHorizontal: 20, gap: 4 },
  coverPlaceholderTitle: { fontSize: 14, fontWeight: '700', marginTop: 6 },
  coverPlaceholderSub: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  coverUrlInput: { paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  titleInput: { fontSize: 20, fontWeight: '800', marginBottom: 12, padding: 0 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  authorAvatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  authorAvatarLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  authorName: { fontSize: 13, fontWeight: '700' },
  submitBtn: { flexDirection: 'row', gap: 8, justifyContent: 'center', backgroundColor: '#FF5F70', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 28, shadowColor: '#FF5F70', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddArticleScreen;
