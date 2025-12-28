import { TraitDefinition } from '@/types/game';

// 攻撃系特性
export const ATTACK_TRAITS: TraitDefinition[] = [
  {
    id: 'double_strike',
    name: '連撃',
    description: '30%の確率で追撃（スタックごとに+10%）',
    maxStack: 3,
    trigger: 'onHit',
  },
  {
    id: 'crit_up',
    name: '会心の一撃',
    description: 'クリティカル率+10%（スタック可）',
    maxStack: 3,
    trigger: 'onHit',
  },
  {
    id: 'armor_break',
    name: '破甲',
    description: '攻撃時、敵のDEF-1（最大-5）',
    maxStack: 3,
    trigger: 'onHit',
  },
  {
    id: 'power_up',
    name: '力の祝福',
    description: 'ATK+2（スタック可）',
    maxStack: 3,
    trigger: 'onBattleStart',
  },
];

// 状態異常系特性
export const STATUS_TRAITS: TraitDefinition[] = [
  {
    id: 'poison_blade',
    name: '毒刃',
    description: '攻撃時、毒(2ダメージ)を3ターン付与',
    maxStack: 3,
    trigger: 'onHit',
  },
  {
    id: 'burn_strike',
    name: '炎撃',
    description: '攻撃時、火傷(3ダメージ)を2ターン付与',
    maxStack: 2,
    trigger: 'onHit',
  },
];

// 防御・回復系特性
export const DEFENSE_TRAITS: TraitDefinition[] = [
  {
    id: 'guard_up',
    name: 'ガード強化',
    description: '被ダメージ-2（スタック可）',
    maxStack: 3,
    trigger: 'onDamaged',
  },
  {
    id: 'lifesteal',
    name: '吸収',
    description: '与ダメージの10%回復（スタックごとに+5%）',
    maxStack: 3,
    trigger: 'onHit',
  },
  {
    id: 'regeneration',
    name: '自然治癒',
    description: 'ターン終了時HP+2（スタック可）',
    maxStack: 3,
    trigger: 'onTurnEnd',
  },
  {
    id: 'iron_skin',
    name: '鉄の肌',
    description: 'DEF+1（スタック可）',
    maxStack: 3,
    trigger: 'onBattleStart',
  },
];

// テンポ系特性
export const TEMPO_TRAITS: TraitDefinition[] = [
  {
    id: 'first_strike',
    name: '先制',
    description: '戦闘開始時、最初の攻撃が必ずクリティカル',
    maxStack: 1,
    trigger: 'onBattleStart',
  },
  {
    id: 'counter',
    name: '反撃',
    description: 'ガード成功時、反撃ダメージ(ATK×0.5)',
    maxStack: 2,
    trigger: 'onGuard',
  },
];

// すべての特性
export const ALL_TRAITS: TraitDefinition[] = [
  ...ATTACK_TRAITS,
  ...STATUS_TRAITS,
  ...DEFENSE_TRAITS,
  ...TEMPO_TRAITS,
];

// 特性IDから定義を取得
export function getTraitById(id: string): TraitDefinition | undefined {
  return ALL_TRAITS.find((t) => t.id === id);
}

// ランダムな特性を取得（指定数）
export function getRandomTraits(count: number, excludeIds: string[] = []): TraitDefinition[] {
  const available = ALL_TRAITS.filter((t) => !excludeIds.includes(t.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}
