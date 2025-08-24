import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FeatureCard } from '@/components/FeatureCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { logout } = useAuth();
  const navigation = useNavigation<any>();

  const handleFeaturePress = (feature: string) => {
    Alert.alert('AlimentaMais', `Funcionalidade "${feature}" em desenvolvimento!`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <FontAwesome5 name="utensils" size={26} color={colors.primary} style={{ marginRight: 8 }} />
            <ThemedText type="title" style={[styles.welcomeText, { color: colors.primary }]}>
              AlimentaMais
            </ThemedText>
          </View>
          
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Conectando quem tem com quem precisa. Juntos contra o desperdício de alimentos!
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Nossa Comunidade
        </ThemedText>

        <ThemedView style={styles.statsRow}>
          <ThemedView style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <ThemedText style={[styles.statNumber, { color: 'white' }]}>1,234</ThemedText>
            <ThemedText style={[styles.statLabel, { color: 'white' }]}>Doações Realizadas</ThemedText>
          </ThemedView>

          <ThemedView style={[styles.statCard, { backgroundColor: colors.secondary }]}>
            <ThemedText style={[styles.statNumber, { color: 'white' }]}>567</ThemedText>
            <ThemedText style={[styles.statLabel, { color: 'white' }]}>Famílias Ajudadas</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.featuresSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Como Participar
        </ThemedText>

        <FeatureCard
          title="Fazer uma Doação"
          description="Cadastre alimentos que você tem disponível para doação. Ajude quem mais precisa!"
          icon="volunteer-activism"
          onPress={() => navigation.navigate('DonationScreen')}
          style={styles.featureCard}
        />

        <FeatureCard
          title="Receber Doações"
          description="Encontre alimentos disponíveis na sua região. Receba com dignidade."
          icon="food-bank"
          onPress={() => handleFeaturePress('Receber Doações')}
          style={styles.featureCard}
        />

        <FeatureCard
          title="Pontos de Coleta"
          description="Localize pontos de coleta próximos a você para facilitar a entrega."
          icon="location-on"
          onPress={() => handleFeaturePress('Pontos de Coleta')}
          style={styles.featureCard}
        />

        <FeatureCard
          title="Organizações Parceiras"
          description="Conecte-se com ONGs e instituições que trabalham contra a fome."
          icon="business"
          onPress={() => handleFeaturePress('Organizações Parceiras')}
          style={styles.featureCard}
        />

        <FeatureCard
          title="Histórico de Doações"
          description="Acompanhe suas doações realizadas e o impacto que você gerou."
          icon="history"
          onPress={() => handleFeaturePress('Histórico')}
          style={styles.featureCard}
        />

        <FeatureCard
          title="Comunidade"
          description="Compartilhe experiências e inspire outros a participar da rede solidária."
          icon="group"
          onPress={() => handleFeaturePress('Comunidade')}
          style={styles.featureCard}
        />
      </ThemedView>

      <ThemedView style={styles.impactSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Nosso Impacto
        </ThemedText>
        <ThemedText style={[styles.impactText, { color: colors.text }]}>
          💚 Mais de 5 toneladas de alimentos doados
        </ThemedText>
        <ThemedText style={[styles.impactText, { color: colors.text }]}>
          🌍 Redução de 80% no desperdício alimentar
        </ThemedText>
        <ThemedText style={[styles.impactText, { color: colors.text }]}>
          👥 100+ voluntários ativos na plataforma
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.text }]}>
          💝 Juntos somos mais fortes contra a fome!
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  statsSection: {
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  impactSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  impactText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
