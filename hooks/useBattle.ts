import { useReducer, useCallback, useEffect } from 'react';
import {
  BattleEnemy,
  BattleLogEntry,
  PlayerAction,
  StatusEffect,
  Player,
  Reward,
  GAME_CONSTANTS,
  EnemyDefinition,
} from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { getRandomTraits } from '@/data/traits';
import { randomPick } from '@/utils/random';
import {
  createBattleEnemy,
  calculatePlayerDamage,
  calculateEnemyDamage,
  selectEnemyAction,
  processStatusEffects,
  addStatusEffect,
  shouldDoubleStrike,
  calculateLifesteal,
  getRegenAmount,
  calculateCounterDamage,
  hasFirstStrike,
  hasPoisonBlade,
  hasBurnStrike,
  getAtkBonus,
} from '@/utils/battle';

// バトルローカル状態
interface BattleState {
  phase: 'playerTurn' | 'resolving' | 'enemyTurn' | 'victory' | 'defeat';
  enemy: BattleEnemy;
  playerHp: number;
  playerStatusEffects: StatusEffect[];
  isGuarding: boolean;
  skillCooldown: number;
  log: BattleLogEntry[];
  isFirstTurn: boolean;
}

// バトルアクション
type BattleAction =
  | { type: 'PLAYER_ATTACK'; isSkill: boolean }
  | { type: 'PLAYER_GUARD' }
  | { type: 'ENEMY_TURN' }
  | { type: 'ADD_LOG'; message: string; logType: BattleLogEntry['type'] };

let logIdCounter = 0;

function addLog(
  state: BattleState,
  message: string,
  type: BattleLogEntry['type']
): BattleState {
  const newLog: BattleLogEntry = {
    id: ++logIdCounter,
    message,
    type,
  };
  return {
    ...state,
    log: [...state.log.slice(-50), newLog],
  };
}

