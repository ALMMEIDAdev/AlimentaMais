
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebaseConfig';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  cpf?: string;
  cep?: string;
  city?: string;
  street?: string;
  neighborhood?: string;
  addressComplement?: string;
  birthDate?: string;
  createdAt?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  photoURL?: string;
}

export default function ProfileScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [lastFetchedCep, setLastFetchedCep] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  // Busca automática de endereço via CEP (ViaCEP)
  useEffect(() => {
    const cep = editedProfile?.cep;
    if (!isEditing || !cep || cep.length !== 8 || cep === lastFetchedCep) return;

    const fetchAddress = async () => {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data?.erro) {
          Alert.alert('CEP inválido', 'Não encontramos este CEP. Verifique e tente novamente.');
          return;
        }
        setEditedProfile(prev => prev ? {
          ...prev,
          city: data?.localidade || prev.city,
          street: data?.logradouro || prev.street,
          neighborhood: data?.bairro || prev.neighborhood,
        } : prev);
        setLastFetchedCep(cep);
      } catch (e) {
        console.error('Erro ao buscar CEP:', e);
      }
    };

    fetchAddress();
  }, [isEditing, editedProfile?.cep, lastFetchedCep]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile(userData);
        setEditedProfile(userData);
      } else {
        // Se não existe no Firestore, criar com dados básicos
        const basicProfile: UserProfile = {
          uid: user.id,
          name: user.name,
          email: user.email,
          emailVerified: false,
          profileComplete: false,
          createdAt: new Date().toISOString(),
        };
        setProfile(basicProfile);
        setEditedProfile(basicProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil do usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedProfile || !user) return;

    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        ...editedProfile,
        updatedAt: new Date().toISOString(),
      });
      
      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !user?.email) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Atenção', 'Preencha todos os campos de senha.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Atenção', 'A confirmação de senha não confere.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      const message = error?.message || 'Não foi possível alterar a senha.';
      Alert.alert('Erro', message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>
          Carregando perfil...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.errorText, { color: colors.text }]}>
          Erro ao carregar perfil
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="title" style={[styles.title, { color: colors.primary }]}>
            Meu Perfil
          </ThemedText>
          
        </View>

        <View style={styles.profileImageContainer}>
          {profile.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <MaterialIcons name="person" size={60} color="white" />
            </View>
          )}
        </View>

        <ThemedText type="subtitle" style={[styles.userName, { color: colors.text }]}>
          {profile.name}
        </ThemedText>
        
        <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
          {profile.email}
        </ThemedText>

        {profile.emailVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={16} color={colors.secondary} />
            <ThemedText style={[styles.verifiedText, { color: colors.secondary }]}>
              Email verificado
            </ThemedText>
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>
          Informações Pessoais
        </ThemedText>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Nome Completo</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {profile.name}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Email</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {profile.email}
            </ThemedText>
          </View>

          {profile.cpf && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>CPF</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {formatCPF(profile.cpf)}
              </ThemedText>
            </View>
          )}

          {profile.birthDate && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Data de Nascimento</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(profile.birthDate)}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary, marginTop: 0 }]}>
            Endereço
          </ThemedText>
          {!isEditing ? (
            <TouchableOpacity onPress={handleEdit} style={styles.inlineEditButton}>
              <MaterialIcons name="edit" size={22} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <MaterialIcons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <MaterialIcons name="check" size={22} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>CEP</ThemedText>
            {isEditing ? (
              <TextInput
                keyboardType="number-pad"
                maxLength={9}
                style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
                value={formatCEP(editedProfile?.cep || '')}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '').slice(0, 8);
                  setEditedProfile(prev => prev ? { ...prev, cep: digits } : null);
                }}
                placeholder="Seu CEP"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {profile.cep ? formatCEP(profile.cep) : '—'}
              </ThemedText>
            )}
          </View>

          {profile.city && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Cidade</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
                  value={editedProfile?.city || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, city: text } : null)}
                  placeholder="Sua cidade"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {profile.city}
                </ThemedText>
              )}
            </View>
          )}

          {profile.street && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Rua</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
                  value={editedProfile?.street || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, street: text } : null)}
                  placeholder="Sua rua"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {profile.street}
                </ThemedText>
              )}
            </View>
          )}

          {profile.neighborhood && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Bairro</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
                  value={editedProfile?.neighborhood || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, neighborhood: text } : null)}
                  placeholder="Seu bairro"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {profile.neighborhood}
                </ThemedText>
              )}
            </View>
          )}

          {profile.addressComplement && (
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Complemento</ThemedText>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
                  value={editedProfile?.addressComplement || ''}
                  onChangeText={(text) => setEditedProfile(prev => prev ? { ...prev, addressComplement: text } : null)}
                  placeholder="Complemento (opcional)"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {profile.addressComplement}
                </ThemedText>
              )}
            </View>
          )}
        </View>

        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.primary }]}>Segurança</ThemedText>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Senha atual</ThemedText>
            <TextInput
              secureTextEntry
              style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Nova senha</ThemedText>
            <TextInput
              secureTextEntry
              style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Digite a nova senha"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Confirmar nova senha</ThemedText>
            <TextInput
              secureTextEntry
              style={[styles.textInput, { borderColor: colors.primary, color: colors.text }]}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirme a nova senha"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TouchableOpacity onPress={handleChangePassword} style={styles.saveButton} disabled={isUpdatingPassword}>
            {isUpdatingPassword ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="lock" size={20} color={colors.secondary} />
                <ThemedText style={{ marginLeft: 8, color: colors.secondary }}>Atualizar Senha</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {profile.createdAt && (
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
              Membro desde {formatDate(profile.createdAt)}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  editButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    padding: 8,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  inlineEditButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
