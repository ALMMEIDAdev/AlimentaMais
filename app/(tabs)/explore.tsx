import { FeatureCard } from '@/components/FeatureCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert, ScrollView, StyleSheet } from 'react-native';

export default function DonationsScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  const handleDonationPress = (donationTitle: string) => {
    Alert.alert('Doação Disponível', `Interessado em: ${donationTitle}?\n\nEntre em contato com o doador para combinar a retirada.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
          🍽️ Doações Disponíveis
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Alimentos disponíveis para doação na sua região
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Frutas e Verduras
        </ThemedText>

        <FeatureCard
          title="Cesta de Frutas Frescas"
          description="5kg de frutas variadas (maçã, banana, laranja). Validade até amanhã. Região: Centro"
          icon="apple"
          onPress={() => handleDonationPress('Cesta de Frutas Frescas')}
        />

        <FeatureCard
          title="Verduras Orgânicas"
          description="Alface, tomate, cenoura e abobrinha. Colheita de hoje. Região: Vila Nova"
          icon="grass"
          onPress={() => handleDonationPress('Verduras Orgânicas')}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Grãos e Cereais
        </ThemedText>

        <FeatureCard
          title="Arroz e Feijão"
          description="Pacotes de 1kg cada. Dentro da validade. Região: São João"
          icon="grain"
          onPress={() => handleDonationPress('Arroz e Feijão')}
        />

        <FeatureCard
          title="Lentilha e Grão de Bico"
          description="500g de cada. Alimentos não perecíveis. Região: Centro"
          icon="eco"
          onPress={() => handleDonationPress('Lentilha e Grão de Bico')}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Refeições Prontas
        </ThemedText>

        <FeatureCard
          title="Marmitas do Almoço"
          description="10 marmitas com arroz, feijão, carne e salada. Preparadas hoje. Região: Bairro Alto"
          icon="lunch-dining"
          onPress={() => handleDonationPress('Marmitas do Almoço')}
        />

        <FeatureCard
          title="Sopa Caseira"
          description="2L de sopa de legumes nutritiva. Feita ontem. Região: Vila Nova"
          icon="soup-kitchen"
          onPress={() => handleDonationPress('Sopa Caseira')}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Laticínios e Proteínas
        </ThemedText>

        <FeatureCard
          title="Leite e Ovos"
          description="2L de leite integral e 1 dúzia de ovos. Validade de 3 dias. Região: Centro"
          icon="egg"
          onPress={() => handleDonationPress('Leite e Ovos')}
        />

        <FeatureCard
          title="Frango Congelado"
          description="2kg de peito de frango congelado. Próprio para consumo. Região: São João"
          icon="dinner-dining"
          onPress={() => handleDonationPress('Frango Congelado')}
        />
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.text }]}>
          💡 Dica: Entre em contato rapidamente para garantir sua doação!
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
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  section: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.8,
  },
});
