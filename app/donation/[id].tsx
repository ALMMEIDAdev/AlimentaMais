import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { db } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DonationData {
  nome: string;
  descricao: string;
  fotos?: string[];
  criadoEm?: Timestamp | { seconds: number; nanoseconds: number } | null;
}

export default function DonationDetailsScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<(DonationData & { id: string }) | null>(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadDonation = async () => {
      if (!id) return;
      try {
        const ref = doc(db, 'doacoes', String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as DonationData;
          setDonation({ id: String(id), ...data });
        } else {
          setDonation(null);
        }
      } catch (e) {
        console.error('Erro ao carregar doação:', e);
        setDonation(null);
      } finally {
        setLoading(false);
      }
    };
    loadDonation();
  }, [id]);

  const createdAtText = useMemo(() => {
    if (!donation?.criadoEm) return null;
    try {
      const ts = donation.criadoEm as Timestamp | { seconds: number; nanoseconds: number };
      const date = ts instanceof Timestamp ? ts.toDate() : new Date((ts.seconds || 0) * 1000);
      return date.toLocaleString();
    } catch {
      return null;
    }
  }, [donation?.criadoEm]);

  const openPreview = (base64: string) => {
    setPreviewPhoto(base64);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewPhoto(null);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!donation) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: colors.background }]}>
        <ThemedText style={{ color: colors.text }}>Doação não encontrada.</ThemedText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={{ color: colors.primary }}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
          Detalhes da Doação
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={[styles.title, { color: colors.text }]}>
            {donation.nome}
          </ThemedText>
          {createdAtText && (
            <ThemedText style={[styles.meta, { color: colors.textSecondary }]}>Criado em {createdAtText}</ThemedText>
          )}
          <ThemedText style={[styles.description, { color: colors.text }]}>
            {donation.descricao}
          </ThemedText>
        </ThemedView>

        {!!donation.fotos?.length && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={[styles.subtitle, { color: colors.primary }]}>
              Fotos
            </ThemedText>
            <View style={styles.photosContainer}>
              {donation.fotos.map((base64, idx) => (
                <TouchableOpacity key={idx} activeOpacity={0.8} onPress={() => openPreview(base64)}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${base64}` }}
                    style={styles.photo}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        )}
      </ScrollView>

      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalBackdropTouchable} activeOpacity={1} onPress={closePreview} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            {!!previewPhoto && (
              <Image
                source={{ uri: `data:image/jpeg;base64,${previewPhoto}` }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={closePreview}>
              <MaterialIcons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  meta: {
    fontSize: 12,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  backBtn: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdropTouchable: {
    ...StyleSheet.absoluteFillObject as any,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 3/4,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 16,
  },
});
