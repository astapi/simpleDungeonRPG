import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BattleLogEntry } from '@/types/game';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface BattleLogProps {
  logs: BattleLogEntry[];
}

export function BattleLog({ logs }: BattleLogProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 新しいログが追加されたら自動スクロール
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs.length]);

  const getLogColor = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'player':
        return COLORS.info;
      case 'enemy':
        return COLORS.danger;
      case 'damage':
        return COLORS.warning;
      case 'heal':
        return COLORS.success;
      case 'system':
      default:
        return COLORS.textDim;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((log) => (
          <Text
            key={log.id}
            style={[styles.logText, { color: getLogColor(log.type) }]}
          >
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.md,
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.sm,
  },
  logText: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
});
