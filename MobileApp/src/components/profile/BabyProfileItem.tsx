import React from 'react';
import {
    Alert,
    Pressable,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '../../theme/useAppTheme';

const ThreeDotsIcon = ({ size = 20, color = '#8E7377' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="1.5" fill={color} />
    <Circle cx="19" cy="12" r="1.5" fill={color} />
    <Circle cx="5" cy="12" r="1.5" fill={color} />
  </Svg>
);

const TrashIcon = ({ size = 18, color = '#EF4444' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

type BabyProfileItemProps = {
    name: string;
    ageInMonths: number;
    profileColor: string;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

function BabyProfileItem({
    name,
    ageInMonths,
    profileColor,
    onPress,
    onEdit,
    onDelete,
}: BabyProfileItemProps) {
    const { colors } = useAppTheme();

    const handleDelete = () => {
        Alert.alert(
            'Delete Baby Profile',
            `Are you sure you want to delete ${name}'s profile?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onDelete,
                },
            ],
        );
    };

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.borderDashedPrimary || '#FFE4E6' },
                pressed && styles.cardPressed,
            ]}>
            <View style={styles.leftRow}>
                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: profileColor || '#FF7A59',
                        },
                    ]}>
                    <Text style={styles.avatarText}>
                        {name.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>
                        {name}
                    </Text>

                    <Text style={[styles.age, { color: colors.textSoft }]}>
                        {ageInMonths} months old
                    </Text>
                </View>
            </View>

            <View style={styles.actionsRow}>
                {onDelete && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.deleteBtn,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}>
                        <TrashIcon size={18} color="#EF4444" />
                    </Pressable>
                )}

                <Pressable
                    style={({ pressed }) => [
                        styles.moreBtn,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={(e) => {
                        e.stopPropagation();
                        if (onPress) onPress();
                    }}>
                    <ThreeDotsIcon size={20} color={colors.textSoft} />
                </Pressable>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    backgroundColor: '#FFF0F2',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  age: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BabyProfileItem;