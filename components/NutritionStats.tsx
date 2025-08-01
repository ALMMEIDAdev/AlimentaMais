import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';

interface NutritionStatsProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function NutritionStats({ calories, protein, carbs, fat }: NutritionStatsProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const StatItem = ({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) => (
    <ThemedView style={[styles.statItem, { borderColor: color }]}>
      <ThemedText type="defaultSemiBold" style={[styles.statValue, { color }]}>
        {value}{unit}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.text }]}>
        {label}
      </ThemedText>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="subtitle" style={[styles.title, { color: colors.primary }]}>
        Suas Metas Diárias
      </ThemedText>
      
      <View style={styles.statsRow}>
        <StatItem 
          label="Calorias" 
          value={calories} 
          unit="kcal" 
          color={colors.primary} 
        />
        <StatItem 
          label="Proteína" 
          value={protein} 
          unit="g" 
          color={colors.secondary} 
        />
        <StatItem 
          label="Carboidratos" 
          value={carbs} 
          unit="g" 
          color={colors.accent} 
        />
        <StatItem 
          label="Gordura" 
          value={fat} 
          unit="g" 
          color="#E91E63" 
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: '22%',
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
});
