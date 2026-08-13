import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/AppIcon';
import { questionService } from '../../services/questionService';
import { Question } from '../../types/question';
import type { RootState } from '../../store/store';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen = ({ navigation }: any) => {
  const authMode = useSelector((state: RootState) => state.auth.mode);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [askModalVisible, setAskModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const [publicExperts, setPublicExperts] = useState<{ id: number; fullName: string; specialization?: string }[]>([]);
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(null);

  const [mainTab, setMainTab] = useState<'faqs' | 'myQuestions'>('faqs');
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadQuestions();
    loadPublicExperts();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionService.getQuestions();
      setQuestions(data);
      const myData = await questionService.getMyQuestions();
      setMyQuestions(myData);
    } catch {
      console.warn('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const loadPublicExperts = async () => {
    try {
      const list = await questionService.getPublicExperts();
      setPublicExperts(list);
    } catch {
      console.warn('Failed to load public experts list');
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
    const list = mainTab === 'faqs' ? questions : myQuestions;
    return list.filter((q) => {
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [questions, myQuestions, mainTab, selectedCategory, searchQuery]);

  const handleSubmitQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Notice', 'Please fill in both question title and details.');
      return;
    }

    try {
      await questionService.createQuestion(newTitle.trim(), newContent.trim(), selectedExpertId);
      setNewTitle('');
      setNewContent('');
      setSelectedExpertId(null);
      setAskModalVisible(false);
      loadQuestions();
      setMainTab('myQuestions');
      Alert.alert('Success 🎉', 'Your question has been sent to our Nutrition Experts!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit question.');
    }
  };

  const handleAskPress = () => {
    if (authMode === 'guest') {
      Alert.alert(
        'Login Required',
        'Please log in to ask questions to Pediatric Nutrition Experts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setAskModalVisible(true);
  };

  const handleMyQuestionsTabPress = () => {
    if (authMode === 'guest') {
      Alert.alert(
        'Login Required',
        'Please log in to view your submitted questions.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setMainTab('myQuestions');
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Nutrition FAQ & Help</Text>
          <TouchableOpacity
            style={styles.askBtn}
            onPress={handleAskPress}
            activeOpacity={0.85}
          >
            <Icon source="plus" size={16} color="#FFFFFF" />
            <Text style={styles.askBtnText}>Ask Question</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Common weaning questions answered by Pediatric Nutrition Experts</Text>

        {/* Main Tab Switcher */}
        <View style={styles.mainTabRow}>
          <TouchableOpacity
            style={[styles.mainTabBtn, mainTab === 'faqs' && styles.activeMainTabBtn]}
            onPress={() => setMainTab('faqs')}
            activeOpacity={0.85}
          >
            <Text style={[styles.mainTabText, mainTab === 'faqs' && styles.activeMainTabText]}>
              All FAQs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTabBtn, mainTab === 'myQuestions' && styles.activeMainTabBtn]}
            onPress={handleMyQuestionsTabPress}
            activeOpacity={0.85}
          >
            <Text style={[styles.mainTabText, mainTab === 'myQuestions' && styles.activeMainTabText]}>
              My Questions ({myQuestions.length})
            </Text>
          </TouchableOpacity>
        </View>

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
        {mainTab === 'faqs' && (
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
        )}
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
            const isAnswered = item.status === 'Answered' || !!item.answer;
            return (
              <View style={[styles.faqCard, isExpanded && styles.expandedFaqCard]}>
                <TouchableOpacity
                  style={styles.faqHeaderRow}
                  onPress={() => toggleAccordion(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqTitleBox}>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      {mainTab === 'myQuestions' && (
                        <View style={[styles.faqBadge, { backgroundColor: isAnswered ? '#ECFDF5' : '#FEF3C7' }]}>
                          <Text style={[styles.faqBadgeText, { color: isAnswered ? '#10B981' : '#D97706' }]}>
                            {isAnswered ? 'Answered' : 'Pending'}
                          </Text>
                        </View>
                      )}

                      {!!item.targetExpertName && (
                        <View style={[styles.faqBadge, { backgroundColor: '#E0E7FF' }]}>
                          <Text style={[styles.faqBadgeText, { color: '#4338CA' }]}>
                            Targeted: {item.targetExpertName}
                          </Text>
                        </View>
                      )}

                      {!!item.category && (
                        <View style={styles.faqBadge}>
                          <Text style={styles.faqBadgeText}>{item.category}</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.faqTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.chevronBox}>
                    <Icon source={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#FF7A59" />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqBody}>
                    <View style={styles.expertBadgeRow}>
                      <Text style={styles.expertTagText}>
                        {item.answer ? `Expert Advice (${item.answer.expertName}):` : isAnswered ? 'Expert Advice:' : 'Question Details:'}
                      </Text>
                    </View>
                    <Text style={styles.faqContent}>
                      {item.answer ? item.answer.content : item.content}
                    </Text>

                    <TouchableOpacity
                      style={styles.liveChatBtn}
                      onPress={() => navigation.navigate('QnaChat', { questionId: item.id, title: item.title, expertName: item.targetExpertName || item.answer?.expertName || 'Nutrition Expert' })}
                      activeOpacity={0.85}
                    >
                      <Icon source="chat-processing-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.liveChatBtnText}>Open Realtime Chat</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="help-circle-outline" size={44} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {mainTab === 'myQuestions' ? 'You have not asked any questions yet.' : 'No matching questions found.'}
              </Text>
              <Text style={styles.emptySubText}>
                {mainTab === 'myQuestions' ? 'Tap "Ask Question" to get expert advice for your baby.' : 'Try searching another keyword or tap "Ask Question" to send to Experts.'}
              </Text>
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

            {/* Optional Expert Picker */}
            {publicExperts.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#4B3034', marginBottom: 6 }}>
                  Select Expert (Optional):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedExpertId === null && styles.activeCategoryChip
                    ]}
                    onPress={() => setSelectedExpertId(null)}
                  >
                    <Text style={[styles.categoryChipText, selectedExpertId === null && styles.activeCategoryChipText]}>
                      Any Expert
                    </Text>
                  </TouchableOpacity>
                  {publicExperts.map((exp) => {
                    const isSel = selectedExpertId === exp.id;
                    return (
                      <TouchableOpacity
                        key={exp.id}
                        style={[styles.categoryChip, isSel && styles.activeCategoryChip]}
                        onPress={() => setSelectedExpertId(exp.id)}
                      >
                        <Text style={[styles.categoryChipText, isSel && styles.activeCategoryChipText]}>
                          {exp.fullName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

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
  mainTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F2',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeMainTabBtn: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E7377',
  },
  activeMainTabText: {
    color: '#FF5F70',
    fontWeight: '800',
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
  liveChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  liveChatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export { FAQScreen };
export default FAQScreen;
