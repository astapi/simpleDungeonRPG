// ============================================
// シミュレーター
// 大量のゲームを実行してバランス確認
// ============================================

import {
  GameConfig,
  DEFAULT_CONFIG,
  SimulationResult,
  SimulationStats,
  BattleState,
  PlayerCommand,
} from './types';
import { runFullGame } from './GameEngine';
import { simpleAI, aggressiveAI, defensiveAI } from './BattleEngine';

export type AIStrategy = (state: BattleState) => PlayerCommand;

export type RewardStrategy = 'balanced' | 'stat_only' | 'trait_only';

export interface SimulatorOptions {
  runs: number;
  config?: GameConfig;
  aiStrategy?: AIStrategy;
  rewardStrategy?: RewardStrategy;
  verbose?: boolean;
}

/**
 * シミュレーション結果を集計
 */
function calculateStats(results: SimulationResult[]): SimulationStats {
  const totalRuns = results.length;
  const victories = results.filter((r) => r.victory).length;
  const defeats = totalRuns - victories;

  const avgFinalFloor =
    results.reduce((sum, r) => sum + r.finalFloor, 0) / totalRuns;
  const avgFinalLevel =
    results.reduce((sum, r) => sum + r.finalLevel, 0) / totalRuns;
  const avgBattles =
    results.reduce((sum, r) => sum + r.totalBattles, 0) / totalRuns;

  // 階層別分布
  const floorDistribution: Record<number, number> = {};
  for (const result of results) {
    const floor = result.finalFloor;
    floorDistribution[floor] = (floorDistribution[floor] || 0) + 1;
  }

  return {
    totalRuns,
    victories,
    defeats,
    winRate: victories / totalRuns,
    avgFinalFloor,
    avgFinalLevel,
    avgBattles,
    floorDistribution,
  };
}

/**
 * シミュレーション実行
 */
export function runSimulation(options: SimulatorOptions): {
  results: SimulationResult[];
  stats: SimulationStats;
} {
  const {
    runs,
    config = DEFAULT_CONFIG,
    aiStrategy = simpleAI,
    rewardStrategy = 'balanced',
    verbose = false,
  } = options;

  const results: SimulationResult[] = [];

  for (let i = 0; i < runs; i++) {
    const result = runFullGame(config, aiStrategy, rewardStrategy);
    results.push(result);

    if (verbose && (i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${runs}`);
    }
  }

  const stats = calculateStats(results);

  return { results, stats };
}

/**
 * 統計を整形して表示
 */
export function formatStats(stats: SimulationStats): string {
  const lines: string[] = [
    '========================================',
    '        シミュレーション結果',
    '========================================',
    '',
    `総ゲーム数: ${stats.totalRuns}`,
    `勝利数: ${stats.victories}`,
    `敗北数: ${stats.defeats}`,
    `勝率: ${(stats.winRate * 100).toFixed(1)}%`,
    '',
    `平均到達階層: ${stats.avgFinalFloor.toFixed(2)}F`,
    `平均最終レベル: ${stats.avgFinalLevel.toFixed(2)}`,
    `平均戦闘数: ${stats.avgBattles.toFixed(1)}`,
    '',
    '--- 階層別分布 ---',
  ];

  // 階層別分布（ソート）
  const floors = Object.keys(stats.floorDistribution)
    .map(Number)
    .sort((a, b) => a - b);

  for (const floor of floors) {
    const count = stats.floorDistribution[floor];
    const percent = ((count / stats.totalRuns) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(count / stats.totalRuns * 20));
    lines.push(`  ${floor}F: ${count} (${percent}%) ${bar}`);
  }

  lines.push('========================================');

  return lines.join('\n');
}

/**
 * 複数のAI戦略を比較
 */
export function compareStrategies(
  runs: number = 1000,
  config: GameConfig = DEFAULT_CONFIG
): void {
  const strategies: { name: string; ai: AIStrategy }[] = [
    { name: 'シンプルAI', ai: simpleAI },
    { name: '攻撃的AI', ai: aggressiveAI },
    { name: '防御的AI', ai: defensiveAI },
  ];

  console.log('========================================');
  console.log('      AI戦略比較');
  console.log(`      (各${runs}ゲーム実行)`);
  console.log('========================================\n');

  for (const { name, ai } of strategies) {
    const { stats } = runSimulation({ runs, config, aiStrategy: ai });
    console.log(`【${name}】`);
    console.log(`  勝率: ${(stats.winRate * 100).toFixed(1)}%`);
    console.log(`  平均到達階層: ${stats.avgFinalFloor.toFixed(2)}F`);
    console.log(`  平均レベル: ${stats.avgFinalLevel.toFixed(2)}`);
    console.log('');
  }
}

/**
 * バランス調整用：設定を変えてテスト
 */
export function testBalanceConfig(
  baseConfig: GameConfig,
  variations: Partial<GameConfig>[],
  runs: number = 500
): void {
  console.log('========================================');
  console.log('      バランステスト');
  console.log('========================================\n');

  // ベース設定
  const baseResult = runSimulation({ runs, config: baseConfig });
  console.log('【ベース設定】');
  console.log(`  勝率: ${(baseResult.stats.winRate * 100).toFixed(1)}%`);
  console.log('');

  // バリエーション
  for (let i = 0; i < variations.length; i++) {
    const config = { ...baseConfig, ...variations[i] };
    const result = runSimulation({ runs, config });
    console.log(`【バリエーション ${i + 1}】`);
    console.log(`  変更: ${JSON.stringify(variations[i])}`);
    console.log(`  勝率: ${(result.stats.winRate * 100).toFixed(1)}%`);
    console.log('');
  }
}

/**
 * クイック実行（コンソール用）
 */
export function quickRun(runs: number = 1000): void {
  console.log(`\n${runs}ゲームのシミュレーションを実行中...\n`);

  const startTime = Date.now();
  const { stats } = runSimulation({ runs, verbose: true });
  const elapsed = Date.now() - startTime;

  console.log('');
  console.log(formatStats(stats));
  console.log(`\n実行時間: ${elapsed}ms (${(elapsed / runs).toFixed(2)}ms/game)`);
}

// エクスポート
export { simpleAI, aggressiveAI, defensiveAI };
