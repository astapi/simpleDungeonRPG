// ============================================
// ゲームエンジン
// ゲーム全体の進行を管理
// ============================================

import { BattleEngine, simpleAI } from './BattleEngine';
import { EnemySelector } from './EnemySelector';
import { RewardGenerator } from './RewardGenerator';
import {
  BattleState,
  DEFAULT_CONFIG,
  GameConfig,
  GameState,
  INITIAL_PLAYER,
  PlayerCommand,
  Reward,
  SimulationResult
} from './types';

export interface GameEngineOptions {
  config?: GameConfig;
  enableLogging?: boolean;
}

/**
 * ゲームエンジンクラス
 */
export class GameEngine {
  private config: GameConfig;
  private enableLogging: boolean;
  private enemySelector: EnemySelector;
  private rewardGenerator: RewardGenerator;
  private state: GameState;
  private currentBattle: BattleEngine | null = null;

  constructor(options: GameEngineOptions = {}) {
    this.config = options.config ?? DEFAULT_CONFIG;
    this.enableLogging = options.enableLogging ?? true;
    this.enemySelector = new EnemySelector(this.config);
    this.rewardGenerator = new RewardGenerator(this.config);
    this.state = this.createInitialState();
  }

  /**
   * 初期状態を作成
   */
  private createInitialState(): GameState {
    return {
      phase: 'title',
      progress: {
        currentFloor: 1,
        battleCount: 0,
        totalBattles: 0,
      },
      player: { ...INITIAL_PLAYER },
      currentEnemy: null,
      pendingRewards: [],
      result: null,
    };
  }

  /**
   * 現在のゲーム状態を取得
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * 現在のバトル状態を取得
   */
  getBattleState(): BattleState | null {
    return this.currentBattle?.getState() ?? null;
  }

  /**
   * ゲームをリセット
   */
  reset(): void {
    this.state = this.createInitialState();
    this.currentBattle = null;
  }

  /**
   * 新しいゲームを開始
   */
  startNewGame(): GameState {
    this.state = {
      ...this.createInitialState(),
      phase: 'battle',
      progress: {
        currentFloor: 1,
        battleCount: 1,
        totalBattles: 1,
      },
    };
    this.startBattle();
    return this.getState();
  }

  /**
   * 新しいバトルを開始
   */
  startBattle(): BattleState {
    const { currentFloor, battleCount } = this.state.progress;
    const enemy = this.enemySelector.spawnEnemy(currentFloor, battleCount);

    this.state.currentEnemy = enemy;
    this.currentBattle = new BattleEngine(this.state.player, enemy, {
      config: this.config,
      enableLogging: this.enableLogging,
    });

    return this.currentBattle.getState();
  }

  /**
   * プレイヤーコマンドを実行
   */
  executeCommand(command: PlayerCommand): BattleState | null {
    if (!this.currentBattle || this.state.phase !== 'battle') {
      return null;
    }

    const battleState = this.currentBattle.executePlayerCommand(command);
    this.syncPlayerFromBattle(battleState);

    return battleState;
  }

  /**
   * 敵ターンを実行
   */
  executeEnemyTurn(): BattleState | null {
    if (!this.currentBattle || this.state.phase !== 'battle') {
      return null;
    }

    const battleState = this.currentBattle.executeEnemyTurn();
    this.syncPlayerFromBattle(battleState);

    // バトル終了判定
    if (battleState.phase === 'victory') {
      this.onBattleVictory(battleState);
    } else if (battleState.phase === 'defeat') {
      this.onBattleDefeat();
    }

    return battleState;
  }

  /**
   * 1ターンを実行（シミュレーション用）
   */
  executeTurn(command: PlayerCommand): BattleState | null {
    if (!this.currentBattle) return null;

    const battleState = this.currentBattle.executeTurn(command);
    this.syncPlayerFromBattle(battleState);

    if (battleState.phase === 'victory') {
      this.onBattleVictory(battleState);
    } else if (battleState.phase === 'defeat') {
      this.onBattleDefeat();
    }

    return battleState;
  }

  /**
   * 報酬を選択
   */
  selectReward(reward: Reward): GameState {
    if (this.state.phase !== 'reward') {
      return this.getState();
    }

    this.state.player = this.rewardGenerator.applyReward(this.state.player, reward);
    this.state.pendingRewards = [];

    // 次のバトルへ
    this.advanceToNextBattle();

    return this.getState();
  }

