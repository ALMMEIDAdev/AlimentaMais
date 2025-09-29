import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';

type Donation = {
  id: string;
  nome: string;
  descricao: string;
  fotos?: string[];
  criadoEm?: { seconds: number; nanoseconds: number } | null;
};

export default function DonationHistoryScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();
  const { user } = useAuth();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const q = user?.id
          ? query(collection(db, 'doacoes'), where('uid', '==', user.id))
          : query(collection(db, 'doacoes'));
        const snapshot = await getDocs(q);
        const items: Donation[] = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }))
          .sort((a, b) => {
            const ta = (a as any).criadoEm?.seconds || 0;
            const tb = (b as any).criadoEm?.seconds || 0;
            return tb - ta;
          });
        setDonations(items);
      } catch (e) {
        console.error('Erro ao carregar histórico de doações:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [user?.id]);

  const renderItem = ({ item }: { item: Donation }) => {
    const createdAt = item.criadoEm
      ? new Date((item.criadoEm as any).seconds * 1000).toLocaleString('pt-BR')
      : '—';
    const thumb = item.fotos && item.fotos.length > 0 ? item.fotos[0] : null;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => (router as any).push({ pathname: '/donation/[id]', params: { id: item.id } })}
        style={[styles.card, { borderColor: colors.border, backgroundColor: 'rgba(0,0,0,0.02)' }]}
      >
        <View style={styles.cardRow}>
          {thumb ? (
            <Image source={{ uri: thumb.startsWith('data:') ? thumb : `data:image/jpeg;base64,${thumb}` }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, { backgroundColor: colors.primary, opacity: 0.2 }]} />
          )}
          <View style={styles.cardBody}>
            <ThemedText type="subtitle" style={{ color: colors.text }} numberOfLines={1}>
              {item.nome}
            </ThemedText>
            <ThemedText style={{ color: colors.textSecondary }} numberOfLines={2}>
              {item.descricao}
            </ThemedText>
            <ThemedText style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
              {createdAt}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSide}>
          <ThemedText style={{ color: colors.primary }} numberOfLines={1}>{'< Voltar'}</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>
          Histórico de Doações
        </ThemedText>
        <View style={styles.headerSide} />
      </View>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={{ marginTop: 8, color: colors.text }}>Carregando...</ThemedText>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          data={donations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <ThemedText style={{ textAlign: 'center', color: colors.textSecondary }}>
              Você ainda não possui doações cadastradas.
            </ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerSide: {
    width: 80,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  loadingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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


