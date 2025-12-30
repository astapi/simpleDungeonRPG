import { View, Text, StyleSheet } from 'react-native';
import { Player } from '@/types/game';
import { getTraitById } from '@/data/traits';
import { HPBar } from '@/components/ui/HPBar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface PlayerStatusProps {
  player: Player;
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.level}>LV.{player.lv}</Text>

      <HPBar current={player.hp} max={player.maxHp} label="HP" />

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

      {/* 特性欄（常に固定高さで表示） */}
      <View style={styles.traits}>
        <Text style={styles.traitsLabel}>特性</Text>
        <View style={styles.traitsList}>
          {player.traits.length > 0 ? (
            player.traits.map((trait) => {
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
            })
          ) : (
            <Text style={styles.noTraits}>なし</Text>
          )}
        </View>
      </View>

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
    padding: SPACING.sm,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  level: {
    color: COLORS.exp,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  stats: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  traits: {
    marginTop: SPACING.xs,
    minHeight: 44,
  },
  traitsLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  traitBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  traitName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
  noTraits: {
    color: COLORS.textDark,
    fontSize: FONT_SIZES.xs,
  },
  effects: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
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
    marginTop: SPACING.xs,
  },
});
