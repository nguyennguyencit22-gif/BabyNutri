import React, { useCallback, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { chatService, ChatConversation } from '../../services/chat.service';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import { useAppTheme } from '../../theme/useAppTheme';

// Expert side of the Community tab's "Chat" sub-tab: an inbox of
// conversations started by parents/customers.
const ExpertChatInbox = ({ navigation: propNav }: any) => {
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;
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
                peerName: item.parentName,
                peerAvatar: item.parentAvatar,
                status: item.status,
                isParentSide: false,
              })}
              activeOpacity={0.85}
            >
              {item.parentAvatar ? (
                <Image source={{ uri: item.parentAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>{item.parentName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={styles.cardTopRow}>
                  <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.parentName}</Text>
                  <Text style={[styles.cardTime, { color: colors.textSoft }]}>{formatRealTimeAgo(item.lastMessageAt)}</Text>
                </View>
                <Text style={[styles.cardMessage, { color: colors.textSoft }]} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
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
              <Text style={[styles.emptyText, { color: colors.text }]}>No customer chats yet.</Text>
              <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Parents who start a chat with you will show up here.</Text>
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

export default ExpertChatInbox;
