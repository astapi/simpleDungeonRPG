import { EnemyDefinition } from '@/types/game';

// Tier1 敵（1F、2F前半）
export const TIER1_ENEMIES: EnemyDefinition[] = [
  {
    id: 'slime',
    name: 'スライム',
    hp: 20,
    atk: 6,
    def: 2,
    tier: 1,
    exp: 15,
    actions: [
      { type: 'attack', weight: 80 },
      { type: 'defend', weight: 20 },
    ],
  },
  {
    id: 'goblin',
    name: 'ゴブリン',
    hp: 25,
    atk: 8,
    def: 3,
    tier: 1,
    exp: 20,
    actions: [
      { type: 'attack', weight: 70 },
      { type: 'strongAttack', weight: 20, damage: 12 },
      { type: 'defend', weight: 10 },
    ],
  },
  {
    id: 'bat',
    name: 'コウモリ',
    hp: 15,
    atk: 7,
    def: 1,
    tier: 1,
    exp: 12,
    actions: [
      { type: 'attack', weight: 90 },
      { type: 'attack', weight: 10 },
    ],
  },
  {
    id: 'rat',
    name: 'ジャイアントラット',
    hp: 18,
    atk: 5,
    def: 2,
    tier: 1,
    exp: 10,
    actions: [
      { type: 'attack', weight: 85 },
      { type: 'debuff', weight: 15, effect: 'poison' },
    ],
  },
];

// Tier2 敵（2F後半、3F、4F前半）
export const TIER2_ENEMIES: EnemyDefinition[] = [
  {
    id: 'orc',
    name: 'オーク',
    hp: 45,
    atk: 12,
    def: 5,
    tier: 2,
    exp: 35,
    actions: [
      { type: 'attack', weight: 60 },
      { type: 'strongAttack', weight: 25, damage: 18 },
      { type: 'buff', weight: 15 },
    ],
  },
  {
    id: 'skeleton',
    name: 'スケルトン',
    hp: 35,
    atk: 10,
    def: 8,
    tier: 2,
    exp: 30,
    actions: [
      { type: 'attack', weight: 70 },
      { type: 'defend', weight: 30 },
    ],
  },
  {
    id: 'wolf',
    name: 'ダイアウルフ',
    hp: 40,
    atk: 14,
    def: 4,
    tier: 2,
    exp: 32,
    actions: [
      { type: 'attack', weight: 80 },
      { type: 'strongAttack', weight: 20, damage: 20 },
    ],
  },
  {
    id: 'ghost',
    name: 'ゴースト',
    hp: 30,
    atk: 11,
    def: 3,
    tier: 2,
    exp: 28,
    actions: [
      { type: 'attack', weight: 65 },
      { type: 'debuff', weight: 35, effect: 'burn' },
    ],
  },
];

// Tier3 敵（4F後半、5F）
export const TIER3_ENEMIES: EnemyDefinition[] = [
  {
    id: 'troll',
    name: 'トロール',
    hp: 70,
    atk: 16,
    def: 8,
    tier: 3,
    exp: 55,
    actions: [
      { type: 'attack', weight: 50 },
      { type: 'strongAttack', weight: 30, damage: 25 },
      { type: 'buff', weight: 20 },
    ],
  },
  {
    id: 'dark_knight',
    name: 'ダークナイト',
    hp: 60,
    atk: 18,
    def: 10,
    tier: 3,
    exp: 60,
    actions: [
      { type: 'attack', weight: 55 },
      { type: 'strongAttack', weight: 25, damage: 28 },
      { type: 'defend', weight: 20 },
    ],
  },
  {
    id: 'demon',
    name: 'デーモン',
    hp: 55,
    atk: 20,
    def: 6,
    tier: 3,
    exp: 58,
    actions: [
      { type: 'attack', weight: 50 },
      { type: 'debuff', weight: 30, effect: 'burn' },
      { type: 'strongAttack', weight: 20, damage: 30 },
    ],
  },
  {
    id: 'golem',
    name: 'ゴーレム',
    hp: 80,
    atk: 14,
    def: 12,
    tier: 3,
    exp: 52,
    actions: [
      { type: 'attack', weight: 60 },
      { type: 'defend', weight: 25 },
      { type: 'strongAttack', weight: 15, damage: 22 },
    ],
  },
];

// ラスボス
export const BOSS_ENEMY: EnemyDefinition = {
  id: 'dragon',
  name: '古竜ヴァルドラス',
  hp: 150,
  atk: 22,
  def: 10,
  tier: 'boss',
  exp: 200,
  actions: [
    { type: 'attack', weight: 40 },
    { type: 'strongAttack', weight: 30, damage: 35 },
    { type: 'debuff', weight: 20, effect: 'burn' },
    { type: 'buff', weight: 10 },
  ],
};

// 階層ごとの敵プール取得
export function getEnemyPool(floor: number): EnemyDefinition[] {
  switch (floor) {
    case 1:
      return TIER1_ENEMIES;
    case 2:
      // 7:3 の比率で Tier1:Tier2
      return [...TIER1_ENEMIES, ...TIER1_ENEMIES, ...TIER2_ENEMIES];
    case 3:
      return TIER2_ENEMIES;
    case 4:
      // 4:6 の比率で Tier2:Tier3
      return [...TIER2_ENEMIES, ...TIER3_ENEMIES, ...TIER3_ENEMIES];
    case 5:
      return TIER3_ENEMIES;
    default:
      return TIER1_ENEMIES;
  }
}

// すべての敵定義を取得
export function getAllEnemies(): EnemyDefinition[] {
  return [...TIER1_ENEMIES, ...TIER2_ENEMIES, ...TIER3_ENEMIES, BOSS_ENEMY];
}
