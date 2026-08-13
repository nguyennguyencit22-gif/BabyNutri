import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { questionService, QuestionItem } from '../../services/questionService';
import { useAppTheme } from '../../theme/useAppTheme';

const ExpertQuestionScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Answer State
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Modal Create FAQ State
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [faqTitle, setFaqTitle] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [submittingFaq, setSubmittingFaq] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await questionService.getQuestions();
      setQuestions(data);
    } catch (e) {
      console.error('Load questions error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [loadQuestions])
  );

  const pendingList = questions.filter((q) => q.status === 'Pending');
  const answeredList = questions.filter((q) => q.status === 'Answered');

  const openAnswerModal = (q: QuestionItem) => {
    setSelectedQuestion(q);
    setAnswerText(q.answer?.content || '');
    setAnswerModalVisible(true);
  };

  const handleSendAnswer = async () => {
    if (!selectedQuestion || !answerText.trim()) {
      Alert.alert('Notice', 'Please type an answer before sending.');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await questionService.answerQuestion(selectedQuestion.id, answerText.trim());
      Alert.alert('Success', 'Answer sent to parent and published!');
      setAnswerModalVisible(false);
      setSelectedQuestion(null);
      setAnswerText('');
      loadQuestions();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit answer.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCreateFAQ = async () => {
    if (!faqTitle.trim() || !faqAnswer.trim()) {
      Alert.alert('Notice', 'Please fill in both Question Title and Answer.');
      return;
    }

    setSubmittingFaq(true);
    try {
      await questionService.createFAQ(faqTitle.trim(), faqTitle.trim(), faqAnswer.trim());
      Alert.alert('Success', 'New FAQ created successfully!');
      setFaqModalVisible(false);
      setFaqTitle('');
      setFaqAnswer('');
      setActiveTab('answered');
      loadQuestions();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create FAQ.');
    } finally {
      setSubmittingFaq(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Question', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await questionService.deleteQuestion(id);
            loadQuestions();
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete question');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="arrow-left" size={20} color="#FF6B4A" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Q&A & FAQ Management</Text>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: isDark ? '#3A2E31' : '#FFE8DF' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'pending' && styles.activeTabBtn]}
            onPress={() => setActiveTab('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'pending' && styles.activeTabText]}>
              Pending ({pendingList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'answered' && styles.activeTabBtn]}
            onPress={() => setActiveTab('answered')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'answered' && styles.activeTabText]}>
              Answered / FAQs ({answeredList.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add FAQ Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setFaqModalVisible(true)}
        activeOpacity={0.88}
      >
        <Icon source="plus" size={18} color="#FFFFFF" />
        <Text style={styles.addBtnText}>Create Standard FAQ</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : activeTab === 'pending' ? (
        <FlatList
          data={pendingList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <View style={styles.badgePending}>
                    <Text style={styles.badgePendingText}>Waiting Answer</Text>
                  </View>
                  {!!item.targetExpertName && (
                    <View style={[styles.badgePending, { backgroundColor: '#E0E7FF' }]}>
                      <Text style={[styles.badgePendingText, { color: '#4338CA' }]}>
                        Targeted: {item.targetExpertName}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.parentTag, { color: colors.textSoft }]}>From: {item.parentName || 'Parent'}</Text>
              </View>

              <Text style={[styles.qTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.qContent, { color: colors.textSoft }]}>{item.content}</Text>

              <TouchableOpacity
                style={styles.replyBtn}
                onPress={() => openAnswerModal(item)}
                activeOpacity={0.85}
              >
                <Icon source="message-reply-text" size={16} color="#FFFFFF" />
                <Text style={styles.replyBtnText}>Answer Question</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="check-all" size={44} color="#10B981" />
              <Text style={[styles.emptyText, { color: colors.text }]}>No pending questions!</Text>
              <Text style={[styles.emptySubText, { color: colors.textSoft }]}>All parent questions have been answered.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={answeredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeAnswered}>
                  <Text style={styles.badgeAnsweredText}>Answered</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
                  <Icon source="delete-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.qTitle, { color: colors.text }]}>{item.title}</Text>
              {item.answer && (
                <View style={[styles.answerBox, { backgroundColor: isDark ? '#2E2B2C' : '#FFF0F2' }]}>
                  <Text style={styles.expertTag}>{item.answer.expertName}:</Text>
                  <Text style={[styles.answerText, { color: colors.text }]}>{item.answer.content}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('QnaChat', { questionId: item.id, title: item.title, expertName: item.answer?.expertName || 'Nutrition Expert' })}
                activeOpacity={0.85}
              >
                <Icon source="chat-processing-outline" size={16} color="#FFFFFF" />
                <Text style={styles.chatBtnText}>Open Realtime Chat</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="help-circle-outline" size={44} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No answered questions yet.</Text>
            </View>
          }
        />
      )}

      {/* Answer Modal */}
      <Modal visible={answerModalVisible} transparent animationType="slide" onRequestClose={() => setAnswerModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAnswerModalVisible(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Answer Question</Text>
            {selectedQuestion && (
              <Text style={[styles.modalSub, { color: colors.textSoft }]}>"{selectedQuestion.title}"</Text>
            )}

            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Type your expert advice here..."
              placeholderTextColor={colors.textSoft}
              value={answerText}
              onChangeText={setAnswerText}
              multiline
              numberOfLines={5}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAnswerModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSendAnswer} disabled={submittingAnswer}>
                {submittingAnswer ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Answer</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create FAQ Modal */}
      <Modal visible={faqModalVisible} transparent animationType="slide" onRequestClose={() => setFaqModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFaqModalVisible(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Standard FAQ</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Question Title (e.g. Can baby eat eggs at 6m?)"
              placeholderTextColor={colors.textSoft}
              value={faqTitle}
              onChangeText={setFaqTitle}
            />

            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Expert Answer..."
              placeholderTextColor={colors.textSoft}
              value={faqAnswer}
              onChangeText={setFaqAnswer}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setFaqModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateFAQ} disabled={submittingFaq}>
                {submittingFaq ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Publish FAQ</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: statusBarHeight + 10, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tabBar: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#FF6B4A' },
  tabText: { fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5F70',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgePending: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePendingText: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  badgeAnswered: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeAnsweredText: { color: '#059669', fontSize: 11, fontWeight: '700' },
  parentTag: { fontSize: 11, fontWeight: '600' },
  qTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  qContent: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF5F70',
    paddingVertical: 10,
    borderRadius: 10,
  },
  replyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  answerBox: { borderRadius: 10, padding: 10, marginTop: 8 },
  expertTag: { fontSize: 12, fontWeight: '700', color: '#FF5F70', marginBottom: 2 },
  answerText: { fontSize: 13, lineHeight: 18 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontSize: 12, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 16 },
  modalCard: { borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  modalSub: { fontSize: 13, marginBottom: 14 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 12 },
  textArea: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, height: 100, textAlignVertical: 'top', marginBottom: 16 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6' },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  submitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FF7A59' },
  submitBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  chatBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});

export default ExpertQuestionScreen;
