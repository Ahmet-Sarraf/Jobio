import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { Briefcase, DollarSign, User, Calendar } from 'lucide-react-native';
import { Button } from '../../components/Button';

export const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Briefcase size={28} color={colors.primary} />
          <Text style={styles.title}>{job.title}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>İlan Detayları</Text>
        <Text style={styles.description}>{job.description}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <DollarSign size={20} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>Bütçe:</Text>
          <Text style={styles.infoValue}>{job.budget ? `${job.budget} TL` : 'Belirtilmedi'}</Text>
        </View>

        <View style={styles.infoRow}>
          <User size={20} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>Müşteri ID:</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {job.customerId || 'Bilinmiyor'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={20} color={colors.textSecondary} />
          <Text style={styles.infoLabel}>Tarih:</Text>
          <Text style={styles.infoValue}>
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
          </Text>
        </View>
      </View>

      {/* İleride "Başvur" veya benzeri aksiyon butonları eklenebilir */}
      <View style={styles.actionContainer}>
        <Button 
          title="Geri Dön" 
          variant="outline" 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
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
  header: {
    marginBottom: spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    marginLeft: 36, // icon width + margin
  },
  statusText: {
    color: '#34c759',
    fontWeight: '600',
    fontSize: typography.sizes.sm,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    width: 100,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
  backButton: {
    width: '100%',
  },
});
