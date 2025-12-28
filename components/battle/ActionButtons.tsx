import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Player, PlayerAction } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface ActionButtonsProps {
  player: Player;
  disabled: boolean;
  onAction: (action: PlayerAction) => void;
}

export function ActionButtons({ player, disabled, onAction }: ActionButtonsProps) {
  const skillDisabled = player.skillCooldown > 0;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.attackButton,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => onAction('attack')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>攻撃</Text>
        <Text style={styles.buttonSubtext}>通常攻撃</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.guardButton,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => onAction('guard')}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>ガード</Text>
        <Text style={styles.buttonSubtext}>ダメージ50%軽減</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.skillButton,
          pressed && styles.buttonPressed,
          (disabled || skillDisabled) && styles.buttonDisabled,
        ]}
        onPress={() => onAction('skill')}
        disabled={disabled || skillDisabled}
      >
        <Text style={styles.buttonText}>スキル</Text>
        <Text style={styles.buttonSubtext}>
          {skillDisabled
            ? `CT: ${player.skillCooldown}`
            : 'パワーストライク'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attackButton: {
    backgroundColor: COLORS.buttonPrimary,
  },
  guardButton: {
    backgroundColor: COLORS.accent,
  },
  skillButton: {
    backgroundColor: COLORS.buttonSecondary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
});
