import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}

export function FeatureCard({ title, description, icon, onPress, style }: FeatureCardProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.background, borderColor: colors.primary }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
        <MaterialIcons
          name={icon}
          size={32}
          color={colors.background}
        />
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText type="defaultSemiBold" style={[styles.title, { color: colors.primary }]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.text }]}>
          {description}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
