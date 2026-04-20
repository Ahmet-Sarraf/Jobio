import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { User, Mail, Camera, FileText } from 'lucide-react-native';
import { supabase } from '../../services/supabase';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  const getFileExt = (uri: string) => {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
    return ext;
  };

  const uploadToSupabase = async (bucket: string, path: string, uri: string, contentType: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), { contentType, upsert: true });

      if (error) throw error;
      
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  };

  const deleteOldFile = async (bucket: string, oldUrl?: string | null) => {
    if (!oldUrl) return;
    try {
      const pathSegment = `/public/${bucket}/`;
      const pathIndex = oldUrl.indexOf(pathSegment);
      if (pathIndex !== -1) {
        const filePath = oldUrl.substring(pathIndex + pathSegment.length);
        if (filePath) {
          await supabase.storage.from(bucket).remove([filePath]);
        }
      }
    } catch (error) {
      console.log('Old file deletion error:', error);
    }
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user?.id) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        const ext = getFileExt(asset.uri);
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const contentType = asset.mimeType || `image/${ext}`;

        const publicUrl = await uploadToSupabase('avatars', fileName, asset.uri, contentType);
        await deleteOldFile('avatars', user?.avatarUrl);
        await updateUserProfile({ avatarUrl: publicUrl });
        // DB'ye kaydet — tüm cihazlar görebilsin
        await api.patch('/users/me', { avatarUrl: publicUrl });
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0] && user?.id) {
        setIsUploadingCV(true);
        const asset = result.assets[0];
        const ext = getFileExt(asset.uri);
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const contentType = asset.mimeType || 'application/pdf';

        const publicUrl = await uploadToSupabase('documents', fileName, asset.uri, contentType);
        await deleteOldFile('documents', user?.cvUrl);
        await updateUserProfile({ cvUrl: publicUrl });
        // DB'ye kaydet — tüm cihazlar görebilsin
        await api.patch('/users/me', { cvUrl: publicUrl });
        Alert.alert('Başarılı', 'CV başarıyla yüklendi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'CV yüklenemedi.');
    } finally {
      setIsUploadingCV(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {isUploadingAvatar ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={64} color={colors.primary} />
            )}
          </View>
          <Button
             title=""
             variant="primary"
             onPress={pickAvatar}
             style={styles.avatarEditButton}
             disabled={isUploadingAvatar}
             icon={<Camera size={20} color="#fff" />}
          />
        </View>

        <Text style={styles.title}>Hoş Geldiniz,</Text>
        <View style={styles.infoRow}>
          <Mail size={18} color={colors.textSecondary} />
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Text style={styles.idText}>ID: {user?.id}</Text>
      </View>

      <View style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Belgeleriniz</Text>
        <View style={styles.cvRow}>
          <View style={styles.cvInfo}>
            <FileText size={24} color={user?.cvUrl ? colors.primary : colors.textSecondary} />
            <Text style={[styles.cvText, user?.cvUrl && styles.cvTextActive]} numberOfLines={1}>
              {user?.cvUrl ? 'CV Yüklendi (Değiştirmek için tıkla)' : 'Henüz CV yüklemediniz...'}
            </Text>
          </View>
          {isUploadingCV ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Button
              title={user?.cvUrl ? "Değiştir" : "Yükle"}
              variant="outline"
              onPress={pickCV}
              disabled={isUploadingCV}
            />
          )}
        </View>
      </View>

      <Button
        title="Çıkış Yap"
        variant="outline"
        onPress={() => logout()}
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    flexGrow: 1,
    backgroundColor: colors.surface,
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  idText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontFamily: 'monospace',
  },
  actionCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
  },
  cvInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  cvText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  cvTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: spacing.xl,
  },
});
