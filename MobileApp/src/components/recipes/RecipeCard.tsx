import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from 'react-native-paper';
import { RecipeListItem } from '../../types/recipe';

interface Props {
  recipe: RecipeListItem;
  onPress: () => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    loadRealRating();
  }, [recipe.id]);

  const loadRealRating = async () => {
    try {
      const stored = await AsyncStorage.getItem(`recipe_rating_${recipe.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.avgRating) setRating(parsed.avgRating);
      }
    } catch {
      setRating(0);
    }
  };

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
          {rating > 0 && (
            <View style={styles.starBadge}>
              <Icon source="star" size={12} color="#FFC107" />
              <Text style={styles.starText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.timeBox}>
              <Icon source="clock-outline" size={12} color="#8E7377" />
              <Text style={styles.timeText}>{recipe.cooking_time || 15} mins</Text>
            </View>
            <View style={styles.calBox}>
              <Icon source="fire" size={12} color="#FF5F70" />
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
  starBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  starText: {
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