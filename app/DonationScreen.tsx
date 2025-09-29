import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from "../firebaseConfig";

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import * as FileSystem from "expo-file-system/legacy";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { useAuth } from '@/contexts/AuthContext';


export default function DonationScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const router = useRouter();
  const { user } = useAuth();

  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

 const uriToBase64 = async (uri: string) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    return base64;
  } catch (error) {
    console.error("Erro ao converter imagem para Base64:", error);
    return null;
  }
};
  
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert(
            'Permissões Necessárias',
            'Precisamos de permissão para acessar a câmera e galeria para adicionar fotos.',
            [{ text: 'OK' }]
          );
        }
      }
    })();
  }, []);

  const showImagePickerOptions = () => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha como deseja adicionar a foto:',
      [
        {
          text: '📷 Câmera',
          onPress: () => takePhoto(),
        },
        {
          text: '🖼️ Galeria',
          onPress: () => pickImageFromGallery(),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        // Converte para Base64
        const base64 = await uriToBase64(newPhoto)
        if (base64) {
          setPhotos(prev => [...prev, base64]); // agora salva em base64
  }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir a câmera.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 2 - photos.length,
      });

      if (!result.canceled && result.assets) {
  const base64Photos = await Promise.all(result.assets.map(async (asset) => {return await uriToBase64(asset.uri);
    })
  );

      setPhotos(prev => [...prev, ...base64Photos.filter((p): p is string => Boolean(p))]);
}
    } catch {
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    }
  };

  const handleAddPhoto = () => {
    if (photos.length >= 2) {
      Alert.alert('Limite Atingido', 'Você já adicionou o máximo de 2 fotos.');
      return;
    }
    showImagePickerOptions();
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive', 
          onPress: () => setPhotos(photos.filter((_, i) => i !== index))
        },
      ]
    );
  };

  const handleSubmitDonation = async () => {
  if (!foodName.trim()) {
    Alert.alert("Erro", "Por favor, informe o nome do alimento.");
    return;
  }

  if (!description.trim()) {
    Alert.alert("Erro", "Por favor, adicione uma descrição.");
    return;
  }

  try {
  
    await addDoc(collection(db, "doacoes"), {
      nome: foodName,
      descricao: description,
      fotos: photos, 
      criadoEm: serverTimestamp(),
      uid: user?.id || null,
    });

    Alert.alert(
      "Sucesso!",
      `Sua doação foi cadastrada com sucesso! ${
        photos.length > 0
          ? `(${photos.length} foto${photos.length > 1 ? "s" : ""} incluída${
              photos.length > 1 ? "s" : ""
            })`
          : ""
      } Em breve ela estará disponível para quem precisa.`,
      [
        {
          text: "OK",
          onPress: () => {
          
            setFoodName("");
            setDescription("");
            setPhotos([]);
            
            router.back();
          },
        },
      ]
    );
  } catch (error) {
    console.error("Erro ao salvar doação:", error);
    Alert.alert("Erro", "Não foi possível cadastrar sua doação. Tente novamente.");
  }
};

  const handleGoBack = () => {
    if (foodName.trim() || description.trim() || photos.length > 0) {
      Alert.alert(
        'Sair sem salvar',
        'Você tem alterações não salvas. Deseja sair mesmo assim?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
     
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <ThemedText type="title" style={[styles.headerTitle, { color: colors.primary }]}>
          Nova Doação
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
            Informações do Alimento
          </ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
              Nome do Alimento *
            </ThemedText>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="Ex: Arroz, Feijão, Macarrão..."
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
              Descrição *
            </ThemedText>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o alimento, quantidade, validade, condições de conservação..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <ThemedText style={[styles.characterCount, { color: colors.textSecondary }]}>
              {description.length}/500
            </ThemedText>
          </View>
        </ThemedView>


        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
            Fotos do Alimento
          </ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Adicione fotos para ajudar quem receberá a doação a identificar o produto
          </ThemedText>

          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.photo} />
                <TouchableOpacity
                  style={[styles.removePhotoButton, { backgroundColor: colors.error }]}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 5 && (
              <TouchableOpacity
                style={[styles.addPhotoButton, { borderColor: colors.primary }]}
                onPress={handleAddPhoto}
              >
                <MaterialIcons name="add-a-photo" size={32} color={colors.primary} />
                <ThemedText style={[styles.addPhotoText, { color: colors.primary }]}>
                  Adicionar Foto
                </ThemedText>
                <ThemedText style={[styles.photoCount, { color: colors.textSecondary }]}>
                  {photos.length}/2
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <ThemedText style={[styles.photoLimit, { color: colors.textSecondary }]}>
            Máximo de 2 fotos • Toque para adicionar da câmera ou galeria
          </ThemedText>
        </ThemedView>


        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmitDonation}
          activeOpacity={0.8}
        >
          <MaterialIcons name="volunteer-activism" size={24} color="white" />
          <ThemedText style={styles.submitButtonText}>
            Cadastrar Doação
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  photoCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  photoLimit: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginTop: 20,
    gap: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
