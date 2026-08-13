import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../services/api';
import { formatRealTimeAgo } from '../../utils/formatRealTime';

interface ChatMessage {
  id: number;
  questionId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export const QnaChatScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const questionId = Number(route?.params?.questionId || route?.params?.id || 1);
  const questionTitle = route?.params?.title || 'Q&A Consultation';
  const targetExpertName = route?.params?.expertName || 'Nutrition Expert';

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserId = Number((user as any)?.id || (user as any)?.uid || 1);
  const currentRole = (user?.role || 'parent').toLowerCase();
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load chat history from REST API
  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get(`/questions/${questionId}/messages`);
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (e) {
      console.error('Load chat messages error:', e);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  // Connect Socket.io for Realtime updates
  useEffect(() => {
    loadMessages();

    // Determine Socket URL based on API base URL
    const baseURL = api.defaults.baseURL || 'http://localhost:5000';
    const socketHost = baseURL.replace(/\/api\/?$/, '');

    const socket = io(socketHost, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Realtime socket connected for Q&A room:', questionId);
      setIsConnected(true);
      socket.emit('join_qna_room', { questionId });
    });

    socket.on('disconnect', () => {
      console.log('Realtime socket disconnected for Q&A room:', questionId);
      setIsConnected(false);
    });

    socket.on('receive_qna_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    // Fallback polling every 5 seconds if socket offline
    const interval = setInterval(() => {
      if (!socket.connected) {
        loadMessages();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.emit('leave_qna_room', { questionId });
        socket.disconnect();
      }
    };
  }, [questionId, loadMessages]);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    setSending(true);

    const messageData = {
      questionId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentRole,
      content: text,
    };

    // Emit via Socket.io first for instant realtime delivery (< 50ms)
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_qna_message', messageData, (ack: any) => {
        setSending(false);
      });
      setSending(false);
    } else {
      // Fallback via HTTP REST API
      try {
        const res = await api.post(`/questions/${questionId}/messages`, { content: text });
        if (res.data) {
          setMessages((prev) => {
            if (prev.some((m) => String(m.id) === String(res.data.id))) return prev;
            return [...prev, res.data];
          });
        }
      } catch (e) {
        console.error('Send message HTTP fallback error:', e);
      } finally {
        setSending(false);
      }
    }
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = Number(item.senderId) === currentUserId;
    const isExpert = item.senderRole === 'expert';

    return (
      <View style={[styles.messageBubbleContainer, isMe ? styles.myContainer : styles.otherContainer]}>
        <View style={styles.senderHeader}>
          <Text style={[styles.senderName, { color: colors.textSoft }]}>
            {isMe ? 'You' : item.senderName || (isExpert ? 'Nutrition Expert' : 'Parent')}
          </Text>
          {isExpert && (
            <View style={styles.expertBadge}>
              <Icon source="check-decagram" size={12} color="#8B5CF6" />
              <Text style={styles.expertBadgeText}>Expert</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.bubble,
            isMe
              ? { backgroundColor: '#FF5F70', borderBottomRightRadius: 4 }
              : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text style={[styles.messageText, { color: isMe ? '#FFFFFF' : colors.text }]}>{item.content}</Text>
          <Text style={[styles.timeText, { color: isMe ? 'rgba(255, 255, 255, 0.7)' : colors.textSoft }]}>
            {formatRealTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon source="arrow-left" size={20} color="#FF5F70" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {questionTitle}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSoft }]}>Consulting with: {targetExpertName}</Text>
        </View>

        <View style={[styles.realtimeBadge, { backgroundColor: isConnected ? '#ECFDF5' : '#FEF3C7', borderColor: isConnected ? '#A7F3D0' : '#FDE68A' }]}>
          <View style={[styles.greenDot, { backgroundColor: isConnected ? '#10B981' : '#F59E0B' }]} />
          <Text style={[styles.realtimeText, { color: isConnected ? '#047857' : '#B45309' }]}>
            {isConnected ? 'Live Chat' : 'Syncing'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF5F70" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#3A2E31' : '#F5F5F5', color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={colors.textSoft}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon source="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  realtimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  messageBubbleContainer: {
    maxWidth: '82%',
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5F70',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QnaChatScreen;
