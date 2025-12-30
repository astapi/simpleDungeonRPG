// ============================================
// バトルエンジン
// 1戦闘の全ロジックを管理
// ============================================

import {
  PlayerState,
  EnemyState,
  EnemyAction,
  StatusEffect,
  BattleState,
  BattleEvent,
  PlayerCommand,
  GameConfig,
  DEFAULT_CONFIG,
} from './types';
import { TRAITS } from './RewardGenerator';

export interface BattleEngineOptions {
  config?: GameConfig;
  enableLogging?: boolean;
}

/**
 * バトルエンジンクラス
 */
export class BattleEngine {
  private config: GameConfig;
  private state: BattleState;
  private enableLogging: boolean;

  constructor(
    player: PlayerState,
    enemy: EnemyState,
    options: BattleEngineOptions = {}
  ) {
    this.config = options.config ?? DEFAULT_CONFIG;
    this.enableLogging = options.enableLogging ?? true;
    this.state = {
      phase: 'playerTurn',
      turn: 1,
      player: { ...player },
      enemy: { ...enemy },
      isPlayerGuarding: false,
      isFirstTurn: true,
      events: [],
    };
    if (this.enableLogging) {
      this.state.events.push({
        type: 'battle_start',
        message: `${enemy.definition.name}が現れた！`,
      });
    }
  }

  /**
   * 現在の状態を取得
   */
  getState(): BattleState {
    return { ...this.state };
  }

  /**
   * 戦闘が終了しているか
   */
  isFinished(): boolean {
    return this.state.phase === 'victory' || this.state.phase === 'defeat';
  }

  /**
   * プレイヤーのコマンドを実行
   */
  executePlayerCommand(command: PlayerCommand): BattleState {
    if (this.state.phase !== 'playerTurn') {
      return this.getState();
    }

    switch (command) {
      case 'attack':
        this.executePlayerAttack(false);
        break;
      case 'skill':
        if (this.state.player.skillCooldown > 0) {
          return this.getState();
        }
        this.executePlayerAttack(true);
        break;
      case 'guard':
        this.executePlayerGuard();
        break;
    }

    // 勝利判定
    if (this.state.enemy.currentHp <= 0) {
      this.state.phase = 'victory';
      this.addEvent('victory', `${this.state.enemy.definition.name}を倒した！`);
      return this.getState();
    }

    // 敵ターンへ
    this.state.phase = 'enemyTurn';
    return this.getState();
  }

  /**
   * 敵ターンを実行
   */
  executeEnemyTurn(): BattleState {
    if (this.state.phase !== 'enemyTurn') {
      return this.getState();
    }

    // 敵の状態異常処理
    this.processEnemyStatusEffects();

    // 敵が状態異常で倒れた場合
    if (this.state.enemy.currentHp <= 0) {
      this.state.phase = 'victory';
      this.addEvent('victory', `${this.state.enemy.definition.name}を倒した！`);
      return this.getState();
    }

    // 敵の行動
    this.executeEnemyAction();

    // プレイヤーの状態異常処理
    this.processPlayerStatusEffects();

    // 敗北判定
    if (this.state.player.hp <= 0) {
      this.state.phase = 'defeat';
      this.addEvent('defeat', '力尽きた...');
      return this.getState();
    }

    // 自然治癒
    this.processRegeneration();

    // ターン終了処理
    this.endTurn();

    return this.getState();
  }

  /**
   * 1ターンを自動実行（シミュレーション用）
   */
  executeTurn(command: PlayerCommand): BattleState {
    this.executePlayerCommand(command);
    if (this.state.phase === 'enemyTurn') {
      this.executeEnemyTurn();
    }
    return this.getState();
  }

  /**
   * 戦闘を最後まで自動実行（シミュレーション用）
   */
  runAutomatic(commandSelector: (state: BattleState) => PlayerCommand): BattleState {
    while (!this.isFinished()) {
      const command = commandSelector(this.getState());
      this.executeTurn(command);
    }
    return this.getState();
  }

  // ===== プライベートメソッド =====

  private addEvent(type: BattleEvent['type'], message: string, value?: number) {
    if (this.enableLogging) {
      this.state.events.push({ type, message, value });
    }
  }

