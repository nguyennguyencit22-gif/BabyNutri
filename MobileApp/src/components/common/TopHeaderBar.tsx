import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const TopHeaderBar: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
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
      
      {/* Baby Profile Section */}
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

      {/* Header Action Buttons */}
      <View style={styles.actionSection}>
        {/* Heart Favorites Button */}
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={() => navigation.navigate('SavedItems')} 
          activeOpacity={0.8}
        >
          <Icon source="heart-outline" size={20} color="#FF5F70" />
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={handleOpenNotification} 
          activeOpacity={0.8}
        >
          <Icon source="bell-outline" size={20} color={colors.text} />
          {unreadCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
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
              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('MealScheduler'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: isDark ? '#143823' : '#F0FDF4' }]}>
                  <Icon source="check-circle-outline" size={16} color="#16A34A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>🥣 Daily Weaning Schedule for {babyName}</Text>
                  <Text style={styles.notifTextSub}>Breakfast (08:00), Lunch (11:30), Snack (15:00) & Dinner (18:00) planned.</Text>
                  <Text style={styles.notifTime}>Just now</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('ProfileTab'); }}
              >
                <View style={styles.notifIconBadge}>
                  <Icon source="sparkles" size={16} color="#FF6B4A" />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTextBold}>👶 Active Profile: {babyName} ({babyAgeText})</Text>
                  <Text style={styles.notifTextSub}>Smart allergy ranking is active. Safe recipes prioritized!</Text>
                  <Text style={styles.notifTime}>5 min ago</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notifItem}
                onPress={() => { setNotifVisible(false); navigation.navigate('LibraryTab'); }}
              >
                <View style={[styles.notifIconBadge, { backgroundColor: isDark ? '#1E3A5F' : '#E0F2FE' }]}>
                  <Icon source="book-open-outline" size={16} color="#0284C7" />
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
});

export default TopHeaderBar;
