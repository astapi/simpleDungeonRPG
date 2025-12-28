import { View, Text, StyleSheet } from 'react-native';
import { Player, GAME_CONSTANTS } from '@/types/game';
import { getTraitById } from '@/data/traits';
import { HPBar } from '@/components/ui/HPBar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface PlayerStatusProps {
  player: Player;
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  const expForNextLevel = player.lv * GAME_CONSTANTS.EXP_PER_LEVEL;
  const expPercentage = (player.exp / expForNextLevel) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>勇者</Text>
        <Text style={styles.level}>LV.{player.lv}</Text>
      </View>

      <HPBar current={player.hp} max={player.maxHp} label="HP" />

      <View style={styles.expContainer}>
        <Text style={styles.expLabel}>EXP</Text>
        <View style={styles.expBar}>
          <View style={[styles.expFill, { width: `${expPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ATK</Text>
          <Text style={styles.statValue}>{player.atk}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DEF</Text>
          <Text style={styles.statValue}>{player.def}</Text>
        </View>
      </View>

      {player.traits.length > 0 && (
        <View style={styles.traits}>
          <Text style={styles.traitsLabel}>特性</Text>
          <View style={styles.traitsList}>
            {player.traits.map((trait) => {
              const definition = getTraitById(trait.id);
              if (!definition) return null;
              return (
                <View key={trait.id} style={styles.traitBadge}>
                  <Text style={styles.traitName}>
                    {definition.name}
                    {trait.stackCount > 1 && ` x${trait.stackCount}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {player.statusEffects.length > 0 && (
        <View style={styles.effects}>
          {player.statusEffects.map((effect, index) => (
            <View
              key={`${effect.type}-${index}`}
              style={[
                styles.effectBadge,
                effect.type === 'poison' && styles.poisonBadge,
                effect.type === 'burn' && styles.burnBadge,
              ]}
            >
              <Text style={styles.effectText}>
                {effect.type === 'poison' ? '毒' : '火傷'}({effect.duration})
              </Text>
            </View>
          ))}
        </View>
      )}

      {player.skillCooldown > 0 && (
        <Text style={styles.cooldown}>
          スキル: {player.skillCooldown}ターン
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  level: {
    color: COLORS.exp,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  expContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  expLabel: {
    color: COLORS.exp,
    fontSize: FONT_SIZES.xs,
    marginRight: SPACING.sm,
    width: 28,
  },
  expBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: COLORS.exp,
    borderRadius: BORDER_RADIUS.sm,
  },
  stats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  traits: {
    marginTop: SPACING.md,
  },
  traitsLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xs,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  traitBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  traitName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
  effects: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  effectBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  poisonBadge: {
    backgroundColor: '#4a1a4a',
  },
  burnBadge: {
    backgroundColor: '#4a2a1a',
  },
  effectText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
  cooldown: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.sm,
  },
});