  private executePlayerAttack(isSkill: boolean) {
    const { player, enemy } = this.state;

    // 敵DEF計算（破甲効果）
    const armorBreak = Math.min(5, this.getTraitBonus('armor_break', 1));
    const effectiveDef = Math.max(0, enemy.definition.def - armorBreak);

    // 基本ダメージ
    let baseDamage = Math.max(1, player.atk - effectiveDef);
    baseDamage += Math.floor(Math.random() * 4) - 1; // -1 ~ +2

    // スキル倍率
    if (isSkill) {
      baseDamage = Math.floor(baseDamage * this.config.skillMultiplier);
      this.state.player.skillCooldown = this.config.skillCooldown;
      // 破甲効果
      this.state.enemy.statusEffects = this.addStatusEffect(
        enemy.statusEffects,
        { type: 'armorBreak', duration: 2, value: 1 }
      );
      this.addEvent('player_skill', 'パワーストライク！');
    }

    // クリティカル判定
    const critBonus = this.getTraitBonus('crit_up', 0.1);
    const critChance = this.config.critChance + critBonus;
    const forceFirstCrit = this.state.isFirstTurn && this.hasTrait('first_strike');
    const isCrit = forceFirstCrit || Math.random() < critChance;

    if (isCrit) {
      baseDamage = Math.floor(baseDamage * this.config.critMultiplier);
      this.addEvent('critical', '【クリティカル！】', baseDamage);
    }

    // 敵が防御中
    if (enemy.isDefending) {
      baseDamage = Math.floor(baseDamage * 0.5);
    }

    // 力の祝福（最終ダメージ+5/スタック）
    const powerUpBonus = this.getTraitBonus('power_up', 5);
    const finalDamage = Math.max(1, baseDamage + powerUpBonus);

    // ダメージ適用
    this.state.enemy.currentHp = Math.max(0, enemy.currentHp - finalDamage);
    this.addEvent(
      isSkill ? 'player_skill' : 'player_attack',
      `${finalDamage}ダメージ！`,
      finalDamage
    );

    // 毒刃効果（ターン経過で2%→4%→6%→8%→10%とダメージ上昇、5ターン持続）
    if (this.hasTrait('poison_blade')) {
      // 毒は上書きせず、なければ追加（value=1はターン1の意味、2%ダメージから開始）
      const hasPoison = this.state.enemy.statusEffects.some(e => e.type === 'poison');
      if (!hasPoison) {
        this.state.enemy.statusEffects = [
          ...this.state.enemy.statusEffects,
          { type: 'poison', duration: 5, value: 1 }
        ];
        this.addEvent('enemy_status', '毒を付与！');
      }
    }

    // 炎撃効果（スタック1:5%、2:8%、3:12%の最大HPダメージ）
    if (this.hasTrait('burn_strike')) {
      const stacks = this.getTraitStacks('burn_strike');
      const burnPercent = stacks === 1 ? 5 : stacks === 2 ? 8 : 12;
      this.state.enemy.statusEffects = this.addStatusEffect(
        this.state.enemy.statusEffects,
        { type: 'burn', duration: 3, value: burnPercent }
      );
      this.addEvent('enemy_status', '火傷を付与！');
    }

    // 吸収効果
    if (this.hasTrait('lifesteal')) {
      const stacks = this.getTraitStacks('lifesteal');
      const healPercent = 0.1 + (stacks - 1) * 0.05;
      const healAmount = Math.floor(finalDamage * healPercent);
      if (healAmount > 0) {
        this.state.player.hp = Math.min(player.maxHp, player.hp + healAmount);
        this.addEvent('player_heal', `${healAmount}HP吸収！`, healAmount);
      }
    }

    // 連撃判定
    if (!isSkill && this.hasTrait('double_strike')) {
      const stacks = this.getTraitStacks('double_strike');
      const doubleChance = 0.3 + (stacks - 1) * 0.1;
      if (Math.random() < doubleChance) {
        const extraDamage = Math.max(1, player.atk - effectiveDef) + powerUpBonus;
        this.state.enemy.currentHp = Math.max(
          0,
          this.state.enemy.currentHp - extraDamage
        );
        this.addEvent('double_strike', `連撃！${extraDamage}ダメージ！`, extraDamage);
      }
    }

    this.state.isFirstTurn = false;
  }

