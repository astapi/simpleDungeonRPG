// ============================================
// 敵データ（DataLoaderから取得）
// ============================================

import { EnemyDefinition } from '@/types/game';
import { dataLoader } from '@/core/DataLoader';

// Tier別敵データ（DataLoaderから取得）
export const TIER1_ENEMIES: EnemyDefinition[] = dataLoader.getEnemiesByTier(1);
export const TIER2_ENEMIES: EnemyDefinition[] = dataLoader.getEnemiesByTier(2);
export const TIER3_ENEMIES: EnemyDefinition[] = dataLoader.getEnemiesByTier(3);

// ラスボス
export const BOSS_ENEMY: EnemyDefinition = dataLoader.getBoss();

// 階層ごとの敵プール取得
export function getEnemyPool(floor: number): EnemyDefinition[] {
  switch (floor) {
    case 1:
      return TIER1_ENEMIES;
    case 2:
      // 7:3 の比率で Tier1:Tier2
      return [...TIER1_ENEMIES, ...TIER1_ENEMIES, ...TIER2_ENEMIES];
    case 3:
      return TIER2_ENEMIES;
    case 4:
      // 4:6 の比率で Tier2:Tier3
      return [...TIER2_ENEMIES, ...TIER3_ENEMIES, ...TIER3_ENEMIES];
    case 5:
      return TIER3_ENEMIES;
    default:
      return TIER1_ENEMIES;
  }
}

// すべての敵定義を取得
export function getAllEnemies(): EnemyDefinition[] {
  return [...TIER1_ENEMIES, ...TIER2_ENEMIES, ...TIER3_ENEMIES, BOSS_ENEMY];
}