function createBattleReducer(player: Player) {
  return function battleReducer(state: BattleState, action: BattleAction): BattleState {
    switch (action.type) {
      case 'PLAYER_ATTACK': {
        if (state.phase !== 'playerTurn') return state;

        let newState: BattleState = { ...state, phase: 'resolving', isFirstTurn: false };
        let enemy = { ...state.enemy };

        // ATKボーナスを適用
        const atkBonus = getAtkBonus(player);
        const effectivePlayer = { ...player, atk: player.atk + atkBonus };

        // 先制特性の判定（最初のターンのみ）
        const forceFirstCrit = state.isFirstTurn && hasFirstStrike(player);

        // ダメージ計算
        let { damage, isCrit } = calculatePlayerDamage(effectivePlayer, enemy, action.isSkill);
        if (forceFirstCrit && !isCrit) {
          isCrit = true;
          damage = Math.floor(damage * GAME_CONSTANTS.CRIT_MULTIPLIER);
        }

        // ダメージ適用
        enemy.currentHp = Math.max(0, enemy.currentHp - damage);

        // ログ追加
        const actionName = action.isSkill ? 'パワーストライク' : '攻撃';
        const critText = isCrit ? '【クリティカル!】' : '';
        newState = addLog(newState, `${critText}${actionName}で${damage}ダメージ!`, 'player');

        // スキルクールダウン設定
        if (action.isSkill) {
          newState.skillCooldown = GAME_CONSTANTS.SKILL_COOLDOWN;

          // 破甲効果（スキル使用時）
          const armorBreakEffect: StatusEffect = {
            type: 'armorBreak',
            duration: 2,
            value: 1,
          };
          enemy.statusEffects = addStatusEffect(enemy.statusEffects, armorBreakEffect);
          newState = addLog(newState, '敵の防御力が低下!', 'system');
        }

        // 毒刃効果
        if (hasPoisonBlade(player)) {
          const poisonTrait = player.traits.find((t) => t.id === 'poison_blade');
          const poisonValue = poisonTrait ? poisonTrait.stackCount * 2 : 2;
          enemy.statusEffects = addStatusEffect(enemy.statusEffects, {
            type: 'poison',
            duration: 3,
            value: poisonValue,
          });
          newState = addLog(newState, '毒を付与!', 'system');
        }

        // 炎撃効果
        if (hasBurnStrike(player)) {
          const burnTrait = player.traits.find((t) => t.id === 'burn_strike');
          const burnValue = burnTrait ? burnTrait.stackCount * 3 : 3;
          enemy.statusEffects = addStatusEffect(enemy.statusEffects, {
            type: 'burn',
            duration: 2,
            value: burnValue,
          });
          newState = addLog(newState, '火傷を付与!', 'system');
        }

        // 吸収効果
        const lifesteal = calculateLifesteal(player, damage);
        if (lifesteal > 0) {
          newState.playerHp = Math.min(player.maxHp, newState.playerHp + lifesteal);
          newState = addLog(newState, `${lifesteal}HP吸収!`, 'heal');
        }

        // 連撃判定
        if (!action.isSkill && shouldDoubleStrike(player)) {
          const { damage: extraDamage } = calculatePlayerDamage(effectivePlayer, enemy, false);
          enemy.currentHp = Math.max(0, enemy.currentHp - extraDamage);
          newState = addLog(newState, `連撃! 追加で${extraDamage}ダメージ!`, 'player');
        }

        newState.enemy = enemy;

        // 勝利判定
        if (enemy.currentHp <= 0) {
          newState = addLog(newState, `${enemy.name}を倒した!`, 'system');
          newState.phase = 'victory';
          return newState;
        }

        // 敵ターンへ
        newState.phase = 'enemyTurn';
        return newState;
      }

      case 'PLAYER_GUARD': {
        if (state.phase !== 'playerTurn') return state;

        let newState: BattleState = {
          ...state,
          phase: 'enemyTurn',
          isGuarding: true,
          isFirstTurn: false,
        };
        newState = addLog(newState, 'ガード態勢!', 'player');
        return newState;
      }

      case 'ENEMY_TURN': {
        if (state.phase !== 'enemyTurn') return state;

        let newState: BattleState = { ...state };
        let enemy = { ...state.enemy };
        let playerHp = state.playerHp;
        let playerStatusEffects = [...state.playerStatusEffects];

        // 敵の状態異常処理
        const { damage: statusDamage, remaining: enemyRemainingEffects } = processStatusEffects(
          enemy.statusEffects
        );
        if (statusDamage > 0) {
          enemy.currentHp = Math.max(0, enemy.currentHp - statusDamage);
          newState = addLog(newState, `敵が状態異常で${statusDamage}ダメージ!`, 'damage');
        }
        enemy.statusEffects = enemyRemainingEffects;
        enemy.isDefending = false;

        // 敵が倒れたかチェック
        if (enemy.currentHp <= 0) {
          newState = addLog(newState, `${enemy.name}を倒した!`, 'system');
          newState.enemy = enemy;
          newState.phase = 'victory';
          return newState;
        }

        // 敵の行動選択
        const action = selectEnemyAction(enemy);
        const tempPlayer: Player = {
          ...player,
          hp: playerHp,
          isGuarding: state.isGuarding,
          statusEffects: playerStatusEffects,
        };

        switch (action.type) {
          case 'attack':
          case 'strongAttack': {
            const damage = calculateEnemyDamage(enemy, tempPlayer, action);
            playerHp = Math.max(0, playerHp - damage);
            const attackName = action.type === 'strongAttack' ? '強攻撃' : '攻撃';
            newState = addLog(
              newState,
              `${enemy.name}の${attackName}! ${damage}ダメージ!`,
              'enemy'
            );

            // 反撃判定（ガード中のみ）
            if (state.isGuarding) {
              const counterDamage = calculateCounterDamage(player);
              if (counterDamage > 0) {
                enemy.currentHp = Math.max(0, enemy.currentHp - counterDamage);
                newState = addLog(newState, `反撃! ${counterDamage}ダメージ!`, 'player');
              }
            }
            break;
          }
          case 'defend':
            enemy.isDefending = true;
            newState = addLog(newState, `${enemy.name}は防御態勢!`, 'enemy');
            break;
          case 'buff':
            enemy.buffedAtk += 3;
            newState = addLog(newState, `${enemy.name}の攻撃力が上昇!`, 'enemy');
            break;
          case 'debuff':
            if (action.effect === 'poison') {
              playerStatusEffects = addStatusEffect(playerStatusEffects, {
                type: 'poison',
                duration: 3,
                value: 2,
              });
              newState = addLog(newState, `${enemy.name}が毒を付与!`, 'enemy');
            } else if (action.effect === 'burn') {
              playerStatusEffects = addStatusEffect(playerStatusEffects, {
                type: 'burn',
                duration: 2,
                value: 3,
              });
              newState = addLog(newState, `${enemy.name}が火傷を付与!`, 'enemy');
            }
            break;
        }

        // プレイヤーの状態異常処理
        const { damage: playerStatusDamage, remaining: playerRemainingEffects } =
          processStatusEffects(playerStatusEffects);
        if (playerStatusDamage > 0) {
          playerHp = Math.max(0, playerHp - playerStatusDamage);
          newState = addLog(newState, `状態異常で${playerStatusDamage}ダメージ!`, 'damage');
        }
        playerStatusEffects = playerRemainingEffects;

        // 自然治癒
        const regenAmount = getRegenAmount(player);
        if (regenAmount > 0) {
          playerHp = Math.min(player.maxHp, playerHp + regenAmount);
          newState = addLog(newState, `自然治癒で${regenAmount}HP回復!`, 'heal');
        }

        // スキルクールダウン減少
        let skillCooldown = state.skillCooldown;
        if (skillCooldown > 0) {
          skillCooldown--;
        }

        newState.enemy = enemy;
        newState.playerHp = playerHp;
        newState.playerStatusEffects = playerStatusEffects;
        newState.isGuarding = false;
        newState.skillCooldown = skillCooldown;

        // 敗北判定
        if (playerHp <= 0) {
          newState.phase = 'defeat';
          return newState;
        }

        // 敵撃破判定（状態異常で倒れた場合）
        if (enemy.currentHp <= 0) {
          newState = addLog(newState, `${enemy.name}を倒した!`, 'system');
          newState.phase = 'victory';
          return newState;
        }

        // プレイヤーターンへ
        newState.phase = 'playerTurn';
        return newState;
      }

      case 'ADD_LOG':
        return addLog(state, action.message, action.logType);

      default:
        return state;
    }
  };
}

