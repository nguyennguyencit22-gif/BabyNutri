import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  BellIcon,
  Bars3Icon,
  UserIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from 'react-native-heroicons/outline';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const TopHeaderBar: React.FC = () => {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const handleOpenNotification = () => {
    setUnreadCount(0);
    setNotifVisible(true);
  };

  return (
    <View style={styles.headerContainer}>
      {/* Góc trái: Profile Avatar & Tên người dùng */}
      <TouchableOpacity 
        style={styles.profileSection} 
        onPress={() => navigation.navigate('ProfileTab')}
        activeOpacity={0.8}
      >
        <View style={styles.avatarBorder}>
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=Nguyen+Minh&background=FF7A59&color=fff&bold=true' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.greetingText}>Xin chào, Mẹ Bé</Text>
          <Text style={styles.userName}>Minh Nguyên</Text>
        </View>
      </TouchableOpacity>

      {/* Góc phải: Nút Thông báo & Nút 3 gạch */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleOpenNotification} activeOpacity={0.8}>
          <BellIcon size={20} color="#1F2937" />
          {unreadCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <Bars3Icon size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Modal Cửa sổ Danh sách Thông báo tự nhiên & ấm áp */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setNotifVisible(false)}>
          <View style={styles.notifBox}>
            <View style={styles.notifHeaderRow}>
              <Text style={styles.notifTitle}>Thông báo mới</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={styles.notifCloseText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notifList}>
              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('LibraryTab'); }}
              >
                <View style={styles.notifIconBadge}>
                  <SparklesIcon size={16} color="#FF6B4A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>Gợi ý thực đơn ăn dặm mới</Text>
                  <Text style={styles.notifTextSub}>Đã có 3 gợi ý công thức cháo giàu dinh dưỡng phù hợp cho bé từ 6 - 12 tháng.</Text>
                  <Text style={styles.notifTime}>10 phút trước</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('LibraryTab'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: '#E0F2FE' }]}>
                  <BookOpenIcon size={16} color="#0284C7" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>Bài viết dinh dưỡng mới</Text>
                  <Text style={styles.notifTextSub}>Chuyên gia vừa chia sẻ mẹo giúp bé ăn ngon miệng và hấp thu dưỡng chất tốt hơn.</Text>
                  <Text style={styles.notifTime}>1 giờ trước</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('MealScheduler'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: '#F0FDF4' }]}>
                  <CheckCircleIcon size={16} color="#16A34A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>Lời nhắn từ ứng dụng</Text>
                  <Text style={styles.notifTextSub}>Đừng quên tham khảo các công thức ăn dặm tuần này cho bé mẹ nhé!</Text>
                  <Text style={styles.notifTime}>Hôm qua</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Modal Menu 3 gạch Side Drawer Menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuDrawer}>
            <Text style={styles.drawerTitle}>Danh mục ứng dụng</Text>

            <TouchableOpacity 
              style={styles.drawerItem} 
              onPress={() => { setMenuVisible(false); navigation.navigate('ProfileTab'); }}
            >
              <View style={styles.drawerRow}>
                <UserIcon size={16} color="#4B5563" />
                <Text style={styles.drawerText}>Hồ sơ người dùng</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerItem} onPress={() => { setMenuVisible(false); navigation.navigate('SavedItems'); }}>
              <View style={styles.drawerRow}>
                <BookmarkIcon size={16} color="#FF6B4A" />
                <Text style={[styles.drawerText, { color: '#FF6B4A', fontWeight: '700' }]}>Bài viết & Công thức đã lưu</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerItem} 
              onPress={() => { setMenuVisible(false); navigation.navigate('AccountSettings'); }}
            >
              <View style={styles.drawerRow}>
                <Cog6ToothIcon size={16} color="#4B5563" />
                <Text style={styles.drawerText}>Cài đặt ứng dụng</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.drawerItem} 
              onPress={() => { setMenuVisible(false); navigation.navigate('FAQ'); }}
            >
              <View style={styles.drawerRow}>
                <QuestionMarkCircleIcon size={16} color="#4B5563" />
                <Text style={styles.drawerText}>Trợ giúp & Hỏi đáp FAQ</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setMenuVisible(false)}>
              <Text style={styles.closeText}>Đóng menu</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8E2',
    shadowColor: '#FF7A59',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 22,
    backgroundColor: '#FFE8DF',
    marginRight: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  userInfo: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 16,
  },
  notifBox: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  notifCloseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  notifList: {
    gap: 12,
  },
  notifItem: {
    flexDirection: 'row',
    gap: 10,
  },
  notifIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE8DF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  notifTextSub: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  menuDrawer: {
    width: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8E2',
    paddingBottom: 8,
  },
  drawerItem: {
    paddingVertical: 10,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
});

export default TopHeaderBar;
