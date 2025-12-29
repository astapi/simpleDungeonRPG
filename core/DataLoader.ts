// ============================================
// ゲームデータローダー
// JSONからゲームデータを読み込み
// ============================================

import {
  GameConfig,
  EnemyDefinition,
  EnemyAction,
  Reward,
  PlayerState,
  DEFAULT_CONFIG,
  INITIAL_PLAYER,
} from './types';

// JSONデータの型定義
export interface TraitData {
  id: string;
  name: string;
  description: string;
  maxStack: number;
  category?: string;
}

export interface StatRewardData {
  type: 'statHp' | 'statAtk' | 'statDef';
  value: number;
  label: string;
  description: string;
}

export interface EnemyData {
  id: string;
  name: string;
  image?: string;
  hp: number;
  atk: number;
  def: number;
  exp: number;
  actions: EnemyAction[];
}

export interface GameDataJson {
  traits: TraitData[];
  statRewards: StatRewardData[];
  enemies: {
    tier1: EnemyData[];
    tier2: EnemyData[];
    tier3: EnemyData[];
    boss: EnemyData;
  };
  config: Partial<GameConfig>;
  initialPlayer: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    lv: number;
    exp: number;
  };
}

// デフォルトのゲームデータ
import gameDataJson from '../data/game-data.json';

/**
 * ゲームデータローダークラス
 */
export class DataLoader {
  private data: GameDataJson;

  constructor(customData?: Partial<GameDataJson>) {
    this.data = {
      ...gameDataJson,
      ...customData,
    } as GameDataJson;
  }

  /**
   * 全特性データを取得
   */
  getTraits(): TraitData[] {
    return this.data.traits;
  }

  /**
   * 特性IDから特性データを取得
   */
  getTraitById(id: string): TraitData | undefined {
    return this.data.traits.find((t) => t.id === id);
  }

  /**
   * カテゴリ別に特性を取得
   */
  getTraitsByCategory(category: string): TraitData[] {
    return this.data.traits.filter((t) => t.category === category);
  }

  /**
   * ステータス報酬オプションを取得
   */
  getStatRewards(): StatRewardData[] {
    return this.data.statRewards;
  }

  /**
   * ランダムなステータス報酬を取得
   * ATKの出現率を高く（70%ATK / 30%DEF）
   */
  getRandomStatReward(): Reward {
    const rewards = this.data.statRewards;
    // ATKを70%、DEFを30%の確率で選択
    const atkReward = rewards.find(r => r.type === 'statAtk');
    const defReward = rewards.find(r => r.type === 'statDef');

    const reward = Math.random() < 0.7
      ? (atkReward ?? rewards[0])
      : (defReward ?? rewards[0]);

    return {
      type: reward.type,
      value: reward.value,
      label: reward.label,
      description: reward.description,
    };
  }

  /**
   * Tier別の敵リストを取得
   */
  getEnemiesByTier(tier: 1 | 2 | 3): EnemyDefinition[] {
    const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3';
    return this.data.enemies[tierKey].map((e) => ({
      ...e,
      tier,
    }));
  }

  /**
   * ボスデータを取得
   */
  getBoss(): EnemyDefinition {
    return {
      ...this.data.enemies.boss,
      tier: 'boss' as const,
    };
  }

  /**
   * 全敵データを取得
   */
  getAllEnemies(): EnemyDefinition[] {
    return [
      ...this.getEnemiesByTier(1),
      ...this.getEnemiesByTier(2),
      ...this.getEnemiesByTier(3),
      this.getBoss(),
    ];
  }

  /**
   * ゲーム設定を取得
   */
  getConfig(): GameConfig {
    return {
      ...DEFAULT_CONFIG,
      ...this.data.config,
    };
  }

  /**
   * 初期プレイヤー状態を取得
   */
  getInitialPlayer(): PlayerState {
    return {
      ...INITIAL_PLAYER,
      hp: this.data.initialPlayer.hp,
      maxHp: this.data.initialPlayer.maxHp,
      atk: this.data.initialPlayer.atk,
      def: this.data.initialPlayer.def,
      lv: this.data.initialPlayer.lv,
      exp: this.data.initialPlayer.exp,
    };
  }

  /**
   * 生のJSONデータを取得（デバッグ用）
   */
  getRawData(): GameDataJson {
    return this.data;
  }
}

// デフォルトローダー（シングルトン）
export const dataLoader = new DataLoader();

// 便利なエクスポート
export const GAME_DATA = gameDataJson as GameDataJson;
