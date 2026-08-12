import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import { questionService } from '../../services/questionService';
import { Question } from '../../types/question';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [askModalVisible, setAskModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionService.getQuestions();
      setQuestions(data);
    } catch {
      console.warn('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return ['All', ...Array.from(set)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, searchQuery]);

  const handleSubmitQuestion = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Notice', 'Please fill in both question title and details.');
      return;
    }

    const created: Question = {
      id: `custom-faq-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: 'User Question',
      createdAt: new Date().toISOString(),
    };

    setQuestions((prev) => [created, ...prev]);
    setNewTitle('');
    setNewContent('');
    setAskModalVisible(false);

    Alert.alert('Success 🎉', 'Your question has been sent to our Nutrition Experts!');
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Nutrition FAQ & Help</Text>
          <TouchableOpacity
            style={styles.askBtn}
            onPress={() => setAskModalVisible(true)}
            activeOpacity={0.85}
          >
            <Icon source="plus" size={16} color="#FFFFFF" />
            <Text style={styles.askBtnText}>Ask Question</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Common weaning questions answered by Pediatric Nutrition Experts</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon source="magnify" size={20} color="#8E7377" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A89296"
          />
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryRow}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.activeCategoryChip]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.activeCategoryChipText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Accordion Questions List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          key="faq-accordion-list"
          data={filteredQuestions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item.id;
            return (
              <View style={[styles.faqCard, isExpanded && styles.expandedFaqCard]}>
                <TouchableOpacity
                  style={styles.faqHeaderRow}
                  onPress={() => toggleAccordion(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqTitleBox}>
                    {!!item.category && (
                      <View style={styles.faqBadge}>
                        <Text style={styles.faqBadgeText}>{item.category}</Text>
                      </View>
                    )}
                    <Text style={styles.faqTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#FF7A59" />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <View style={styles.expertBadgeRow}>
                      <Text style={styles.expertTagText}>💡 Expert Advice:</Text>
                    </View>
                    <Text style={styles.faqContent}>{item.content}</Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="help-circle-outline" size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>No matching questions found.</Text>
              <Text style={styles.emptySubText}>Try searching another keyword or tap "Ask Question" to send to Experts.</Text>
            </View>
          }
        />
      )}

      {/* Modal Ask Question */}
      <Modal visible={askModalVisible} transparent animationType="slide" onRequestClose={() => setAskModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAskModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalHeaderTitle}>Ask a Nutrition Expert 💬</Text>
            <Text style={styles.modalHeaderSub}>Your question will be answered by verified pediatric nutritionists.</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Question Title (e.g. Can I give orange juice to 7m baby?)"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor="#A89296"
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Describe details (baby's age, symptoms, current schedule...)"
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              placeholderTextColor="#A89296"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAskModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmitQuestion}>
                <Text style={styles.modalSubmitText}>Send Question</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0D6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4B3034',
  },
  askBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF7A59',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  askBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    color: '#8E7377',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#4B3034',
    padding: 0,
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  activeCategoryChip: {
    backgroundColor: '#FF5F70',
    borderColor: '#FF5F70',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E7377',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    elevation: 1,
  },
  expandedFaqCard: {
    borderColor: '#FF5F70',
    backgroundColor: '#FFFFFF',
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitleBox: {
    flex: 1,
    marginRight: 10,
  },
  faqBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  faqBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5F70',
  },
  faqTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B3034',
    lineHeight: 19,
  },
  chevronBox: {
    padding: 4,
  },
  faqBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFF0F2',
  },
  expertBadgeRow: {
    marginBottom: 4,
  },
  expertTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  faqContent: {
    fontSize: 13,
    color: '#4B3034',
    lineHeight: 19,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B3034',
  },
  emptySubText: {
    fontSize: 12,
    color: '#8E7377',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4B3034',
    marginBottom: 4,
  },
  modalHeaderSub: {
    fontSize: 12,
    color: '#8E7377',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#4B3034',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalSubmitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FF7A59',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export { FAQScreen };
export default FAQScreen;
