import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RecipeListItem } from '../../types/recipe';

const ClockIcon = ({ size = 12, color = '#8E7377' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const FireIcon = ({ size = 12, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12.75 2.25a.75.75 0 00-1.5 0v.916c0 1.257-.59 2.443-1.59 3.204a8.25 8.25 0 00-3.41 6.63c0 4.556 3.694 8.25 8.25 8.25s8.25-3.694 8.25-8.25c0-2.616-1.22-4.949-3.123-6.452a4.98 4.98 0 01-1.377-2.684V2.25z" />
  </Svg>
);

interface Props {
  recipe: RecipeListItem;
  onPress: () => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{ flex: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>{recipe.month_age}+ months</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.timeBox}>
              <ClockIcon size={12} color="#8E7377" />
              <Text style={styles.timeText}>{recipe.cooking_time || 15} mins</Text>
            </View>
            <View style={styles.calBox}>
              <FireIcon size={12} color="#FF5F70" />
              <Text style={styles.calText}>{recipe.calories} kcal</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFF0F2',
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 95, 112, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  ageText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 6,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#8E7377',
  },
  calText: {
    fontSize: 11,
    color: '#FF5F70',
    fontWeight: '600',
  },
});

export default RecipeCard;