import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';

const createJobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  budget: z.string().optional(),
});

type CreateJobFormValues = z.infer<typeof createJobSchema>;

export const CreateJobScreen = ({ navigation }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: undefined,
    },
  });

  const onSubmit = async (data: CreateJobFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post('/jobs', {
        title: data.title,
        description: data.description,
        budget: data.budget ? Number(data.budget) : undefined,
      });
      Alert.alert('Başarılı', 'İş ilanı başarıyla oluşturuldu.', [
        { 
          text: 'Tamam', 
          onPress: () => {
            reset();
            navigation.navigate('Home');
          } 
        }
      ]);
    } catch (error: any) {
      console.error("Create job error:", error.response?.data || error);
      Alert.alert('Hata', 'İş ilanı oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Yeni İlan Oluştur</Text>
      <Text style={styles.headerSubtitle}>İhtiyacınıza uygun yetenekleri bulmak için işinizin detaylarını paylaşın.</Text>

      <View style={styles.formCard}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="İş Başlığı"
              placeholder="Örn: React Native Geliştirici Aranıyor"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Açıklama"
              placeholder="İşin detaylarını, gereksinimleri ve beklentilerinizi yazın"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.description?.message}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          )}
        />

        <Controller
          control={control}
          name="budget"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Bütçe (Opsiyonel)"
              placeholder="Örn: 5000"
              keyboardType="numeric"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value?.toString() || ''}
              error={errors.budget?.message}
            />
          )}
        />

        <Button
          title={isSubmitting ? "Oluşturuluyor..." : "İlan Ver"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
