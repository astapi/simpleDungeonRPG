// ============================================
// UI向けアダプター
// コアロジックの型をUI用に変換
// ============================================

import {
  PlayerState,
  EnemyState,
  BattleState as CoreBattleState,
  BattleEvent,
  BattleEventType,
  Reward as CoreReward,
} from './types';
import { TraitDefinition } from './RewardGenerator';
import {
  Player,
  BattleEnemy,
  BattleLogEntry,
  Reward as UIReward,
  PlayerTrait,
  StatusEffect,
} from '@/types/game';

let logIdCounter = 0;

/**
 * コアのPlayerStateをUI用のPlayerに変換
 */
export function toUIPlayer(corePlayer: PlayerState): Player {
  return {
    hp: corePlayer.hp,
    maxHp: corePlayer.maxHp,
    atk: corePlayer.atk,
    def: corePlayer.def,
    lv: corePlayer.lv,
    exp: corePlayer.exp,
    traits: corePlayer.traits.map((t) => ({
      id: t.id,
      stackCount: t.stackCount,
    })),
    skillCooldown: corePlayer.skillCooldown,
    isGuarding: false,
    statusEffects: corePlayer.statusEffects.map((e) => ({
      type: e.type,
      duration: e.duration,
      value: e.value,
    })),
  };
}

/**
 * コアのEnemyStateをUI用のBattleEnemyに変換
 */
export function toUIEnemy(coreEnemy: EnemyState): BattleEnemy {
  return {
    id: coreEnemy.definition.id,
    name: coreEnemy.definition.name,
    image: coreEnemy.definition.image,
    hp: coreEnemy.definition.hp,
    atk: coreEnemy.definition.atk,
    def: coreEnemy.definition.def,
    tier: coreEnemy.definition.tier,
    actions: coreEnemy.definition.actions,
    exp: coreEnemy.definition.exp,
    currentHp: coreEnemy.currentHp,
    statusEffects: coreEnemy.statusEffects.map((e) => ({
      type: e.type,
      duration: e.duration,
      value: e.value,
    })),
    isDefending: coreEnemy.isDefending,
    buffedAtk: coreEnemy.buffedAtk,
  };
}

/**
 * コアのBattleEventをUI用のBattleLogEntryに変換
 */
export function toUILogEntry(event: BattleEvent): BattleLogEntry {
  const typeMap: Record<BattleEventType, BattleLogEntry['type']> = {
    battle_start: 'system',
    player_attack: 'player',
    player_skill: 'player',
    player_guard: 'player',
    player_damage: 'damage',
    player_heal: 'heal',
    player_status: 'damage',
    enemy_attack: 'enemy',
    enemy_skill: 'enemy',
    enemy_defend: 'enemy',
    enemy_buff: 'enemy',
    enemy_debuff: 'enemy',
    enemy_damage: 'damage',
    enemy_status: 'system',
    critical: 'player',
    double_strike: 'player',
    counter: 'player',
    victory: 'system',
    defeat: 'system',
    level_up: 'system',
  };

  return {
    id: ++logIdCounter,
    message: event.message,
    type: typeMap[event.type] ?? 'system',
  };
}

/**
 * コアのBattleStateをUI用に変換
 */
export function toUIBattleState(coreBattleState: CoreBattleState): {
  phase: 'playerTurn' | 'resolving' | 'enemyTurn' | 'victory' | 'defeat';
  enemy: BattleEnemy;
  playerHp: number;
  playerStatusEffects: StatusEffect[];
  isGuarding: boolean;
  skillCooldown: number;
  log: BattleLogEntry[];
  isFirstTurn: boolean;
} {
  return {
    phase: coreBattleState.phase,
    enemy: toUIEnemy(coreBattleState.enemy),
    playerHp: coreBattleState.player.hp,
    playerStatusEffects: coreBattleState.player.statusEffects.map((e) => ({
      type: e.type,
      duration: e.duration,
      value: e.value,
    })),
    isGuarding: coreBattleState.isPlayerGuarding,
    skillCooldown: coreBattleState.player.skillCooldown,
    log: coreBattleState.events.map(toUILogEntry),
    isFirstTurn: coreBattleState.isFirstTurn,
  };
}

/**
 * コアのRewardをUI用に変換
 */
export function toUIReward(coreReward: CoreReward, traits: TraitDefinition[]): UIReward {
  if (coreReward.type === 'trait') {
    const trait = traits.find((t) => t.id === coreReward.traitId);
    return {
      type: 'trait',
      traitId: coreReward.traitId,
      label: trait?.name ?? 'Unknown',
      description: trait?.description ?? '',
    };
  }

  const labelMap: Record<string, string> = {
    stat_hp: `HP+${coreReward.value}`,
    stat_atk: `ATK+${coreReward.value}`,
    stat_def: `DEF+${coreReward.value}`,
    heal: `HP回復(${coreReward.value})`,
  };

  const descMap: Record<string, string> = {
    stat_hp: `最大HPを${coreReward.value}増加`,
    stat_atk: `攻撃力を${coreReward.value}増加`,
    stat_def: `防御力を${coreReward.value}増加`,
    heal: `HPを${coreReward.value}回復`,
  };

  // Map core reward types to UI reward types
  const typeMap: Record<string, UIReward['type']> = {
    stat_hp: 'statHp',
    stat_atk: 'statAtk',
    stat_def: 'statDef',
    heal: 'heal',
    trait: 'trait',
  };

  return {
    type: typeMap[coreReward.type] ?? 'heal',
    value: coreReward.value,
    label: labelMap[coreReward.type] ?? '',
    description: descMap[coreReward.type] ?? '',
  };
}

/**
 * UI用のPlayerTraitからコア用のTraitDefinitionに変換
 */
export function toCoreTraits(uiTraits: PlayerTrait[], allTraits: TraitDefinition[]): TraitDefinition[] {
  return uiTraits.map((uiTrait) => {
    const traitDef = allTraits.find((t) => t.id === uiTrait.id);
    if (!traitDef) {
      return {
        id: uiTrait.id,
        name: 'Unknown',
        description: '',
        maxStack: 3,
      };
    }
    return traitDef;
  });
}
