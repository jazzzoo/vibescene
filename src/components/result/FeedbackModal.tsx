import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { getAcquisitionSource } from '../../services/acquisitionSource';
import { logEvent } from '../../services/analytics';
import { capture } from '../../services/posthog';

type FeedbackRating = 'nailed_it' | 'pretty_close' | 'not_really';

interface FeedbackModalProps {
  visible: boolean;
  playlistId: string;
  onDismiss: () => void;
  onSubmitted: () => void;
}

const RATINGS: { value: FeedbackRating; emoji: string; label: string }[] = [
  { value: 'nailed_it', emoji: '🔥', label: 'Nailed it' },
  { value: 'pretty_close', emoji: '🙂', label: 'Pretty close' },
  { value: 'not_really', emoji: '😕', label: 'Not really' },
];

export default function FeedbackModal({ visible, playlistId, onDismiss, onSubmitted }: FeedbackModalProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!rating || submitting) return;
    setSubmitting(true);
    try {
      const succeeded = await logEvent('playlist_feedback', {
        playlist_id: playlistId,
        rating,
        comment: comment.trim() || null,
      });
      if (succeeded) {
        capture('feedback_submit', {
          source: getAcquisitionSource(),
          playlist_id: playlistId,
          rating,
        });
      }
    } finally {
      setSubmitting(false);
      onSubmitted();
    }
  }

  function handleDismiss() {
    setRating(null);
    setComment('');
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.wrapper}>
        {/* 시트 위 영역 탭 시 닫기 */}
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleDismiss} />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING.CARD_PADDING) }]}>
          <Text style={styles.title}>Did this soundtrack fit your photo?</Text>

          <View style={styles.ratingRow}>
            {RATINGS.map(({ value, emoji, label }) => (
              <TouchableOpacity
                key={value}
                style={[styles.ratingBtn, rating === value && styles.ratingBtnSelected]}
                onPress={() => setRating(value)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: rating === value }}
                accessibilityLabel={label}
              >
                <Text style={styles.ratingEmoji}>{emoji}</Text>
                <Text style={[styles.ratingLabel, rating === value && styles.ratingLabelSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="What felt wrong? (optional)"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={comment}
            onChangeText={setComment}
            maxLength={200}
            returnKeyType="done"
            blurOnSubmit
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleDismiss} activeOpacity={0.7} style={styles.skipBtn}>
              <Text style={styles.skipLabel}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, (!rating || submitting) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={!rating || submitting}
              activeOpacity={0.7}
            >
              <Text style={styles.submitLabel}>{submitting ? 'Sending…' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: SPACING.CARD_PADDING,
    paddingTop: SPACING.CARD_PADDING,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.SECTION_GAP * 0.75,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: SPACING.BASE,
    marginBottom: SPACING.CARD_PADDING,
  },
  ratingBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.BASE * 1.25,
    borderRadius: SPACING.BASE,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  ratingBtnSelected: {
    borderColor: COLORS.ACCENT,
    backgroundColor: 'rgba(245, 200, 66, 0.10)',
  },
  ratingEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  ratingLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingLabelSelected: {
    color: COLORS.ACCENT,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: SPACING.BASE,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    paddingHorizontal: SPACING.BASE * 1.5,
    paddingVertical: SPACING.BASE * 1.25,
    marginBottom: SPACING.CARD_PADDING,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.BASE,
    marginBottom: SPACING.BASE,
  },
  skipBtn: {
    paddingVertical: SPACING.BASE * 1.5,
    paddingHorizontal: SPACING.CARD_PADDING,
  },
  skipLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: COLORS.ACCENT,
    borderRadius: SPACING.BASE,
    paddingVertical: SPACING.BASE * 1.5,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    color: COLORS.BUTTON_TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
});
