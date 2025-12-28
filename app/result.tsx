import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { GAME_CONSTANTS } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

export default function ResultScreen() {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const battleCount = useGameStore((state) => state.battleCount);
  const player = useGameStore((state) => state.player);
  const gameResult = useGameStore((state) => state.gameResult);
  const resetGame = useGameStore((state) => state.resetGame);

  const handleBackToTitle = () => {
    resetGame();
    router.replace('/');
  };

  const totalBattles =
    (currentFloor - 1) * GAME_CONSTANTS.BATTLES_PER_FLOOR + battleCount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text
          style={[
            styles.resultText,
            gameResult === 'victory' ? styles.victoryText : styles.defeatText,
          ]}
        >
          {gameResult === 'victory' ? 'VICTORY!' : 'DEFEAT...'}
        </Text>

        <View style={styles.stats}>
          <Text style={styles.statText}>到達階層: {currentFloor}F</Text>
          <Text style={styles.statText}>レベル: {player.lv}</Text>
          <Text style={styles.statText}>総戦闘数: {totalBattles}</Text>
        </View>

        <View style={styles.finalStats}>
          <Text style={styles.finalStatsTitle}>最終ステータス</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>HP</Text>
            <Text style={styles.statValue}>
              {player.hp} / {player.maxHp}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>ATK</Text>
            <Text style={styles.statValue}>{player.atk}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>DEF</Text>
            <Text style={styles.statValue}>{player.def}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>特性数</Text>
            <Text style={styles.statValue}>{player.traits.length}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleBackToTitle}
        >
          <Text style={styles.buttonText}>タイトルへ戻る</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  resultText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: SPACING.xl,
  },
  victoryText: {
    color: COLORS.success,
    textShadowColor: 'rgba(74, 222, 128, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  defeatText: {
    color: COLORS.danger,
    textShadowColor: 'rgba(239, 68, 68, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  stats: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statText: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.lg,
    marginVertical: SPACING.xs,
  },
  finalStats: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: 300,
  },
  finalStatsTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.md,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl * 2,
    borderRadius: BORDER_RADIUS.lg,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
});
