import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      
      const { session } = response.data;
      const token = session.access_token;
      const userObj = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.user_role || null,
        avatarUrl: null as string | null,
        cvUrl: null as string | null,
      };

      // Önce temel auth bilgisini kaydet
      await setAuth(userObj, token);

      // Ardından backend'den DB'deki güncel profil verisini çek (avatarUrl, cvUrl)
      try {
        const profileRes = await api.get('/users/me');
        await updateUserProfile({
          avatarUrl: profileRes.data.avatarUrl ?? undefined,
          cvUrl: profileRes.data.cvUrl ?? undefined,
          name: profileRes.data.name ?? undefined,
        });
      } catch {
        // Profil çekilemezse sessizce devam et
      }
      
    } catch (error: any) {
      console.log('Login Error: ', error.response?.data || error.message);
      Alert.alert(
        'Giriş Başarısız',
        error.response?.data?.message || 'E-posta veya şifre hatalı, lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Jobio'ya Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Devam etmek için giriş yapın</Text>
        </View>

        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-posta"
                placeholder="ornek@sirket.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Mail color={colors.textSecondary} size={20} />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Şifre"
                placeholder="********"
                secureTextEntry
                icon={<Lock color={colors.textSecondary} size={20} />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Giriş Yap"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınız yok mu? </Text>
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Kayıt Ol
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  headerContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  button: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.sizes.md,
  },
});
