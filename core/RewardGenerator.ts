// ============================================
// 報酬生成ロジック
// ============================================

import { Reward, PlayerState, GameConfig, DEFAULT_CONFIG } from './types';
import { dataLoader, TraitData } from './DataLoader';

// 特性定義（DataLoaderから取得）
export interface TraitDefinition extends TraitData {}

// 全特性データ（DataLoaderから取得）
export const TRAITS: TraitDefinition[] = dataLoader.getTraits();

/**
 * 報酬生成クラス
 */
export class RewardGenerator {
  private config: GameConfig;
  private traits: TraitDefinition[];

  constructor(config: GameConfig = DEFAULT_CONFIG, customTraits?: TraitDefinition[]) {
    this.config = config;
    this.traits = customTraits ?? dataLoader.getTraits();
  }

  /**
   * 特性IDから定義を取得
   */
  getTraitById(id: string): TraitDefinition | undefined {
    return this.traits.find((t) => t.id === id);
  }

  /**
   * ランダムな特性を取得（重複考慮）
   */
  getRandomTraits(count: number, excludeIds: string[] = []): TraitDefinition[] {
    const available = this.traits.filter((t) => !excludeIds.includes(t.id));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, available.length));
  }

  /**
   * 報酬選択肢を生成
   */
  generateRewards(player: PlayerState): Reward[] {
    const rewards: Reward[] = [];

    // スタック上限に達した特性を除外リストに追加
    const maxedTraitIds = player.traits
      .filter(pt => {
        const def = this.getTraitById(pt.id);
        return def && pt.stackCount >= def.maxStack;
      })
      .map(pt => pt.id);

    // 特性獲得（ランダム1つ、スタック上限の特性を除外）
    const traits = this.getRandomTraits(1, maxedTraitIds);
    if (traits.length > 0) {
      const trait = traits[0];
      rewards.push({
        type: 'trait',
        traitId: trait.id,
        label: trait.name,
        description: trait.description,
      });
    }

    // ステータス強化（DataLoaderから取得）
    rewards.push(dataLoader.getRandomStatReward());

    // 回復（全回復）
    const healAmount = player.maxHp - player.hp;
    rewards.push({
      type: 'heal',
      value: healAmount,
      label: 'HP全回復',
      description: `HPを全回復（${healAmount}回復）`,
    });

    return rewards;
  }

  /**
   * 報酬をプレイヤーに適用
   */
  applyReward(player: PlayerState, reward: Reward): PlayerState {
    const newPlayer = { ...player };

    switch (reward.type) {
      case 'trait':
        if (reward.traitId) {
          newPlayer.traits = this.addTrait(player.traits, reward.traitId);
        }
        break;
      case 'statHp':
        newPlayer.maxHp += reward.value ?? 0;
        newPlayer.hp += reward.value ?? 0;
        break;
      case 'statAtk':
        newPlayer.atk += reward.value ?? 0;
        break;
      case 'statDef':
        newPlayer.def += reward.value ?? 0;
        break;
      case 'heal':
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + (reward.value ?? 0));
        break;
    }

    return newPlayer;
  }

  /**
   * 特性を追加（スタック処理）
   */
  addTrait(
    traits: PlayerState['traits'],
    traitId: string
  ): PlayerState['traits'] {
    const definition = this.getTraitById(traitId);
    if (!definition) return traits;

    const existingIndex = traits.findIndex((t) => t.id === traitId);

    if (existingIndex >= 0) {
      const existing = traits[existingIndex];
      if (existing.stackCount >= definition.maxStack) {
        return traits; // スタック上限
      }
      const newTraits = [...traits];
      newTraits[existingIndex] = {
        ...existing,
        stackCount: existing.stackCount + 1,
      };
      return newTraits;
    }

    // 新規追加（最大数チェック）
    if (traits.length >= this.config.maxTraits) {
      return traits;
    }

    return [...traits, { id: traitId, stackCount: 1 }];
  }

  /**
   * シミュレーション用：最適な報酬を自動選択
   */
  selectBestReward(player: PlayerState, rewards: Reward[], strategy: 'balanced' | 'stat_only' | 'trait_only' = 'balanced'): Reward {
    const hpRatio = player.hp / player.maxHp;

    // HPが低い時は回復優先
    if (hpRatio < 0.4) {
      const healReward = rewards.find((r) => r.type === 'heal');
      if (healReward) return healReward;
    }

    const traitReward = rewards.find((r) => r.type === 'trait');
    const statReward = rewards.find(
      (r) => r.type === 'statAtk' || r.type === 'statDef'
    );

    // ステータスのみ戦略
    if (strategy === 'stat_only') {
      if (statReward) return statReward;
      if (traitReward) return traitReward;
      return rewards[0];
    }

    // 特性のみ戦略
    if (strategy === 'trait_only') {
      if (traitReward) return traitReward;
      if (statReward) return statReward;
      return rewards[0];
    }

    // バランス戦略（特性とステータスを50%ずつ）
    if (traitReward && statReward) {
      const traitCount = player.traits.length;
      const statPriority = traitCount >= 4 ? 0.7 : 0.5;

      if (Math.random() < statPriority) {
        return statReward;
      }
      return traitReward;
    }

    if (traitReward) return traitReward;
    if (statReward) return statReward;

    return rewards[0];
  }
}

// シングルトンエクスポート
export const rewardGenerator = new RewardGenerator();
