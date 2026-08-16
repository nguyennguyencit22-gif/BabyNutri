import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import { chatService, ChatExpert } from '../../services/chat.service';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

// Parent picks a verified Expert to start (or resume) a chat with.
const ChatExpertPickerScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [experts, setExperts] = useState<ChatExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);

  useEffect(() => {
    chatService.getExperts()
      .then(setExperts)
      .catch((e) => console.error('Load experts error:', e))
      .finally(() => setLoading(false));
  }, []);

  const handlePick = async (expert: ChatExpert) => {
    setStartingId(expert.id);
    try {
      const { id } = await chatService.startConversation(expert.id);
      navigation.replace('ChatConversation', {
        conversationId: id,
        peerName: expert.name,
        peerAvatar: expert.image,
        status: 'active',
        isParentSide: true,
      });
    } catch (e) {
      console.error('Start conversation error:', e);
      appAlert.show('Error', 'Unable to start this chat right now.', undefined, 'error');
    } finally {
      setStartingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="arrow-left" size={20} color="#FF6B4A" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Chat with an Expert</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          data={experts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handlePick(item)}
              disabled={startingId !== null}
              activeOpacity={0.85}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
                {!!item.role && <Text style={[styles.cardRole, { color: colors.textSoft }]}>{item.role}</Text>}
              </View>
              {startingId === item.id ? (
                <ActivityIndicator size="small" color="#FF7A59" />
              ) : (
                <Icon source="chevron-right" size={20} color={colors.textSoft} />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="account-outline" size={40} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No verified experts available right now.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: statusBarHeight + 10, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFFFFF', fontWeight: '800', fontSize: 20 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardRole: { fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

export default ChatExpertPickerScreen;
