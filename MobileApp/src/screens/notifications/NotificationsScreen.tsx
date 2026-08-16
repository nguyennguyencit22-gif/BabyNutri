import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import {
  fetchNotifications,
  markAllNotificationsRead,
  NotificationItem
} from '../../services/notification.service';
import { useAppTheme } from '../../theme/useAppTheme';

export const NotificationsScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchNotifications();
      setNotifications(list);
    } catch (e) {
      console.error('Fetch notifications error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifs();
    }, [loadNotifs])
  );

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifs();
  };

  const handlePressItem = (item: NotificationItem) => {
    if (item.type === 'recipe' && item.refId) {
      navigation.navigate('RecipeDetail', { id: item.refId });
    } else if (item.type === 'article' && item.refId) {
      navigation.navigate('ArticleDetail', { id: item.refId });
    } else if (item.type === 'question') {
      navigation.navigate('FAQ');
    }
  };

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'recipe':
        return { icon: 'bowl-mix-outline', color: '#FF5F70', bg: isDark ? '#3A2E31' : '#FFF0F2' };
      case 'article':
        return { icon: 'newspaper-plus', color: '#3B82F6', bg: isDark ? '#1E293B' : '#EFF6FF' };
      case 'question':
        return { icon: 'comment-question-outline', color: '#10B981', bg: isDark ? '#2B3830' : '#ECFDF5' };
      default:
        return { icon: 'bell-outline', color: '#F59E0B', bg: isDark ? '#372E1B' : '#FEF3C7' };
    }
  };

  const [filterType, setFilterType] = useState<'all' | 'recipe' | 'article' | 'question'>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const filterChips: { id: 'all' | 'recipe' | 'article' | 'question'; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'bell-outline' },
    { id: 'recipe', label: 'Recipes', icon: 'bowl-mix-outline' },
    { id: 'article', label: 'Articles', icon: 'newspaper-plus' },
    { id: 'question', label: 'Q&A Answers', icon: 'comment-question-outline' },
  ];

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
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterChips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = filterType === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && styles.activeFilterChip
                ]}
                onPress={() => setFilterType(item.id)}
                activeOpacity={0.8}
              >
                <Icon source={item.icon} size={14} color={isSelected ? '#FFFFFF' : colors.textSoft} />
                <Text style={[styles.filterChipText, { color: colors.textSoft }, isSelected && styles.activeFilterChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const config = getIconForType(item.type);
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  !item.isRead && styles.unreadCard
                ]}
                onPress={() => handlePressItem(item)}
                activeOpacity={0.85}
              >
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                  <Icon source={config.icon} size={22} color={config.color} />
                </View>

                <View style={styles.infoBox}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemMsg, { color: colors.textSoft }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={[styles.itemTime, { color: colors.textSoft }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {!item.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="bell-outline" size={44} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No notifications yet</Text>
              <Text style={[styles.emptySubText, { color: colors.textSoft }]}>
                You will be notified when experts publish new content or answer your questions.
              </Text>
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
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 12,
  },
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
  markReadBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  markReadText: { fontSize: 12, fontWeight: '700', color: '#FF7A59' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeFilterChip: {
    backgroundColor: '#FF5F70',
    borderColor: '#FF5F70',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  unreadCard: {
    borderColor: '#FF5F70',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  itemMsg: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  itemTime: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5F70' },
  emptyBox: { alignItems: 'center', marginTop: 80, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

export default NotificationsScreen;