  private executePlayerGuard() {
    this.state.isPlayerGuarding = true;
    this.addEvent('player_guard', 'ガード態勢！');
    this.state.isFirstTurn = false;
  }

  private executeEnemyAction() {
    const { enemy, player } = this.state;
    const action = this.selectEnemyAction(enemy.definition.actions);

    enemy.isDefending = false;

    switch (action.type) {
      case 'attack':
      case 'strongAttack': {
        const baseDamage = action.damage ?? enemy.definition.atk + enemy.buffedAtk;
        let damage = Math.max(1, baseDamage - player.def);
        damage += Math.floor(Math.random() * 3) - 1;

        // ガード軽減
        if (this.state.isPlayerGuarding) {
          damage = Math.floor(damage * this.config.guardReduction);
          damage = Math.max(0, damage - this.config.guardFlatReduction);
        }

        // 堅牢特性（被ダメージ10%カット/スタック、最大40%）
        const damageCutStacks = this.getTraitStacks('damage_cut');
        if (damageCutStacks > 0) {
          const cutPercent = Math.min(40, damageCutStacks * 10);
          damage = Math.floor(damage * (100 - cutPercent) / 100);
        }

        const finalDamage = Math.max(0, damage);
        this.state.player.hp = Math.max(0, player.hp - finalDamage);

        const attackName = action.type === 'strongAttack' ? '強攻撃' : '攻撃';
        this.addEvent('enemy_attack', `${enemy.definition.name}の${attackName}！${finalDamage}ダメージ！`, finalDamage);

        // 吸収防御（ガード時、受けたダメージの50%をHP吸収）
        if (this.state.isPlayerGuarding && this.hasTrait('guard_drain')) {
          const drainAmount = Math.floor(finalDamage * 0.5);
          if (drainAmount > 0) {
            this.state.player.hp = Math.min(player.maxHp, this.state.player.hp + drainAmount);
            this.addEvent('player_heal', `吸収防御！${drainAmount}HP回復！`, drainAmount);
          }
        }
        break;
      }
      case 'defend':
        enemy.isDefending = true;
        this.addEvent('enemy_defend', `${enemy.definition.name}は防御態勢！`);
        break;
      case 'buff':
        enemy.buffedAtk += 3;
        this.addEvent('enemy_buff', `${enemy.definition.name}の攻撃力が上昇！`);
        break;
      case 'debuff':
        if (action.effect === 'poison') {
          this.state.player.statusEffects = this.addStatusEffect(
            player.statusEffects,
            { type: 'poison', duration: 3, value: 2 }
          );
          this.addEvent('player_status', `${enemy.definition.name}が毒を付与！`);
        } else if (action.effect === 'burn') {
          this.state.player.statusEffects = this.addStatusEffect(
            player.statusEffects,
            { type: 'burn', duration: 2, value: 3 }
          );
          this.addEvent('player_status', `${enemy.definition.name}が火傷を付与！`);
        }
        break;
    }

    // ガード解除
    this.state.isPlayerGuarding = false;
  }

  private processEnemyStatusEffects() {
    const { enemy } = this.state;
    const maxHp = enemy.definition.hp;
    let totalDamage = 0;

    for (const effect of enemy.statusEffects) {
      if (effect.type === 'poison') {
        // 毒: valueはターン数（1→2→3→4→5）、ダメージは2%→4%→6%→8%→10%
        const poisonPercent = effect.value * 2; // 2%, 4%, 6%, 8%, 10%
        const poisonDamage = Math.floor(maxHp * poisonPercent / 100);
        totalDamage += poisonDamage;
        this.addEvent('enemy_damage', `毒で${poisonDamage}ダメージ！(${poisonPercent}%)`, poisonDamage);
      } else if (effect.type === 'burn') {
        // 火傷: valueは%（5, 8, 12）
        const burnDamage = Math.floor(maxHp * effect.value / 100);
        totalDamage += burnDamage;
        this.addEvent('enemy_damage', `火傷で${burnDamage}ダメージ！(${effect.value}%)`, burnDamage);
      }
    }

    if (totalDamage > 0) {
      this.state.enemy.currentHp = Math.max(0, enemy.currentHp - totalDamage);
    }

    // 効果時間減少 & 毒のターン数増加
    this.state.enemy.statusEffects = enemy.statusEffects
      .map((e) => {
        if (e.type === 'poison') {
          // 毒はターン数を増加（最大5）
          return { ...e, duration: e.duration - 1, value: Math.min(5, e.value + 1) };
        }
        return { ...e, duration: e.duration - 1 };
      })
      .filter((e) => e.duration > 0);
  }

