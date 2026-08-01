import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ClockIcon } from 'react-native-heroicons/outline';
import { FireIcon } from 'react-native-heroicons/solid';
import { RecipeListItem } from '../../types/recipe';

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
            <Text style={styles.ageText}>{recipe.month_age}+ tháng</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.timeBox}>
              <ClockIcon size={12} color="#8A8A8A" />
              <Text style={styles.timeText}>{recipe.cooking_time || 15} phút</Text>
            </View>
            <View style={styles.calBox}>
              <FireIcon size={12} color="#EF4444" />
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