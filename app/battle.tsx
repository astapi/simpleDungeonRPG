import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { useBattle, generateRewards } from '@/hooks/useBattle';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { EnemyDisplay } from '@/components/battle/EnemyDisplay';
import { ActionButtons } from '@/components/battle/ActionButtons';
import { BattleLog } from '@/components/battle/BattleLog';
import { getEnemyPool, BOSS_ENEMY } from '@/data/enemies';
import { randomPick } from '@/utils/random';
import { GAME_CONSTANTS, EnemyDefinition } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

function getEnemy(floor: number, battleCount: number): EnemyDefinition {
  // 最終戦闘はボス
  if (
    floor === GAME_CONSTANTS.MAX_FLOORS &&
    battleCount === GAME_CONSTANTS.BATTLES_PER_FLOOR
  ) {
    return BOSS_ENEMY;
  }
  const pool = getEnemyPool(floor);
  return randomPick(pool);
}

export default function BattleScreen() {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const battleCount = useGameStore((state) => state.battleCount);
  const globalPlayer = useGameStore((state) => state.player);
  const setGameResult = useGameStore((state) => state.setGameResult);
  const setPendingRewards = useGameStore((state) => state.setPendingRewards);

  // 敵を決定（初回レンダリング時のみ）
  const [enemyDef] = useState(() => getEnemy(currentFloor, battleCount));

  const { state, playerAction, enemyTurn, player } = useBattle(enemyDef);

  // 敵ターンの自動処理
  useEffect(() => {
    if (state.phase === 'enemyTurn') {
      const timer = setTimeout(() => {
        enemyTurn();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.phase, enemyTurn]);

  // 戦闘終了時の画面遷移
  useEffect(() => {
    if (state.phase === 'victory') {
      // ボス撃破で勝利
      if (state.enemy.tier === 'boss') {
        setGameResult('victory');
        router.replace('/result');
      } else {
        // 報酬画面へ
        const rewards = generateRewards(globalPlayer);
        setPendingRewards(rewards);
        router.replace('/reward');
      }
    } else if (state.phase === 'defeat') {
      setGameResult('defeat');
      router.replace('/result');
    }
  }, [state.phase, state.enemy.tier, globalPlayer, setGameResult, setPendingRewards]);

  // バトル用のプレイヤー状態を作成
  const battlePlayer = {
    ...player,
    hp: state.playerHp,
    statusEffects: state.playerStatusEffects,
    isGuarding: state.isGuarding,
    skillCooldown: state.skillCooldown,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* メインコンテンツ */}
      <View style={styles.mainContent}>
        {/* 階層情報 */}
        <View style={styles.floorInfo}>
          <Text style={styles.floorText}>
            {currentFloor}F - {battleCount}/{GAME_CONSTANTS.BATTLES_PER_FLOOR}
          </Text>
        </View>

        {/* 敵表示 */}
        <EnemyDisplay enemy={state.enemy} />

        {/* 戦闘ログ */}
        <BattleLog logs={state.log} />

        {/* プレイヤーステータス */}
        <PlayerStatus player={battlePlayer} />
      </View>

      {/* 行動ボタン（画面下部に固定） */}
      <View style={styles.actionContainer}>
        <ActionButtons
          player={battlePlayer}
          disabled={state.phase !== 'playerTurn'}
          onAction={playerAction}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  actionContainer: {
    padding: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  floorInfo: {
    alignItems: 'center',
  },
  floorText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
