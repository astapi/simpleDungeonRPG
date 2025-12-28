import {
  Player,
  BattleEnemy,
  EnemyDefinition,
  StatusEffect,
  PlayerTrait,
  GAME_CONSTANTS,
  EnemyAction,
} from '@/types/game';
import { getTraitById } from '@/data/traits';
import { randomInt, chance, weightedPick } from './random';

// 敵定義から戦闘用敵を生成
export function createBattleEnemy(definition: EnemyDefinition): BattleEnemy {
  return {
    ...definition,
    currentHp: definition.hp,
    statusEffects: [],
    isDefending: false,
    buffedAtk: 0,
  };
}

// プレイヤーの攻撃ダメージ計算
export function calculatePlayerDamage(
  player: Player,
  enemy: BattleEnemy,
  isSkill: boolean = false
): { damage: number; isCrit: boolean } {
  const baseDamage = player.atk;
  const enemyDef = Math.max(0, enemy.def - getArmorBreakAmount(player));

  // 基本ダメージ計算
  let damage = Math.max(1, baseDamage - enemyDef) + randomInt(-1, 2);

  // スキル倍率
  if (isSkill) {
    damage = Math.floor(damage * GAME_CONSTANTS.SKILL_MULTIPLIER);
  }

  // クリティカル判定
  const critChance = GAME_CONSTANTS.CRIT_CHANCE + getCritBonus(player);
  const isCrit = chance(critChance);

  if (isCrit) {
    damage = Math.floor(damage * GAME_CONSTANTS.CRIT_MULTIPLIER);
  }

  // 敵が防御中なら軽減
  if (enemy.isDefending) {
    damage = Math.floor(damage * 0.5);
  }

  return { damage: Math.max(1, damage), isCrit };
}

// 敵の攻撃ダメージ計算
export function calculateEnemyDamage(
  enemy: BattleEnemy,
  player: Player,
  action: EnemyAction
): number {
  let baseDamage = action.damage ?? enemy.atk + enemy.buffedAtk;
  const playerDef = player.def + getDefBonus(player);

  let damage = Math.max(1, baseDamage - playerDef) + randomInt(-1, 1);

  // プレイヤーがガード中
  if (player.isGuarding) {
    damage = Math.floor(damage * GAME_CONSTANTS.GUARD_REDUCTION);
    damage = Math.max(0, damage - GAME_CONSTANTS.GUARD_FLAT_REDUCTION);
    damage -= getGuardBonus(player);
  }

  return Math.max(0, damage);
}

// 破甲量を取得
function getArmorBreakAmount(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'armor_break');
  if (!trait) return 0;
  return Math.min(5, trait.stackCount);
}

// クリティカルボーナスを取得
function getCritBonus(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'crit_up');
  if (!trait) return 0;
  return trait.stackCount * 0.1;
}

// DEFボーナスを取得
function getDefBonus(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'iron_skin');
  if (!trait) return 0;
  return trait.stackCount;
}

// ガードボーナスを取得
function getGuardBonus(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'guard_up');
  if (!trait) return 0;
  return trait.stackCount * 2;
}

// ATKボーナスを取得
export function getAtkBonus(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'power_up');
  if (!trait) return 0;
  return trait.stackCount * 2;
}

// 連撃判定
export function shouldDoubleStrike(player: Player): boolean {
  const trait = player.traits.find((t) => t.id === 'double_strike');
  if (!trait) return false;
  const baseChance = 0.3 + (trait.stackCount - 1) * 0.1;
  return chance(baseChance);
}

// 吸収量を計算
export function calculateLifesteal(player: Player, damage: number): number {
  const trait = player.traits.find((t) => t.id === 'lifesteal');
  if (!trait) return 0;
  const percent = 0.1 + (trait.stackCount - 1) * 0.05;
  return Math.floor(damage * percent);
}

// 自然治癒量を取得
export function getRegenAmount(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'regeneration');
  if (!trait) return 0;
  return trait.stackCount * 2;
}

// 反撃ダメージを計算
export function calculateCounterDamage(player: Player): number {
  const trait = player.traits.find((t) => t.id === 'counter');
  if (!trait) return 0;
  return Math.floor(player.atk * 0.5 * trait.stackCount);
}

// 先制特性を持っているか
export function hasFirstStrike(player: Player): boolean {
  return player.traits.some((t) => t.id === 'first_strike');
}

// 毒刃を持っているか
export function hasPoisonBlade(player: Player): boolean {
  return player.traits.some((t) => t.id === 'poison_blade');
}

// 炎撃を持っているか
export function hasBurnStrike(player: Player): boolean {
  return player.traits.some((t) => t.id === 'burn_strike');
}

// 状態異常ダメージを処理
export function processStatusEffects(effects: StatusEffect[]): {
  damage: number;
  remaining: StatusEffect[];
} {
  let totalDamage = 0;
  const remaining: StatusEffect[] = [];

  for (const effect of effects) {
    if (effect.type === 'poison' || effect.type === 'burn') {
      totalDamage += effect.value;
    }

    const newDuration = effect.duration - 1;
    if (newDuration > 0) {
      remaining.push({ ...effect, duration: newDuration });
    }
  }

  return { damage: totalDamage, remaining };
}

// 状態異常を追加
export function addStatusEffect(
  effects: StatusEffect[],
  newEffect: StatusEffect
): StatusEffect[] {
  const existing = effects.find((e) => e.type === newEffect.type);
  if (existing) {
    // 既存の効果を更新（より長い方を採用）
    return effects.map((e) =>
      e.type === newEffect.type
        ? { ...e, duration: Math.max(e.duration, newEffect.duration) }
        : e
    );
  }
  return [...effects, newEffect];
}

// 敵の行動を選択
export function selectEnemyAction(enemy: BattleEnemy): EnemyAction {
  return weightedPick(enemy.actions);
}

// 特性を追加（スタック処理）
export function addTrait(
  traits: PlayerTrait[],
  traitId: string
): { traits: PlayerTrait[]; added: boolean } {
  const definition = getTraitById(traitId);
  if (!definition) {
    return { traits, added: false };
  }

  const existing = traits.find((t) => t.id === traitId);

  if (existing) {
    // スタック追加
    if (existing.stackCount >= definition.maxStack) {
      return { traits, added: false };
    }
    return {
      traits: traits.map((t) =>
        t.id === traitId ? { ...t, stackCount: t.stackCount + 1 } : t
      ),
      added: true,
    };
  }

  // 新規追加（最大6個まで）
  if (traits.length >= GAME_CONSTANTS.MAX_TRAITS) {
    return { traits, added: false };
  }

  return {
    traits: [...traits, { id: traitId, stackCount: 1 }],
    added: true,
  };
}

// レベルアップ判定
export function checkLevelUp(exp: number, currentLevel: number): boolean {
  return exp >= currentLevel * GAME_CONSTANTS.EXP_PER_LEVEL;
}

// レベルアップ後のEXP
export function getExpAfterLevelUp(exp: number, currentLevel: number): number {
  return exp - currentLevel * GAME_CONSTANTS.EXP_PER_LEVEL;
}
