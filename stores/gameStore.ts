import { create } from 'zustand';
import {
  Player,
  PlayerTrait,
  Reward,
  INITIAL_PLAYER,
  GAME_CONSTANTS,
} from '@/types/game';
import { getTraitById } from '@/data/traits';

interface GameState {
  // プレイヤー状態
  player: Player;

  // 進行状態
  currentFloor: number;
  battleCount: number;

  // ゲーム結果
  gameResult: 'victory' | 'defeat' | null;

  // 報酬
  pendingRewards: Reward[];

  // アクション
  startNewGame: () => void;
  resetGame: () => void;
  updatePlayer: (updates: Partial<Player>) => void;
  addTrait: (traitId: string) => boolean;
  applyReward: (reward: Reward) => void;
  nextBattle: () => { floor: number; battleCount: number; isBoss: boolean };
  setGameResult: (result: 'victory' | 'defeat') => void;
  setPendingRewards: (rewards: Reward[]) => void;

  // レベルアップ処理（敵を1体倒すごとに1レベル上昇）
  levelUp: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: { ...INITIAL_PLAYER },
  currentFloor: 1,
  battleCount: 0,
  gameResult: null,
  pendingRewards: [],

  startNewGame: () =>
    set({
      player: { ...INITIAL_PLAYER },
      currentFloor: 1,
      battleCount: 1,
      gameResult: null,
      pendingRewards: [],
    }),

  resetGame: () =>
    set({
      player: { ...INITIAL_PLAYER },
      currentFloor: 1,
      battleCount: 0,
      gameResult: null,
      pendingRewards: [],
    }),

  updatePlayer: (updates) =>
    set((state) => ({
      player: { ...state.player, ...updates },
    })),

  addTrait: (traitId) => {
    const state = get();
    const definition = getTraitById(traitId);
    if (!definition) return false;

    const existingIndex = state.player.traits.findIndex((t) => t.id === traitId);

    if (existingIndex >= 0) {
      // スタック追加
      const existing = state.player.traits[existingIndex];
      if (existing.stackCount >= definition.maxStack) {
        return false;
      }

      const newTraits = [...state.player.traits];
      newTraits[existingIndex] = {
        ...existing,
        stackCount: existing.stackCount + 1,
      };

      set({ player: { ...state.player, traits: newTraits } });
      return true;
    }

    // 新規追加（最大6個まで）
    if (state.player.traits.length >= GAME_CONSTANTS.MAX_TRAITS) {
      return false;
    }

    const newTrait: PlayerTrait = { id: traitId, stackCount: 1 };
    set({
      player: {
        ...state.player,
        traits: [...state.player.traits, newTrait],
      },
    });
    return true;
  },

  applyReward: (reward) => {
    const state = get();
    const player = { ...state.player };

    switch (reward.type) {
      case 'trait':
        if (reward.traitId) {
          get().addTrait(reward.traitId);
        }
        // 特性の場合もpendingRewardsをクリア
        set({ pendingRewards: [] });
        return;
      case 'statHp':
        player.maxHp += reward.value ?? 0;
        player.hp += reward.value ?? 0;
        break;
      case 'statAtk':
        player.atk += reward.value ?? 0;
        break;
      case 'statDef':
        player.def += reward.value ?? 0;
        break;
      case 'heal':
        player.hp = Math.min(player.maxHp, player.hp + (reward.value ?? 0));
        break;
    }

    set({ player, pendingRewards: [] });
  },

  nextBattle: () => {
    const state = get();
    let { currentFloor, battleCount } = state;

    battleCount++;

    // 階層進行
    if (battleCount > GAME_CONSTANTS.BATTLES_PER_FLOOR) {
      currentFloor++;
      battleCount = 1;
    }

    const isBoss =
      currentFloor === GAME_CONSTANTS.MAX_FLOORS &&
      battleCount === GAME_CONSTANTS.BATTLES_PER_FLOOR;

    set({ currentFloor, battleCount });

    return { floor: currentFloor, battleCount, isBoss };
  },

  setGameResult: (result) => set({ gameResult: result }),

  setPendingRewards: (rewards) => set({ pendingRewards: rewards }),

  levelUp: () => {
    const state = get();
    const player = { ...state.player };

    // レベルアップ（敵を1体倒すごとに1レベル上昇）
    // 最大HPは上がるが、現在HPは回復しない（報酬でHP回復を選ぶ意味を持たせる）
    player.lv++;
    player.maxHp += 5;

    set({ player });
  },
}));
