import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { BattleEnemy } from '@/types/game';
import { HPBar } from '@/components/ui/HPBar';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface EnemyDisplayProps {
  enemy: BattleEnemy;
}

// 敵画像のマッピング（静的インポートが必要）
const enemyImages: Record<string, any> = {
  '01_slime.png': require('@/assets/images/enemies/01_slime.png'),
  '02_goblin.png': require('@/assets/images/enemies/02_goblin.png'),
  '03_wolf.png': require('@/assets/images/enemies/03_wolf.png'),
  '04_mushroom.png': require('@/assets/images/enemies/04_mushroom.png'),
  '05_orc.png': require('@/assets/images/enemies/05_orc.png'),
  '06_trent.png': require('@/assets/images/enemies/06_trent.png'),
  '07_bandit.png': require('@/assets/images/enemies/07_bandit.png'),
  '08_ghost.png': require('@/assets/images/enemies/08_ghost.png'),
  '09_yeti.png': require('@/assets/images/enemies/09_yeti.png'),
  '10_troll.png': require('@/assets/images/enemies/10_troll.png'),
  '11_golem.png': require('@/assets/images/enemies/11_golem.png'),
  '12_redslime.png': require('@/assets/images/enemies/12_redslime.png'),
  '13_redgoblin.png': require('@/assets/images/enemies/13_redgoblin.png'),
  '14_poisonMushroom.png': require('@/assets/images/enemies/14_poisonMushroom.png'),
  '15_reddoragon.png': require('@/assets/images/enemies/15_reddoragon.png'),
  '16_deamon.png': require('@/assets/images/enemies/16_deamon.png'),
  '17_goblin_load.png': require('@/assets/images/enemies/17_goblin_load.png'),
  '18_bandit_leader.png': require('@/assets/images/enemies/18_bandit_leader.png'),
  '19_goblin_captain.png': require('@/assets/images/enemies/19_goblin_captain.png'),
  '20_orc_captain.png': require('@/assets/images/enemies/20_orc_captain.png'),
  '21_ice_armored_yeti.png': require('@/assets/images/enemies/21_ice_armored_yeti.png'),
  '22_yeti_load.png': require('@/assets/images/enemies/22_yeti_load.png'),
  '23_orc_load.png': require('@/assets/images/enemies/23_orc_load.png'),
  '24_golem_knight.png': require('@/assets/images/enemies/24_golem_knight.png'),
  '25_dark_archmage.png': require('@/assets/images/enemies/25_dark_archmage.png'),
  '26_black_knight.png': require('@/assets/images/enemies/26_black_knight.png'),
  '27_fallen_knight.png': require('@/assets/images/enemies/27_fallen_knight.png'),
  '28_daemon_knight.png': require('@/assets/images/enemies/28_daemon_knight.png'),
  '29_verdoras.png': require('@/assets/images/enemies/29_verdoras.png'),
};

// 敵ごとのプレースホルダー色（画像がない場合のフォールバック）
const enemyColors: Record<string, string> = {
  slime: '#4ade80',
  redslime: '#ef4444',
  goblin: '#22c55e',
  redgoblin: '#dc2626',
  wolf: '#71717a',
  mushroom: '#a1a1aa',
  orc: '#84cc16',
  trent: '#166534',
  bandit: '#78716c',
  ghost: '#a855f7',
  yeti: '#e5e5e5',
  poison_mushroom: '#7c3aed',
  goblin_captain: '#15803d',
  bandit_leader: '#57534e',
  troll: '#65a30d',
  golem: '#78716c',
  demon: '#dc2626',
  goblin_lord: '#14532d',
  orc_captain: '#4d7c0f',
  ice_yeti: '#0ea5e9',
  yeti_lord: '#94a3b8',
  orc_lord: '#3f6212',
  golem_knight: '#44403c',
  dark_archmage: '#7c2d12',
  black_knight: '#1f2937',
  fallen_knight: '#374151',
  daemon_knight: '#991b1b',
  red_dragon: '#f59e0b',
  verdoras: '#f59e0b',
};

export function EnemyDisplay({ enemy }: EnemyDisplayProps) {
  // enemy.image フィールドから画像を取得
  const imageSource = enemy.image ? enemyImages[enemy.image] : null;
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
        {imageSource ? (
          <Image
            source={imageSource}
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
    width: 180,
    height: 180,
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
