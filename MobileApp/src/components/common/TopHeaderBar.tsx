import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

// Pure SVG Icon components
const BellIcon = ({ size = 20, color = '#4B3034' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

const Bars3Icon = ({ size = 20, color = '#4B3034' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

const HeartIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const ChatIcon = ({ size = 20, color = '#0284C7' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </Svg>
);

const Cog6ToothIcon = ({ size = 16, color = '#8E7377' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <Path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </Svg>
);

const QuestionMarkCircleIcon = ({ size = 16, color = '#8E7377' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
  </Svg>
);

const SparklesIcon = ({ size = 16, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
  </Svg>
);

const BookOpenIcon = ({ size = 16, color = '#0284C7' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
  </Svg>
);

const CheckCircleIcon = ({ size = 16, color = '#16A34A' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <Path d="M22 4L12 14.01l-3-3" />
  </Svg>
);

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const TopHeaderBar: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyId = useSelector((state: RootState) => state.baby.selectedBabyId);
  const selectedBaby = babies.find(b => String(b.id) === String(selectedBabyId)) || babies[0];

  const babyName = selectedBaby ? selectedBaby.name : 'Baby Profile';
  const babyAgeText = selectedBaby ? `${calculateBabyAgeInMonths(selectedBaby.dateOfBirth)} months` : 'Select baby';
  const babyColor = selectedBaby?.profileColor || '#FF7A59';

  const handleOpenNotification = () => {
    setUnreadCount(0);
    setNotifVisible(true);
  };

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Baby Profile Section (Hiển thị Tên Bé & Tuổi Bé theo chỉ đạo của Minh Nguyên) */}
      <TouchableOpacity 
        style={styles.profileSection} 
        onPress={() => navigation.navigate('ProfileTab')}
        activeOpacity={0.8}
      >
        <View style={[styles.avatarBorder, { backgroundColor: babyColor, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
            {babyName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{babyName}</Text>
          <Text style={styles.greetingText}>{babyAgeText}</Text>
        </View>
      </TouchableOpacity>

      {/* Header Action Buttons (Instagram & Facebook Style) */}
      <View style={styles.actionSection}>
        {/* Nút Tim (Instagram Style: Lịch sử thả tim bài viết & công thức) */}
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={() => navigation.navigate('FavoriteRecipes')} 
          activeOpacity={0.8}
        >
          <HeartIcon size={20} color="#FF5F70" />
        </TouchableOpacity>

        {/* Nút Thông báo */}
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={handleOpenNotification} 
          activeOpacity={0.8}
        >
          <BellIcon size={20} color={colors.text} />
          {unreadCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </View>

      {/* Notifications Modal (Prioritizing Nutrition Schedule & Baby Profile) */}
      <Modal visible={notifVisible} transparent animationType="fade" onRequestClose={() => setNotifVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setNotifVisible(false)}>
          <View style={styles.notifBox}>
            <View style={styles.notifHeaderRow}>
              <Text style={styles.notifTitle}>🔔 Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={styles.notifCloseText}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notifList}>
              {/* 1. ƯU TIÊN HÀNG ĐẦU: Lịch dinh dưỡng Sáng - Trưa - Chiều - Tối */}
              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('MealScheduler'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: isDark ? '#143823' : '#F0FDF4' }]}>
                  <CheckCircleIcon size={16} color="#16A34A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>🥣 Daily Weaning Schedule for {babyName}</Text>
                  <Text style={styles.notifTextSub}>Breakfast (08:00), Lunch (11:30), Snack (15:00) & Dinner (18:00) planned.</Text>
                  <Text style={styles.notifTime}>Just now</Text>
                </View>
              </TouchableOpacity>

              {/* 2. ƯU TIÊN TIẾP THEO: Thông báo liên quan đến Baby Profile */}
              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('ProfileTab'); }}
              >
                <View style={styles.notifIconBadge}>
                  <SparklesIcon size={16} color="#FF6B4A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>👶 Active Profile: {babyName} ({babyAgeText})</Text>
                  <Text style={styles.notifTextSub}>Smart allergy ranking is active. Safe recipes prioritized!</Text>
                  <Text style={styles.notifTime}>5 min ago</Text>
                </View>
              </TouchableOpacity>

              {/* 3. Bài viết & Công thức được đề xuất */}
              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('LibraryTab'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: isDark ? '#1E3A5F' : '#E0F2FE' }]}>
                  <BookOpenIcon size={16} color="#0284C7" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>📚 Nutrition Guide for {babyName}</Text>
                  <Text style={styles.notifTextSub}>Tips to boost appetite & nutrient absorption tailored for {babyAgeText}.</Text>
                  <Text style={styles.notifTime}>1 hour ago</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: statusBarHeight + 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: colors.borderDashed,
    shadowColor: colors.primary,
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
    backgroundColor: colors.primarySoft,
    marginRight: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
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
    color: colors.textSoft,
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBox: {
    width: 300,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
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
    borderStyle: 'solid',
    borderBottomColor: colors.borderDashed,
    paddingBottom: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  notifCloseText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
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
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  notifTextSub: {
    fontSize: 11,
    color: colors.textSoft,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  menuDrawer: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: colors.borderDashed,
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
    color: colors.text,
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashed,
  },
  closeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
});

export default TopHeaderBar;
