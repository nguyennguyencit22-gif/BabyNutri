import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/AppIcon';
import StarRating from '../../components/common/StarRating';
import { chatService, ChatMessage } from '../../services/chat.service';
import { getSocket } from '../../services/socket.service';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

// Shared chat thread UI for both sides of a conversation — a Parent talking
// to an Expert, or an Expert replying to a Parent. Only the Parent sees the
// "End Chat" action (which prompts a post-chat rating); the Expert side is
// otherwise identical.
const ChatConversationScreen = ({ route, navigation }: any) => {
  const { colors } = useAppTheme();
  const conversationId: number = Number(route?.params?.conversationId);
  const peerName: string = route?.params?.peerName || 'Chat';
  const peerAvatar: string | null = route?.params?.peerAvatar || null;
  const initialStatus: 'active' | 'ended' = route?.params?.status || 'active';
  const isParentSide: boolean = !!route?.params?.isParentSide;

  const user = useSelector((state: RootState) => state.auth.user);
  const myUserId = user?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [ending, setEnding] = useState(false);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [rateScore, setRateScore] = useState(0);
  const [rateReview, setRateReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  const loadMessages = useCallback(async () => {
    try {
      const list = await chatService.getMessages(conversationId);
      setMessages(list);
    } catch (e) {
      console.error('Load chat messages error:', e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  useEffect(() => {
    let active = true;

    const handleNewMessage = (message: ChatMessage & { conversationId: number }) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, message]);
    };

    (async () => {
      const socket = await getSocket();
      if (!active) return;

      socket.emit('join_conversation', conversationId, (res: { error?: string }) => {
        if (res?.error) {
          console.error('join_conversation error:', res.error);
        }
      });
      socket.on('new_message', handleNewMessage);
    })();

    return () => {
      active = false;
      getSocket().then((socket) => socket.off('new_message', handleNewMessage));
    };
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || status === 'ended') return;

    setInput('');
    try {
      const socket = await getSocket().catch(() => null);
      if (socket && socket.connected) {
        socket.emit('send_message', { conversationId, content: text }, async (res: { error?: string }) => {
          if (res?.error) {
            console.warn('send_message socket warning, falling back to REST:', res.error);
            const sent = await chatService.sendMessage(conversationId, text);
            setMessages((prev) => [...prev, sent]);
          }
        });
      } else {
        const sent = await chatService.sendMessage(conversationId, text);
        setMessages((prev) => [...prev, sent]);
      }
    } catch (err) {
      try {
        const sent = await chatService.sendMessage(conversationId, text);
        setMessages((prev) => [...prev, sent]);
      } catch (e) {
        console.error('send message error:', e);
        appAlert.show('Error', 'Unable to send your message right now.', undefined, 'error');
      }
    }
  };

  const handleEndChat = () => {
    appAlert.show(
      'End Chat',
      'Are you sure you want to end this conversation? You can rate the Expert afterwards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Chat',
          style: 'destructive',
          onPress: async () => {
            setEnding(true);
            try {
              await chatService.endConversation(conversationId);
              setStatus('ended');
              setRateModalVisible(true);
            } catch (e) {
              console.error('End chat error:', e);
              appAlert.show('Error', 'Unable to end this chat right now.', undefined, 'error');
            } finally {
              setEnding(false);
            }
          },
        },
      ],
      'warning',
    );
  };

  const handleSubmitRating = async () => {
    if (rateScore === 0) return;
    setSubmittingRating(true);
    try {
      await chatService.rateConversation(conversationId, rateScore, rateReview.trim() || undefined);
      setRateModalVisible(false);
      appAlert.show('Thank You!', 'Your feedback helps other parents find great Experts.', undefined, 'star');
    } catch (e) {
      console.error('Submit chat rating error:', e);
      appAlert.show('Error', 'Unable to submit your rating right now.', undefined, 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon source="chevron-left" size={24} color="#FF7A59" />
        </TouchableOpacity>

        {peerAvatar ? (
          <Image source={{ uri: peerAvatar }} style={styles.headerAvatar} />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={styles.headerAvatarLetter}>{peerName.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>{peerName}</Text>
          {status === 'ended' && <Text style={[styles.headerStatus, { color: colors.textSoft }]}>Chat ended</Text>}
        </View>

        {isParentSide && status === 'active' && (
          <TouchableOpacity onPress={handleEndChat} disabled={ending} activeOpacity={0.8}>
            <Text style={styles.endChatText}>{ending ? 'Ending...' : 'End Chat'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const mine = item.senderId === myUserId;
            return (
              <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                <View style={[
                  styles.bubble,
                  mine
                    ? styles.bubbleMine
                    : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                ]}>
                  <Text style={mine ? styles.bubbleTextMine : [styles.bubbleText, { color: colors.text }]}>
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="message-text-outline" size={36} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.textSoft }]}>
                Say hello to start the conversation!
              </Text>
            </View>
          }
        />
      )}

      {status === 'active' ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSoft}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
              <Icon source="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <View style={[styles.endedBanner, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.endedBannerText, { color: colors.textSoft }]}>This chat has ended.</Text>
        </View>
      )}

      {/* Post-chat Rating Modal (Parent only) */}
      <Modal visible={rateModalVisible} transparent animationType="fade" onRequestClose={() => setRateModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setRateModalVisible(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Rate this conversation</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSoft }]}>How was your chat with {peerName}?</Text>

            <View style={styles.modalStarsRow}>
              <StarRating
                rating={0}
                userRating={rateScore}
                interactive
                onRate={setRateScore}
                showScoreText={false}
                starSize={30}
              />
            </View>

            <TextInput
              style={[styles.modalReviewInput, { backgroundColor: colors.surfaceAlt, color: colors.text }]}
              placeholder="Leave a comment (optional)"
              placeholderTextColor={colors.textSoft}
              value={rateReview}
              onChangeText={setRateReview}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalSkipBtn, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => setRateModalVisible(false)}
              >
                <Text style={[styles.modalSkipText, { color: colors.textSoft }]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, rateScore === 0 && styles.modalSubmitBtnDisabled]}
                onPress={handleSubmitRating}
                disabled={rateScore === 0 || submittingRating}
              >
                <Text style={styles.modalSubmitText}>{submittingRating ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarFallback: { justifyContent: 'center', alignItems: 'center' },
  headerAvatarLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '700' },
  headerStatus: { fontSize: 11, marginTop: 2 },
  endChatText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  listContent: { padding: 14, flexGrow: 1 },
  bubbleRow: { flexDirection: 'row', marginBottom: 10 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#FF5F70', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { fontSize: 14, lineHeight: 20, color: '#FFFFFF' },
  emptyBox: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5F70',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endedBanner: { padding: 14, alignItems: 'center' },
  endedBannerText: { fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalBox: { borderRadius: 20, padding: 22 },
  modalTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  modalStarsRow: { alignItems: 'center', marginBottom: 16 },
  modalReviewInput: { borderRadius: 12, padding: 12, fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 18 },
  modalBtnRow: { flexDirection: 'row', gap: 10 },
  modalSkipBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalSkipText: { fontWeight: '700', fontSize: 14 },
  modalSubmitBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FF5F70' },
  modalSubmitBtnDisabled: { opacity: 0.5 },
  modalSubmitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default ChatConversationScreen;
