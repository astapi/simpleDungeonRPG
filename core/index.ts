// ============================================
// コアロジック エクスポート
// ============================================

// 型定義
export * from './types';

// データローダー
export { DataLoader, dataLoader, GAME_DATA } from './DataLoader';
export type { TraitData, StatRewardData, EnemyData, GameDataJson } from './DataLoader';

// エンジン
export { BattleEngine, simpleAI, aggressiveAI, defensiveAI } from './BattleEngine';
export type { BattleEngineOptions } from './BattleEngine';
export { GameEngine, runFullGame } from './GameEngine';
export type { GameEngineOptions } from './GameEngine';
export { EnemySelector, enemySelector, ALL_ENEMIES } from './EnemySelector';
export { RewardGenerator, rewardGenerator, TRAITS } from './RewardGenerator';
export type { TraitDefinition } from './RewardGenerator';

// シミュレーター
export {
  runSimulation,
  formatStats,
  compareStrategies,
  testBalanceConfig,
  quickRun,
} from './Simulator';
export type { SimulatorOptions, AIStrategy } from './Simulator';

// UIアダプター
export {
  toUIPlayer,
  toUIEnemy,
  toUILogEntry,
  toUIBattleState,
  toUIReward,
  toCoreTraits,
} from './ui-adapters';
