import { useCallback, useState, useEffect } from 'react';
import {
  BattleLogEntry,
  PlayerAction,
  Player,
  Reward,
  EnemyDefinition,
} from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import {
  BattleEngine,
  PlayerState,
  EnemyState,
  PlayerCommand,
  TRAITS,
  TraitDefinition,
} from '@/core';
import { toUIBattleState, toUIReward } from '@/core/ui-adapters';

// UI用のバトル状態
interface UIBattleState {
  phase: 'playerTurn' | 'resolving' | 'enemyTurn' | 'victory' | 'defeat';
  enemy: ReturnType<typeof toUIBattleState>['enemy'];
  playerHp: number;
  playerStatusEffects: ReturnType<typeof toUIBattleState>['playerStatusEffects'];
  isGuarding: boolean;
  skillCooldown: number;
  log: BattleLogEntry[];
  isFirstTurn: boolean;
}

/**
 * UI用のPlayerをコアのPlayerStateに変換
 */
function toCorePlayer(player: Player): PlayerState {
  return {
    hp: player.hp,
    maxHp: player.maxHp,
    atk: player.atk,
    def: player.def,
    lv: player.lv,
    exp: player.exp,
    traits: player.traits.map((t) => ({
      id: t.id,
      stackCount: t.stackCount,
    })),
    skillCooldown: player.skillCooldown,
    statusEffects: player.statusEffects.map((e) => ({
      type: e.type,
      duration: e.duration,
      value: e.value,
    })),
  };
}

/**
 * EnemyDefinitionをコアのEnemyStateに変換
 */
function toCoreEnemy(enemyDef: EnemyDefinition): EnemyState {
  return {
    definition: {
      id: enemyDef.id,
      name: enemyDef.name,
      image: enemyDef.image,
      hp: enemyDef.hp,
      atk: enemyDef.atk,
      def: enemyDef.def,
      tier: enemyDef.tier,
      actions: enemyDef.actions,
      exp: enemyDef.exp,
    },
    currentHp: enemyDef.hp,
    statusEffects: [],
    isDefending: false,
    buffedAtk: 0,
  };
}

/**
 * 報酬生成関数（コアロジックを使用）
 */
export function generateRewards(player: Player): Reward[] {
  // コアのRewardGeneratorと同等のロジック
  const rewards: Reward[] = [];

  // 特性獲得 - ランダムに1つ選択
  const ownedIds = new Set(player.traits.map((t) => t.id));
  const available = TRAITS.filter((t) => {
    const owned = player.traits.find((pt) => pt.id === t.id);
    if (!owned) return true;
    return owned.stackCount < t.maxStack;
  });

  if (available.length > 0) {
    const randomTrait = available[Math.floor(Math.random() * available.length)];
    rewards.push({
      type: 'trait',
      traitId: randomTrait.id,
      label: randomTrait.name,
      description: randomTrait.description,
    });
  }

  // ステータス強化 - ATK70% / DEF30%の確率で選択
  const statReward = Math.random() < 0.7
    ? { type: 'statAtk' as const, value: 3, label: 'ATK+3', description: '攻撃力を3増加' }
    : { type: 'statDef' as const, value: 3, label: 'DEF+3', description: '防御力を3増加' };
  rewards.push(statReward);

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
 * バトルフック - BattleEngineを使用
 */
export function useBattle(enemyDef: EnemyDefinition) {
  const player = useGameStore((state) => state.player);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const levelUp = useGameStore((state) => state.levelUp);

  // BattleEngineインスタンス
  const [engine] = useState(() => {
    const corePlayer = toCorePlayer(player);
    const coreEnemy = toCoreEnemy(enemyDef);
    return new BattleEngine(corePlayer, coreEnemy, { enableLogging: true });
  });

  // UI用の状態
  const [state, setState] = useState<UIBattleState>(() =>
    toUIBattleState(engine.getState())
  );

  // 状態を更新する関数
  const updateState = useCallback(() => {
    setState(toUIBattleState(engine.getState()));
  }, [engine]);

  // バトル終了時にグローバル状態に反映
  useEffect(() => {
    if (state.phase === 'victory' || state.phase === 'defeat') {
      const battleState = engine.getState();
      updatePlayer({
        hp: battleState.player.hp,
        statusEffects: battleState.player.statusEffects.map((e) => ({
          type: e.type,
          duration: e.duration,
          value: e.value,
        })),
        skillCooldown: battleState.player.skillCooldown,
      });

      // 勝利したらレベルアップ
      if (state.phase === 'victory') {
        levelUp();
      }
    }
  }, [state.phase, engine, updatePlayer, levelUp]);

  // プレイヤー攻撃
  const attack = useCallback(() => {
    engine.executePlayerCommand('attack');
    updateState();
  }, [engine, updateState]);

  // プレイヤースキル
  const skill = useCallback(() => {
    if (state.skillCooldown > 0) return;
    engine.executePlayerCommand('skill');
    updateState();
  }, [engine, updateState, state.skillCooldown]);

  // プレイヤーガード
  const guard = useCallback(() => {
    engine.executePlayerCommand('guard');
    updateState();
  }, [engine, updateState]);

  // 敵ターン
  const enemyTurn = useCallback(() => {
    engine.executeEnemyTurn();
    updateState();
  }, [engine, updateState]);

  // プレイヤーアクション
  const playerAction = useCallback(
    (action: PlayerAction) => {
      switch (action) {
        case 'attack':
          attack();
          break;
        case 'skill':
          skill();
          break;
        case 'guard':
          guard();
          break;
      }
    },
    [attack, skill, guard]
  );

  return {
    state,
    playerAction,
    enemyTurn,
    player,
    enemy: state.enemy,
  };
}
