import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { db } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
    >
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
            donations.map((donation: any) => {
              const createdAt = donation.criadoEm?.seconds
                ? new Date(donation.criadoEm.seconds * 1000).toLocaleString('pt-BR')
                : null;
              const thumb = donation.fotos && donation.fotos.length > 0 ? donation.fotos[0] : null;
              return (
                <TouchableOpacity
                  key={donation.id}
                  activeOpacity={0.85}
                  onPress={() => (router as any).push({ pathname: '/donation/[id]', params: { id: donation.id } })}
                  style={[styles.card, { borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.02)' }]}
                >
                  <View style={styles.cardRow}>
                    {thumb ? (
                      <Image source={{ uri: (typeof thumb === 'string' && thumb.startsWith('data:')) ? thumb : `data:image/jpeg;base64,${thumb}` }} style={styles.thumb} />
                    ) : (
                      <View style={[styles.thumb, { backgroundColor: colors.primary, opacity: 0.2 }]} />
                    )}
                    <View style={styles.cardBody}>
                      <ThemedText type="subtitle" style={{ color: colors.text }} numberOfLines={1}>
                        {donation.nome}
                      </ThemedText>
                      <ThemedText style={{ color: colors.textSecondary }} numberOfLines={2}>
                        {donation.descricao}
                      </ThemedText>
                      {createdAt && (
                        <ThemedText style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                          {createdAt}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
    paddingTop: 8,
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
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
});
