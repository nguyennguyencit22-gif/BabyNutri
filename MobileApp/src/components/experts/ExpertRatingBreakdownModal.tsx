import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from '../common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import { fetchExpertRatingBreakdown, RatingBreakdown } from '../../services/expert.service';

interface ExpertRatingBreakdownModalProps {
  visible: boolean;
  expertId: number;
  expertName?: string;
  onClose: () => void;
}

export const ExpertRatingBreakdownModal: React.FC<ExpertRatingBreakdownModalProps> = ({
  visible,
  expertId,
  expertName = 'Nutrition Expert',
  onClose,
}) => {
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RatingBreakdown | null>(null);

  useEffect(() => {
    if (visible && expertId) {
      setLoading(true);
      fetchExpertRatingBreakdown(expertId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [visible, expertId]);

  if (!visible) return null;

  const overallScore = data?.overallAvgRating ? data.overallAvgRating.toFixed(1) : '4.9';
  const totalCount = data?.totalRatings || 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={1}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Icon source="star" size={22} color="#FFB800" />
              <Text style={[styles.title, { color: colors.text }]}>Rating Breakdown</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Icon source="close" size={20} color={colors.textSoft} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.expertName, { color: colors.textSoft }]}>{data?.expertName || expertName}</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : (
            <View style={styles.content}>
              {/* Overall Score Box */}
              <View style={[styles.overallBox, { backgroundColor: isDark ? '#2E2836' : '#F5EEFF' }]}>
                <Text style={styles.overallScore}>{overallScore}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} source="star" size={18} color="#FFB800" />
                  ))}
                </View>
                <Text style={[styles.overallSub, { color: colors.textSoft }]}>
                  Weighted Average across {totalCount} evaluation{totalCount === 1 ? '' : 's'}
                </Text>
              </View>

              {/* Breakdown Item 1: Recipe */}
              <View style={[styles.breakdownRow, { borderColor: colors.border }]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FFEBEA' }]}>
                    <Icon source="chef-hat" size={18} color="#FF5F70" />
                  </View>

                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>Recipe Ratings</Text>
                    <Text style={[styles.itemSub, { color: colors.textSoft }]}>
                      {data?.breakdown.recipe.count || 0} evaluation{(data?.breakdown.recipe.count || 0) === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.scoreText}>{data?.breakdown.recipe.avgRating.toFixed(1) || '4.8'}</Text>
                  <Icon source="star" size={16} color="#FFB800" />
                </View>
              </View>

              {/* Breakdown Item 2: Article */}
              <View style={[styles.breakdownRow, { borderColor: colors.border }]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#EBF5FF' }]}>
                    <Icon source="file-document-outline" size={18} color="#007AFF" />
                  </View>

                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>Article Ratings</Text>
                    <Text style={[styles.itemSub, { color: colors.textSoft }]}>
                      {data?.breakdown.article.count || 0} evaluation{(data?.breakdown.article.count || 0) === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.scoreText}>{data?.breakdown.article.avgRating.toFixed(1) || '5.0'}</Text>
                  <Icon source="star" size={16} color="#FFB800" />
                </View>
              </View>

              {/* Breakdown Item 3: FAQ Q&A */}
              <View style={[styles.breakdownRow, { borderColor: colors.border }]}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Icon source="help-circle-outline" size={18} color="#8B5CF6" />
                  </View>

                  <View>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>FAQ Q&A Ratings</Text>
                    <Text style={[styles.itemSub, { color: colors.textSoft }]}>
                      {data?.breakdown.faq.count || 0} evaluation{(data?.breakdown.faq.count || 0) === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.scoreText}>{data?.breakdown.faq.avgRating.toFixed(1) || '4.9'}</Text>
                  <Icon source="star" size={16} color="#FFB800" />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  expertName: {
    fontSize: 13,
    marginBottom: 16,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  content: {
    marginBottom: 16,
  },
  overallBox: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  overallScore: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8B5CF6',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  overallSub: {
    fontSize: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  closeBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ExpertRatingBreakdownModal;
