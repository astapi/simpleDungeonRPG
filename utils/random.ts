// ランダム整数を生成 (min ~ max を含む)
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 配列からランダムに1つ選択
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 配列からランダムにN個選択（重複なし）
export function randomPickMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// 確率判定 (0.0 ~ 1.0)
export function chance(probability: number): boolean {
  return Math.random() < probability;
}

// 重み付きランダム選択
export function weightedPick<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

// 配列をシャッフル
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
