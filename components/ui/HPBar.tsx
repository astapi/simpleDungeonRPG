import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants/theme';

interface HPBarProps {
  current: number;
  max: number;
  label?: string;
  color?: string;
  backgroundColor?: string;
  showNumbers?: boolean;
  height?: number;
}

export function HPBar({
  current,
  max,
  label,
  color = COLORS.hp,
  backgroundColor = COLORS.hpBackground,
  showNumbers = true,
  height = 20,
}: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.barBackground, { backgroundColor, height }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: `${percentage}%`,
            },
          ]}
        />
        {showNumbers && (
          <Text style={styles.numbers}>
            {current} / {max}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.xs,
  },
  barBackground: {
    width: '100%',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.md,
  },
  numbers: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
