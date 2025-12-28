import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { GAME_CONSTANTS } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

export default function TitleScreen() {
  const startNewGame = useGameStore((state) => state.startNewGame);

  const handleStart = () => {
    startNewGame();
    router.push('/battle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.titleText}>ローグライト</Text>
        <Text style={styles.subtitleText}>RPG</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>全{GAME_CONSTANTS.MAX_FLOORS}階層</Text>
          <Text style={styles.infoText}>
            {GAME_CONSTANTS.MAX_FLOORS * GAME_CONSTANTS.BATTLES_PER_FLOOR + 1}戦闘
          </Text>
          <Text style={styles.infoText}>ラスボスを倒せ!</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>ゲームスタート</Text>
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
  titleText: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(233, 69, 96, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitleText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  infoContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.md,
    marginVertical: SPACING.xs,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl * 2,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl * 2,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  startButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
});
