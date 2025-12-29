// ステータス効果の種類
export type StatusEffectType = 'poison' | 'burn' | 'armorBreak';

// ステータス効果
export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value: number;
}

// 特性の発動タイミング
export type TraitTrigger =
  | 'onBattleStart'
  | 'onHit'
  | 'onCrit'
  | 'onDamaged'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'onGuard';

// 特性定義（データ用）
export interface TraitDefinition {
  id: string;
  name: string;
  description: string;
  maxStack: number;
  trigger: TraitTrigger;
}

// プレイヤーが所持する特性
export interface PlayerTrait {
  id: string;
  stackCount: number;
}

// プレイヤー
export interface Player {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  lv: number;
  exp: number;
  traits: PlayerTrait[];
  skillCooldown: number;
  isGuarding: boolean;
  statusEffects: StatusEffect[];
}

// 敵の行動種類
export type EnemyActionType = 'attack' | 'strongAttack' | 'defend' | 'buff' | 'debuff';

// 敵の行動
export interface EnemyAction {
  type: EnemyActionType;
  weight: number;
  damage?: number;
  effect?: StatusEffectType;
}

// 敵定義（データ用）
export interface EnemyDefinition {
  id: string;
  name: string;
  image?: string;
  hp: number;
  atk: number;
  def: number;
  tier: 1 | 2 | 3 | 'boss';
  actions: EnemyAction[];
  exp: number;
}

// 戦闘中の敵
export interface BattleEnemy extends EnemyDefinition {
  currentHp: number;
  statusEffects: StatusEffect[];
  isDefending: boolean;
  buffedAtk: number;
}

// 戦闘フェーズ
export type BattlePhase = 'playerTurn' | 'resolving' | 'enemyTurn' | 'result';

// ゲームフェーズ
export type GamePhase = 'title' | 'battle' | 'reward' | 'result';

// 戦闘ログエントリ
export interface BattleLogEntry {
  id: number;
  message: string;
  type: 'player' | 'enemy' | 'system' | 'damage' | 'heal';
}

// 報酬の種類
export type RewardType = 'trait' | 'statHp' | 'statAtk' | 'statDef' | 'heal';

// 報酬
export interface Reward {
  type: RewardType;
  traitId?: string;
  value?: number;
  label: string;
  description: string;
}

// ゲーム状態
export interface GameState {
  phase: GamePhase;
  floor: number;
  battleCount: number;
  player: Player;
  currentEnemy: BattleEnemy | null;
  battlePhase: BattlePhase;
  battleLog: BattleLogEntry[];
  pendingRewards: Reward[];
  gameResult: 'victory' | 'defeat' | null;
}

// プレイヤーの行動
export type PlayerAction = 'attack' | 'guard' | 'skill';

// 戦闘コンテキスト（特性処理用）
export interface BattleContext {
  player: Player;
  enemy: BattleEnemy;
  damage: number;
  isCrit: boolean;
  addLog: (message: string, type: BattleLogEntry['type']) => void;
}

// 初期プレイヤーステータス
export const INITIAL_PLAYER: Player = {
  hp: 50,
  maxHp: 50,
  atk: 10,
  def: 5,
  lv: 1,
  exp: 0,
  traits: [],
  skillCooldown: 0,
  isGuarding: false,
  statusEffects: [],
};

// ゲーム定数
export const GAME_CONSTANTS = {
  MAX_FLOORS: 5,
  BATTLES_PER_FLOOR: 4,
  MAX_TRAITS: 6,
  MAX_TRAIT_STACK: 3,
  SKILL_COOLDOWN: 3,
  SKILL_MULTIPLIER: 1.8,
  GUARD_REDUCTION: 0.5,
  GUARD_FLAT_REDUCTION: 2,
  CRIT_CHANCE: 0.1,
  CRIT_MULTIPLIER: 1.5,
  HEAL_PERCENT: 0.3,
  EXP_PER_LEVEL: 100,
};