// 報酬生成関数
export function generateRewards(player: Player): Reward[] {
  const rewards: Reward[] = [];

  // 特性獲得
  const availableTraits = getRandomTraits(3, []);
  if (availableTraits.length > 0) {
    const trait = availableTraits[0];
    rewards.push({
      type: 'trait',
      traitId: trait.id,
      label: trait.name,
      description: trait.description,
    });
  }

  // ステータス強化
  const statOptions: Reward[] = [
    { type: 'statHp', value: 8, label: 'HP+8', description: '最大HPを8増加' },
    { type: 'statAtk', value: 2, label: 'ATK+2', description: '攻撃力を2増加' },
    { type: 'statDef', value: 1, label: 'DEF+1', description: '防御力を1増加' },
  ];
  rewards.push(randomPick(statOptions));

  // 回復
  const healAmount = Math.floor(player.maxHp * GAME_CONSTANTS.HEAL_PERCENT);
  rewards.push({
    type: 'heal',
    value: healAmount,
    label: `HP回復(${healAmount})`,
    description: `HPを${healAmount}回復`,
  });

  return rewards;
}

// バトルフック
export function useBattle(enemyDef: EnemyDefinition) {
  const player = useGameStore((state) => state.player);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const addExp = useGameStore((state) => state.addExp);

  const enemy = createBattleEnemy(enemyDef);

  const initialState: BattleState = {
    phase: 'playerTurn',
    enemy,
    playerHp: player.hp,
    playerStatusEffects: [...player.statusEffects],
    isGuarding: false,
    skillCooldown: player.skillCooldown,
    log: [{ id: ++logIdCounter, message: `${enemy.name}が現れた!`, type: 'system' }],
    isFirstTurn: true,
  };

  const reducer = createBattleReducer(player);
  const [state, dispatch] = useReducer(reducer, initialState);

  // バトル終了時にグローバル状態に反映
  useEffect(() => {
    if (state.phase === 'victory' || state.phase === 'defeat') {
      updatePlayer({
        hp: state.playerHp,
        statusEffects: state.playerStatusEffects,
        skillCooldown: state.skillCooldown,
      });

      if (state.phase === 'victory') {
        addExp(state.enemy.exp);
      }
    }
  }, [state.phase]);

  const attack = useCallback(() => {
    dispatch({ type: 'PLAYER_ATTACK', isSkill: false });
  }, []);

  const skill = useCallback(() => {
    if (state.skillCooldown > 0) return;
    dispatch({ type: 'PLAYER_ATTACK', isSkill: true });
  }, [state.skillCooldown]);

  const guard = useCallback(() => {
    dispatch({ type: 'PLAYER_GUARD' });
  }, []);

  const enemyTurn = useCallback(() => {
    dispatch({ type: 'ENEMY_TURN' });
  }, []);

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
