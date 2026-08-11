import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Icon } from 'react-native-paper';

interface StarRatingProps {
  rating: number; // 0 to 5
  userRating?: number; // User's own rating if submitted
  maxStars?: number;
  starSize?: number;
  interactive?: boolean;
  onRate?: (newRating: number) => void;
  showScoreText?: boolean;
  count?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  userRating = 0,
  maxStars = 5,
  starSize = 22,
  interactive = true,
  onRate,
  showScoreText = true,
  count = 0,
}) => {
  const scaleAnims = useRef(Array.from({ length: maxStars }, () => new Animated.Value(1))).current;

  const handleStarPress = (index: number) => {
    if (!interactive || !onRate) return;

    const selectedScore = index + 1;

    // Bounce animation for tapped star
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnims[index], { toValue: 1, bounciness: 14, speed: 22, useNativeDriver: true }),
    ]).start();

    onRate(selectedScore);
  };

  const activeScore = userRating > 0 ? userRating : rating;

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starFilled = index < Math.round(activeScore);
          return (
            <TouchableOpacity
              key={index}
              disabled={!interactive}
              onPress={() => handleStarPress(index)}
              activeOpacity={0.7}
              style={styles.starWrapper}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnims[index] }] }}>
                <Icon
                  source={starFilled ? 'star' : 'star-outline'}
                  size={starSize}
                  color={starFilled ? '#FFC107' : '#D1D5DB'}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {showScoreText && (
        <Text style={styles.scoreText}>
          {userRating > 0
            ? ` ${userRating.toFixed(1)} ⭐`
            : count > 0
            ? `${rating.toFixed(1)} ⭐ (${count})`
            : 'Tap a star to rate'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starWrapper: {
    padding: 2,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
});

export default StarRating;
