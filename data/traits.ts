import { TraitDefinition } from '@/types/game';
import { dataLoader } from '@/core/DataLoader';

// DataLoaderから特性データを取得
export const ALL_TRAITS: TraitDefinition[] = dataLoader.getTraits().map(t => ({
  id: t.id,
  name: t.name,
  description: t.description,
  maxStack: t.maxStack,
  trigger: 'onHit' as const, // triggerはBattleEngineで個別に処理
}));

// カテゴリ別（後方互換性のため残す）
export const ATTACK_TRAITS = ALL_TRAITS.filter(t =>
  ['double_strike', 'crit_up', 'armor_break', 'power_up'].includes(t.id)
);
export const STATUS_TRAITS = ALL_TRAITS.filter(t =>
  ['poison_blade', 'burn_strike'].includes(t.id)
);
export const DEFENSE_TRAITS = ALL_TRAITS.filter(t =>
  ['damage_cut', 'guard_drain', 'lifesteal', 'regeneration'].includes(t.id)
);
export const TEMPO_TRAITS = ALL_TRAITS.filter(t =>
  ['first_strike'].includes(t.id)
);

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
