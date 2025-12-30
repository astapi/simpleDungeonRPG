// ============================================
// 敵選出ロジック
// ============================================

import { EnemyDefinition, EnemyState, GameConfig, DEFAULT_CONFIG } from './types';
import { dataLoader } from './DataLoader';

/**
 * 敵選出クラス
 */
export class EnemySelector {
  private config: GameConfig;
  private tier1: EnemyDefinition[];
  private tier2: EnemyDefinition[];
  private tier3: EnemyDefinition[];
  private boss: EnemyDefinition;

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    // DataLoaderから敵データを取得
    this.tier1 = dataLoader.getEnemiesByTier(1);
    this.tier2 = dataLoader.getEnemiesByTier(2);
    this.tier3 = dataLoader.getEnemiesByTier(3);
    this.boss = dataLoader.getBoss();
  }

  /**
   * 階層ごとの敵プールを取得
   */
  getEnemyPool(floor: number): EnemyDefinition[] {
    switch (floor) {
      case 1:
        return this.tier1;
      case 2:
        // 7:3 の比率で Tier1:Tier2
        return [...this.tier1, ...this.tier1, ...this.tier2];
      case 3:
        return this.tier2;
      case 4:
        // 4:6 の比率で Tier2:Tier3
        return [...this.tier2, ...this.tier3, ...this.tier3];
      case 5:
        return this.tier3;
      default:
        return this.tier1;
    }
  }

  /**
   * ボスかどうか判定
   */
  isBossBattle(floor: number, battleCount: number): boolean {
    return (
      floor === this.config.maxFloors &&
      battleCount === this.config.battlesPerFloor
    );
  }

  /**
   * 敵を選出
   */
  selectEnemy(floor: number, battleCount: number): EnemyDefinition {
    if (this.isBossBattle(floor, battleCount)) {
      return this.boss;
    }
    const pool = this.getEnemyPool(floor);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * 敵定義から戦闘用状態を生成
   */
  createEnemyState(definition: EnemyDefinition): EnemyState {
    return {
      definition,
      currentHp: definition.hp,
      statusEffects: [],
      isDefending: false,
      buffedAtk: 0,
    };
  }

  /**
   * 敵を選出して戦闘用状態を返す
   */
  spawnEnemy(floor: number, battleCount: number): EnemyState {
    const definition = this.selectEnemy(floor, battleCount);
    return this.createEnemyState(definition);
  }
}

// シングルトンエクスポート
export const enemySelector = new EnemySelector();

// 全敵データエクスポート（テスト用）
export const ALL_ENEMIES = {
  tier1: dataLoader.getEnemiesByTier(1),
  tier2: dataLoader.getEnemiesByTier(2),
  tier3: dataLoader.getEnemiesByTier(3),
  boss: dataLoader.getBoss(),
};