  /**
   * シミュレーション用：報酬を自動選択
   */
  selectBestReward(strategy: 'balanced' | 'stat_only' | 'trait_only' = 'balanced'): GameState {
    if (this.state.phase !== 'reward' || this.state.pendingRewards.length === 0) {
      return this.getState();
    }

    const best = this.rewardGenerator.selectBestReward(
      this.state.player,
      this.state.pendingRewards,
      strategy
    );
    return this.selectReward(best);
  }

  /**
   * ゲームが終了しているか
   */
  isGameOver(): boolean {
    return this.state.phase === 'result';
  }

  /**
   * 勝利したか
   */
  isVictory(): boolean {
    return this.state.result === 'victory';
  }

  /**
   * シミュレーション結果を取得
   */
  getSimulationResult(): SimulationResult {
    return {
      victory: this.state.result === 'victory',
      finalFloor: this.state.progress.currentFloor,
      totalBattles: this.state.progress.totalBattles,
      finalLevel: this.state.player.lv,
      finalHp: this.state.player.hp,
      finalMaxHp: this.state.player.maxHp,
      finalAtk: this.state.player.atk,
      finalDef: this.state.player.def,
      traitsCount: this.state.player.traits.length,
      traits: this.state.player.traits.map((t) => t.id),
    };
  }

  // ===== プライベートメソッド =====

  private syncPlayerFromBattle(battleState: BattleState) {
    // バトル中のプレイヤー状態を同期
    this.state.player = {
      ...this.state.player,
      hp: battleState.player.hp,
      statusEffects: battleState.player.statusEffects,
      skillCooldown: battleState.player.skillCooldown,
    };
  }

  private onBattleVictory(battleState: BattleState) {
    // 敵を倒したら確定でレベルアップ
    this.levelUp();

    // ボス戦勝利 → ゲームクリア
    if (this.state.currentEnemy?.definition.tier === 'boss') {
      this.state.phase = 'result';
      this.state.result = 'victory';
      return;
    }

    // 報酬画面へ
    this.state.phase = 'reward';
    this.state.pendingRewards = this.rewardGenerator.generateRewards(this.state.player);
  }

  private onBattleDefeat() {
    this.state.phase = 'result';
    this.state.result = 'defeat';
  }

  /**
   * レベルアップ処理（敵を1体倒すごとに1レベル上昇）
   * 最大HPは上がるが、現在HPは回復しない
   */
  private levelUp() {
    this.state.player.lv++;
    this.state.player.maxHp += 5;
    // 現在HPは回復しない（報酬でHP回復を選ぶ意味を持たせる）
  }

  private advanceToNextBattle() {
    let { currentFloor, battleCount, totalBattles } = this.state.progress;

    battleCount++;
    totalBattles++;

    // 階層進行
    if (battleCount > this.config.battlesPerFloor) {
      currentFloor++;
      battleCount = 1;
    }

    this.state.progress = { currentFloor, battleCount, totalBattles };
    this.state.phase = 'battle';

    // 新しいバトル開始
    this.startBattle();
  }
}

/**
 * 1ゲームを完全自動実行（シミュレーション用）
 */
export function runFullGame(
  config: GameConfig = DEFAULT_CONFIG,
  aiStrategy: (state: BattleState) => PlayerCommand = simpleAI,
  rewardStrategy: 'balanced' | 'stat_only' | 'trait_only' = 'balanced'
): SimulationResult {
  const engine = new GameEngine({ config, enableLogging: false });
  engine.startNewGame();

  while (!engine.isGameOver()) {
    const gameState = engine.getState();

    if (gameState.phase === 'battle') {
      // バトル実行
      let battleState = engine.getBattleState();
      while (battleState && battleState.phase !== 'victory' && battleState.phase !== 'defeat') {
        const command = aiStrategy(battleState);
        engine.executeTurn(command);
        battleState = engine.getBattleState();
      }
    } else if (gameState.phase === 'reward') {
      // 報酬選択
      engine.selectBestReward(rewardStrategy);
    }
  }

  return engine.getSimulationResult();
}
