import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useGameStore } from '@/stores/gameStore';
import { PlayerStatus } from '@/components/battle/PlayerStatus';
import { RewardCard } from '@/components/reward/RewardCard';
import { GAME_CONSTANTS, Reward } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES } from '@/constants/theme';

export default function RewardScreen() {
  const currentFloor = useGameStore((state) => state.currentFloor);
  const battleCount = useGameStore((state) => state.battleCount);
  const player = useGameStore((state) => state.player);
  const pendingRewards = useGameStore((state) => state.pendingRewards);
  const applyReward = useGameStore((state) => state.applyReward);
  const nextBattle = useGameStore((state) => state.nextBattle);

  const handleSelectReward = (reward: Reward) => {
    applyReward(reward);
    nextBattle();
    router.replace('/battle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>報酬を選択</Text>

        <View style={styles.floorInfo}>
          <Text style={styles.floorText}>
            {currentFloor}F - {battleCount}/{GAME_CONSTANTS.BATTLES_PER_FLOOR}
          </Text>
        </View>

        <View style={styles.rewardCards}>
          {pendingRewards.map((reward, index) => (
            <RewardCard
              key={`${reward.type}-${index}`}
              reward={reward}
              onSelect={() => handleSelectReward(reward)}
            />
          ))}
        </View>

        <PlayerStatus player={player} />
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
    padding: SPACING.md,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  floorInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  floorText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  rewardCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});
