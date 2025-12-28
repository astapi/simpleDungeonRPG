import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { BattleEnemy } from '@/types/game';
import { HPBar } from '@/components/ui/HPBar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface EnemyDisplayProps {
  enemy: BattleEnemy;
}

// 敵画像のマッピング
// assets/images/enemies/ に画像を配置することで表示される
// 画像がない場合はプレースホルダーを表示
const enemyImages: Record<string, any> = {
  // 画像が追加されたらここにマッピング
  // 例: slime: require('@/assets/images/enemies/slime.png'),
};

// 敵ごとのプレースホルダー色
const enemyColors: Record<string, string> = {
  slime: '#4ade80',
  goblin: '#22c55e',
  bat: '#6b7280',
  rat: '#a1a1aa',
  orc: '#84cc16',
  skeleton: '#e5e5e5',
  wolf: '#71717a',
  ghost: '#a855f7',
  troll: '#65a30d',
  dark_knight: '#1f2937',
  demon: '#dc2626',
  golem: '#78716c',
  dragon: '#f59e0b',
};

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
  const hasImage = enemyImages[enemy.id];
  const placeholderColor = enemyColors[enemy.id] || COLORS.secondary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{enemy.name}</Text>
        {enemy.tier === 'boss' && (
          <View style={styles.bossBadge}>
            <Text style={styles.bossText}>BOSS</Text>
          </View>
        )}
      </View>

      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={enemyImages[enemy.id]}
            style={styles.image}
            contentFit="contain"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
            <Text style={styles.placeholderText}>{enemy.name[0]}</Text>
          </View>
        )}

        {enemy.isDefending && (
          <View style={styles.defendingOverlay}>
            <Text style={styles.defendingText}>防御中</Text>
          </View>
        )}
      </View>

      <View style={styles.statusContainer}>
        <HPBar
          current={enemy.currentHp}
          max={enemy.hp}
          color={enemy.tier === 'boss' ? COLORS.warning : COLORS.danger}
        />

        <View style={styles.stats}>
          <Text style={styles.statText}>ATK: {enemy.atk + enemy.buffedAtk}</Text>
          <Text style={styles.statText}>DEF: {enemy.def}</Text>
        </View>

        {enemy.statusEffects.length > 0 && (
          <View style={styles.effects}>
            {enemy.statusEffects.map((effect, index) => (
              <View
                key={`${effect.type}-${index}`}
                style={[
                  styles.effectBadge,
                  effect.type === 'poison' && styles.poisonBadge,
                  effect.type === 'burn' && styles.burnBadge,
                  effect.type === 'armorBreak' && styles.armorBreakBadge,
                ]}
              >
                <Text style={styles.effectText}>
                  {effect.type === 'poison'
                    ? '毒'
                    : effect.type === 'burn'
                    ? '火傷'
                    : '破甲'}
                  ({effect.duration})
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  bossBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  bossText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  imageContainer: {
    width: 150,
    height: 150,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
  },
  defendingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,100,255,0.3)',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defendingText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  statusContainer: {
    width: '100%',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  statText: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
  },
  effects: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  armorBreakBadge: {
    backgroundColor: '#1a3a4a',
  },
  effectText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xs,
  },
});
