import { FeatureCard } from '@/components/FeatureCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { db } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

export default function DonationsScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const q = query(collection(db, 'doacoes'), orderBy('criadoEm', 'desc'));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDonations(items);
      } catch (e) {
        console.error('Erro ao buscar doações:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>🍽️ Doações Disponíveis</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>Alimentos disponíveis para doação na sua região</ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ThemedView style={styles.section}>
          {donations.length === 0 ? (
            <ThemedText style={{ textAlign: 'center', color: colors.textSecondary }}>
              Nenhuma doação disponível no momento.
            </ThemedText>
          ) : (
            donations.map((donation) => (
              <FeatureCard
                key={donation.id}
                title={donation.nome}
                description={donation.descricao}
                icon="volunteer-activism"
                onPress={() => (router as any).push({ pathname: '/donation/[id]', params: { id: donation.id } })}
              />
            ))
          )}
        </ThemedView>
      )}

      <ThemedView style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: colors.text }]}>💡 Dica: Entre em contato rapidamente para garantir sua doação!</ThemedText>
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
