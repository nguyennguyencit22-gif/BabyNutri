import React, { useCallback, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { chatService, ChatConversation } from '../../services/chat.service';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import { useAppTheme } from '../../theme/useAppTheme';

// Parent side of the Community tab's "Chat" sub-tab: their own
// conversations with Experts, plus an entry point to start a new one.
const ParentChatList = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const list = await chatService.getMyConversations();
      setConversations(list);
    } catch (e) {
      console.error('Load conversations error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newChatBtn}
        onPress={() => navigation.navigate('ChatExpertPicker')}
        activeOpacity={0.88}
      >
        <Icon source="message-text-outline" size={18} color="#FFFFFF" />
        <Text style={styles.newChatBtnText}>Chat with an Expert</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('ChatConversation', {
                conversationId: item.id,
                peerName: item.expertName,
                peerAvatar: item.expertAvatar,
                status: item.status,
                isParentSide: true,
              })}
              activeOpacity={0.85}
            >
              {item.expertAvatar ? (
                <Image source={{ uri: item.expertAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>{item.expertName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.expertName}</Text>
                  <Text style={[styles.cardTime, { color: colors.textSoft }]}>{formatRealTimeAgo(item.lastMessageAt)}</Text>
                </View>
                <Text style={[styles.cardMessage, { color: colors.textSoft }]} numberOfLines={1}>
                  {item.lastMessage || 'Say hello to start the conversation!'}
                </Text>
              </View>
              {item.status === 'ended' && (
                <View style={[styles.endedBadge, { backgroundColor: isDark ? '#3A2E31' : '#F3F4F6' }]}>
                  <Text style={[styles.endedBadgeText, { color: colors.textSoft }]}>Ended</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="message-text-outline" size={40} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No conversations yet.</Text>
              <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Tap "Chat with an Expert" to ask a question about your baby's nutrition.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginHorizontal: 16, marginVertical: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5F70',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  newChatBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  listContent: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  cardInfo: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  cardName: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  cardTime: { fontSize: 11 },
  cardMessage: { fontSize: 13 },
  endedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 8 },
  endedBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '700' },
  emptySubText: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
});

export default ParentChatList;
