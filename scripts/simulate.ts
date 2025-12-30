/**
 * シミュレーション実行スクリプト
 *
 * 使用方法:
 *   npx tsx scripts/simulate.ts [runs]
 *
 * 例:
 *   npx tsx scripts/simulate.ts          # 1000ゲーム実行
 *   npx tsx scripts/simulate.ts 5000     # 5000ゲーム実行
 *   npx tsx scripts/simulate.ts compare  # AI戦略比較
 *   npx tsx scripts/simulate.ts balance  # バランステスト
 */

import {
  quickRun,
  compareStrategies,
  testBalanceConfig,
  DEFAULT_CONFIG,
} from '../core';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'compare') {
  // AI戦略比較
  const runs = parseInt(args[1]) || 500;
  compareStrategies(runs);
} else if (command === 'balance') {
  // バランステスト
  const runs = parseInt(args[1]) || 500;

  // テストするバリエーション
  const variations = [
    { critChance: 0.15 }, // クリ率UP
    { critChance: 0.05 }, // クリ率DOWN
    { healPercent: 0.4 }, // 回復UP
    { healPercent: 0.2 }, // 回復DOWN
    { skillMultiplier: 2.0 }, // スキル倍率UP
    { skillMultiplier: 1.5 }, // スキル倍率DOWN
  ];

  testBalanceConfig(DEFAULT_CONFIG, variations, runs);
} else {
  // 通常シミュレーション
  const runs = parseInt(command) || 1000;
  quickRun(runs);
}
