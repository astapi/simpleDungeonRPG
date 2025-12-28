import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Reward } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface RewardCardProps {
  reward: Reward;
  onSelect: () => void;
}

export function RewardCard({ reward, onSelect }: RewardCardProps) {
  const getIconEmoji = () => {
    switch (reward.type) {
      case 'trait':
        return '★';
      case 'statHp':
        return '♥';
      case 'statAtk':
        return '⚔';
      case 'statDef':
        return '🛡';
      case 'heal':
        return '✚';
      default:
        return '?';
    }
  };

  const getCardColor = () => {
    switch (reward.type) {
      case 'trait':
        return COLORS.secondary;
      case 'statHp':
        return COLORS.hp;
      case 'statAtk':
        return COLORS.danger;
      case 'statDef':
        return COLORS.accent;
      case 'heal':
        return COLORS.success;
      default:
        return COLORS.card;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderColor: getCardColor() },
        pressed && styles.pressed,
      ]}
      onPress={onSelect}
    >
      <View style={[styles.iconContainer, { backgroundColor: getCardColor() }]}>
        <Text style={styles.icon}>{getIconEmoji()}</Text>
      </View>
      <Text style={styles.label}>{reward.label}</Text>
      <Text style={styles.description}>{reward.description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    minWidth: 100,
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 24,
    color: COLORS.text,
  },
  label: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  description: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});
