import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useGameStore } from '@/stores/gameStore';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bgImage = require('@/assets/images/bg.png');

export default function TitleScreen() {
  const startNewGame = useGameStore((state) => state.startNewGame);

  const handleStart = () => {
    startNewGame();
    router.push('/battle');
  };

  return (
    <View style={styles.background}>
      <Image
        source={bgImage}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <Text style={styles.titleText}>シンプルダンジョンRPG</Text>
          {/* <Text style={styles.subtitleText}>RPG</Text> */}

          <View style={styles.infoContainer}>
            {/* <Text style={styles.infoText}>全{GAME_CONSTANTS.MAX_FLOORS}階層</Text>
            <Text style={styles.infoText}>
              {GAME_CONSTANTS.MAX_FLOORS * GAME_CONSTANTS.BATTLES_PER_FLOOR + 1}戦闘
            </Text> */}
            {/* <Text style={styles.infoText}>ラスボスを倒せ!</Text> */}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleStart}
          >
            <Text style={styles.startButtonText}>ダンジョンに潜る</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  titleText: {
    color: COLORS.primary,
    fontSize: 32,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