  private processPlayerStatusEffects() {
    const { player } = this.state;
    let totalDamage = 0;

    for (const effect of player.statusEffects) {
      if (effect.type === 'poison' || effect.type === 'burn') {
        totalDamage += effect.value;
      }
    }

    if (totalDamage > 0) {
      this.state.player.hp = Math.max(0, player.hp - totalDamage);
      this.addEvent('player_damage', `状態異常で${totalDamage}ダメージ！`, totalDamage);
    }

    // 効果時間減少
    this.state.player.statusEffects = player.statusEffects
      .map((e) => ({ ...e, duration: e.duration - 1 }))
      .filter((e) => e.duration > 0);
  }

  private processRegeneration() {
    if (this.hasTrait('regeneration')) {
      const stacks = this.getTraitStacks('regeneration');
      const healAmount = stacks * 4; // HP+4/スタック
      this.state.player.hp = Math.min(
        this.state.player.maxHp,
        this.state.player.hp + healAmount
      );
      this.addEvent('player_heal', `自然治癒で${healAmount}HP回復！`, healAmount);
    }
  }

  private endTurn() {
    // スキルクールダウン減少
    if (this.state.player.skillCooldown > 0) {
      this.state.player.skillCooldown--;
    }

    this.state.turn++;
    this.state.phase = 'playerTurn';
  }

  private selectEnemyAction(actions: EnemyAction[]): EnemyAction {
    const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.random() * totalWeight;
    for (const action of actions) {
      random -= action.weight;
      if (random <= 0) return action;
    }
    return actions[actions.length - 1];
  }

  private addStatusEffect(
    effects: StatusEffect[],
    newEffect: StatusEffect
  ): StatusEffect[] {
    const existing = effects.find((e) => e.type === newEffect.type);
    if (existing) {
      return effects.map((e) =>
        e.type === newEffect.type
          ? { ...e, duration: Math.max(e.duration, newEffect.duration) }
          : e
      );
    }
    return [...effects, newEffect];
  }

  private hasTrait(traitId: string): boolean {
    return this.state.player.traits.some((t) => t.id === traitId);
  }

  private getTraitStacks(traitId: string): number {
    const trait = this.state.player.traits.find((t) => t.id === traitId);
    return trait?.stackCount ?? 0;
  }

  private getTraitBonus(traitId: string, perStack: number): number {
    const stacks = this.getTraitStacks(traitId);
    return stacks * perStack;
  }
}

/**
 * シンプルなAI戦略（シミュレーション用）
 */
export function simpleAI(state: BattleState): PlayerCommand {
  const { player, enemy } = state;
  const hpRatio = player.hp / player.maxHp;
  const enemyHpRatio = enemy.currentHp / enemy.definition.hp;

  // HPが低い時はガード優先
  if (hpRatio < 0.3 && Math.random() < 0.5) {
    return 'guard';
  }

  // スキルが使えるなら使う（敵HPが高い時）
  if (player.skillCooldown === 0 && enemyHpRatio > 0.3) {
    return 'skill';
  }

  // 敵が強攻撃しそうな時（低HP敵は除く）
  if (enemyHpRatio > 0.5 && hpRatio < 0.5 && Math.random() < 0.3) {
    return 'guard';
  }

  return 'attack';
}

/**
 * 攻撃的AI（シミュレーション用）
 */
export function aggressiveAI(state: BattleState): PlayerCommand {
  const { player } = state;

  // スキルが使えるなら使う
  if (player.skillCooldown === 0) {
    return 'skill';
  }

  return 'attack';
}

/**
 * 防御的AI（シミュレーション用）
 */
export function defensiveAI(state: BattleState): PlayerCommand {
  const { player } = state;
  const hpRatio = player.hp / player.maxHp;

  // HPが低い時は一定確率でガード（無限ループ防止）
  if (hpRatio < 0.5 && Math.random() < 0.4) {
    return 'guard';
  }

  // スキルが使えるなら使う
  if (player.skillCooldown === 0) {
    return 'skill';
  }

  return 'attack';
}
