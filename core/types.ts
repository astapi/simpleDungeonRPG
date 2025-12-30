// ============================================
// コアロジック用型定義
// UIに依存しない純粋なゲームデータ構造
// ============================================

// ステータス効果
export type StatusEffectType = 'poison' | 'burn' | 'armorBreak';

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value: number;
}

// 特性
export interface PlayerTrait {
  id: string;
  stackCount: number;
}

// プレイヤー状態
export interface PlayerState {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  lv: number;
  exp: number;
  traits: PlayerTrait[];
  skillCooldown: number;
  statusEffects: StatusEffect[];
}

// 敵定義（静的データ）
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

// 敵の行動
export type EnemyActionType = 'attack' | 'strongAttack' | 'defend' | 'buff' | 'debuff';

export interface EnemyAction {
  type: EnemyActionType;
  weight: number;
  damage?: number;
  effect?: StatusEffectType;
}

// 戦闘中の敵状態
export interface EnemyState {
  definition: EnemyDefinition;
  currentHp: number;
  statusEffects: StatusEffect[];
  isDefending: boolean;
  buffedAtk: number;
}

// プレイヤーコマンド
export type PlayerCommand = 'attack' | 'guard' | 'skill';

// 戦闘フェーズ
export type BattlePhase = 'playerTurn' | 'enemyTurn' | 'victory' | 'defeat';

// 戦闘イベント（ログ用）
export type BattleEventType =
  | 'battle_start'
  | 'player_attack'
  | 'player_skill'
  | 'player_guard'
  | 'player_damage'
  | 'player_heal'
  | 'player_status'
  | 'enemy_attack'
  | 'enemy_skill'
  | 'enemy_defend'
  | 'enemy_buff'
  | 'enemy_debuff'
  | 'enemy_damage'
  | 'enemy_status'
  | 'critical'
  | 'double_strike'
  | 'counter'
  | 'victory'
  | 'defeat'
  | 'level_up';

export interface BattleEvent {
  type: BattleEventType;
  message: string;
  value?: number;
}

// 戦闘状態
export interface BattleState {
  phase: BattlePhase;
  turn: number;
  player: PlayerState;
  enemy: EnemyState;
  isPlayerGuarding: boolean;
  isFirstTurn: boolean;
  events: BattleEvent[];
}

// 報酬タイプ
export type RewardType = 'trait' | 'statHp' | 'statAtk' | 'statDef' | 'heal';

export interface Reward {
  type: RewardType;
  traitId?: string;
  value?: number;
  label: string;
  description: string;
}

// ゲーム進行状態
export interface GameProgress {
  currentFloor: number;
  battleCount: number;
  totalBattles: number;
}

// ゲーム全体状態
export interface GameState {
  phase: 'title' | 'battle' | 'reward' | 'result';
  progress: GameProgress;
  player: PlayerState;
  currentEnemy: EnemyState | null;
  pendingRewards: Reward[];
  result: 'victory' | 'defeat' | null;
}

// ゲーム設定
export interface GameConfig {
  maxFloors: number;
  battlesPerFloor: number;
  maxTraits: number;
  maxTraitStack: number;
  skillCooldown: number;
  skillMultiplier: number;
  guardReduction: number;
  guardFlatReduction: number;
  critChance: number;
  critMultiplier: number;
  healPercent: number;
  expPerLevel: number;
}

// デフォルト設定
export const DEFAULT_CONFIG: GameConfig = {
  maxFloors: 5,
  battlesPerFloor: 4,
  maxTraits: 6,
  maxTraitStack: 3,
  skillCooldown: 3,
  skillMultiplier: 1.8,
  guardReduction: 0.5,
  guardFlatReduction: 2,
  critChance: 0.1,
  critMultiplier: 1.5,
  healPercent: 0.3,
  expPerLevel: 100,
};

// 初期プレイヤー状態
export const INITIAL_PLAYER: PlayerState = {
  hp: 50,
  maxHp: 50,
  atk: 10,
  def: 5,
  lv: 1,
  exp: 0,
  traits: [],
  skillCooldown: 0,
  statusEffects: [],
};

// シミュレーション結果
export interface SimulationResult {
  victory: boolean;
  finalFloor: number;
  totalBattles: number;
  finalLevel: number;
  finalHp: number;
  finalMaxHp: number;
  finalAtk: number;
  finalDef: number;
  traitsCount: number;
  traits: string[];
}

// シミュレーション統計
export interface SimulationStats {
  totalRuns: number;
  victories: number;
  defeats: number;
  winRate: number;
  avgFinalFloor: number;
  avgFinalLevel: number;
  avgBattles: number;
  floorDistribution: Record<number, number>;
}
