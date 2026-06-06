import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import {
  Briefcase,
  DollarSign,
  User as UserIcon,
  Calendar,
  CheckCircle,
  Clock,
  Building,
  ArrowLeft,
  Send,
  Tag,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react-native';

const SKILL_COLORS = [
  colors.brutalYellow,
  colors.brutalPink,
  '#86efac', // brutal green
  '#93c5fd', // light brutal blue
  '#fdba74', // light brutal orange
  '#c084fc', // brutal purple
];

export const JobDetailsScreen = ({ route, navigation }: any) => {
  const { job: routeJob } = route.params;
  const user = useAuthStore((state) => state.user);

  const [job, setJob] = useState<any>(routeJob);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${routeJob.id}`);
      setJob(response.data);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationStatus = async () => {
    if (user?.role !== 'FREELANCER') return;
    try {
      const response = await api.get(`/jobs/${routeJob.id}/application-status`);
      setHasApplied(response.data.hasApplied);
      setApplicationStatus(response.data.status ?? null);
    } catch (err) {
      console.error('Failed to fetch application status:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchJobDetails(), fetchApplicationStatus()]);
  }, [routeJob.id]);

  const handleApplyOpen = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (user.role === 'CUSTOMER') {
      Alert.alert('Hata', 'İşverenler iş ilanlarına başvuru yapamaz.');
      return;
    }
    if (!user.cvUrl) {
      Alert.alert(
        'CV Eksik',
        'Bu ilana başvurabilmek için profilinizden CV yüklemeniz gerekmektedir.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Profilime Git', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async () => {
    if (!coverLetter.trim()) {
      Alert.alert('Hata', 'Lütfen geçerli bir ön yazı girin.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/jobs/${routeJob.id}/apply`, { coverLetter });
      setIsApplyModalOpen(false);
      setHasApplied(true);
      setApplicationStatus('PENDING');
      Alert.alert('Tebrikler!', 'İlana başarıyla başvuru yaptınız.');
      setCoverLetter('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Başvuru sırasında bir hata oluştu.';
      Alert.alert('Hata', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelApplication = async () => {
    Alert.alert(
      'Başvuruyu İptal Et',
      'Başvurunuzu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await api.delete(`/jobs/${routeJob.id}/apply`);
              setHasApplied(false);
              setApplicationStatus(null);
              Alert.alert('İptal Edildi', 'Başvurunuz başarıyla iptal edildi.');
            } catch (err: any) {
              Alert.alert('Hata', err.response?.data?.message || 'İptal işlemi sırasında hata oluştu.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Back Link */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={16} color="#000" />
        <Text style={styles.backBtnText}>Geri Dön</Text>
      </TouchableOpacity>

      {/* Kabul Edildi Banner */}
      {applicationStatus === 'ACCEPTED' && (
        <View style={styles.acceptedBanner}>
          <CheckCircle size={24} color="#000" />
          <View style={{ flex: 1 }}>
            <Text style={styles.acceptedBannerTitle}>BU İLANA KABUL EDİLDİNİZ!</Text>
            <Text style={styles.acceptedBannerSub}>İşveren başvurunuzu onayladı. İyi çalışmalar!</Text>
          </View>
        </View>
      )}

      {/* Main Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.headerBadgesRow}>
          <View
            style={[
              styles.statusBadge,
              job.status === 'OPEN' && { backgroundColor: '#86efac' },
              job.status === 'IN_PROGRESS' && { backgroundColor: colors.brutalBlue },
              job.status === 'COMPLETED' && { backgroundColor: '#cbd5e1' },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                job.status === 'IN_PROGRESS' && { color: '#fff' },
              ]}
            >
              {job.status === 'OPEN' ? 'AÇIK BAŞVURU' : job.status === 'IN_PROGRESS' ? 'DEVAM EDİYOR' : job.status === 'COMPLETED' ? 'TAMAMLANDI' : job.status}
            </Text>
          </View>

          <View style={styles.dateBadge}>
            <Clock size={12} color="#000" />
            <Text style={styles.dateBadgeText}>
              {new Date(job.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <Text style={styles.jobTitle}>{job.title}</Text>

        {/* Categories / Experience / Duration Badges */}
        <View style={styles.metaBadgesWrapper}>
          {job.category && (
            <View style={[styles.metaItemBadge, { backgroundColor: '#93c5fd' }]}>
              <Briefcase size={14} color="#000" />
              <Text style={styles.metaItemText}>{job.category}</Text>
            </View>
          )}
          {job.experienceLevel && (
            <View style={[styles.metaItemBadge, { backgroundColor: colors.brutalYellow }]}>
              <Text style={styles.metaItemText}>Deneyim: {job.experienceLevel}</Text>
            </View>
          )}
          {job.duration && (
            <View style={[styles.metaItemBadge, { backgroundColor: colors.brutalPink }]}>
              <Text style={styles.metaItemText}>Süre: {job.duration}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Description Section */}
        <Text style={styles.sectionTitle}>İş Tanımı ve Kapsam</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        <View style={styles.divider} />

        {/* Required Skills */}
        <Text style={styles.sectionTitle}>Aranan Yetenekler</Text>
        {job.requiredSkills && job.requiredSkills.length > 0 ? (
          <View style={styles.skillsContainer}>
            {job.requiredSkills.map((skill: any, idx: number) => (
              <View
                key={skill.id}
                style={[
                  styles.skillChip,
                  { backgroundColor: SKILL_COLORS[idx % SKILL_COLORS.length] },
                ]}
              >
                <Text style={styles.skillChipText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noSkillsText}>Bu ilan için özel bir yetenek belirtilmemiş.</Text>
        )}
      </View>

      {/* Sidebar: Budget & Actions Card */}
      <View style={styles.sidebarCard}>
        {/* Budget info */}
        <View style={styles.budgetBox}>
          <Text style={styles.budgetLabel}>PROJE BÜTÇESİ</Text>
          {job.budget ? (
            <View style={styles.budgetValWrapper}>
              <Text style={styles.budgetValue}>{job.budget.toLocaleString('tr-TR')}</Text>
              <Text style={styles.budgetCurrency}> ₺</Text>
            </View>
          ) : (
            <Text style={styles.openBudgetVal}>Teklife Açık</Text>
          )}
        </View>

        {/* Action Button */}
        {isCustomer ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>İŞVERENLER BAŞVURU YAPAMAZ.</Text>
          </View>
        ) : (applicationStatus === 'ACCEPTED' || applicationStatus === 'REJECTED' || applicationStatus === 'COMPLETED') ? (
          <View
            style={[
              styles.completedStatusBanner,
              applicationStatus === 'ACCEPTED' && { backgroundColor: '#dcfce7' },
              applicationStatus === 'REJECTED' && { backgroundColor: '#fee2e2' },
            ]}
          >
            <Text style={styles.completedStatusTitle}>BU İLANA BAŞVURUNUZ SONUÇLANMIŞTIR</Text>
            <View
              style={[
                styles.completedStatusBadge,
                applicationStatus === 'ACCEPTED' && { backgroundColor: colors.success },
                applicationStatus === 'REJECTED' && { backgroundColor: colors.brutalRed },
                applicationStatus === 'COMPLETED' && { backgroundColor: '#cbd5e1' },
              ]}
            >
              <Text style={[styles.completedStatusBadgeText, applicationStatus === 'REJECTED' && { color: '#fff' }]}>
                {applicationStatus === 'ACCEPTED' ? '✓ Kabul Edildi' : applicationStatus === 'COMPLETED' ? '✓ İş Tamamlandı' : '✕ Reddedildi'}
              </Text>
            </View>
          </View>
        ) : hasApplied && job.status === 'OPEN' ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelApplication}
            disabled={isSubmitting}
          >
            <Trash2 size={16} color="#000" />
            <Text style={styles.cancelBtnText}>
              {isSubmitting ? 'İPTAL EDİLİYOR...' : 'BAŞVURUYU İPTAL ET'}
            </Text>
          </TouchableOpacity>
        ) : hasApplied && job.status !== 'OPEN' ? (
          <View style={styles.closedStatusBanner}>
            <Text style={styles.closedStatusText}>İlan artık başvuruya kapalı</Text>
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>
                {job.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Tamamlandı'}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApplyOpen}
            disabled={job.status !== 'OPEN' || isSubmitting}
          >
            <Send size={16} color="#fff" />
            <Text style={styles.applyBtnText}>
              {job.status === 'OPEN' ? 'HEMEN BAŞVUR' : 'BAŞVURUYA KAPALI'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {/* Employer Info */}
        <Text style={styles.sectionLabelTitle}>
          <Building size={16} color="#000" /> İşveren Bilgileri
        </Text>

        <View style={styles.employerRow}>
          {job.customer?.user?.avatarUrl ? (
            <Image
              source={{ uri: job.customer.user.avatarUrl }}
              style={styles.employerAvatar}
            />
          ) : (
            <View style={styles.employerAvatarPlaceholder}>
              <Text style={styles.employerAvatarText}>
                {job.customer?.user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.employerName}>{job.customer?.user?.name || 'Gizli Kullanıcı'}</Text>
            {job.customer?.company && (
              <Text style={styles.employerCompany}>{job.customer.company}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Kayıt Tarihi</Text>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>MAYIS 2026</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tamamlanan İş</Text>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>0</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cover Letter Modal */}
      <Modal
        visible={isApplyModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsApplyModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setIsApplyModalOpen(false)}
              style={styles.closeModalBtn}
            >
              <X size={20} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Başvuru Yap</Text>

            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.inputLabel}>Ön Yazı (Cover Letter)</Text>
              <TextInput
                multiline
                numberOfLines={6}
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="İşverene neden bu iş için en uygun kişi olduğunuzu detaylıca anlatın..."
                style={styles.modalTextArea}
                placeholderTextColor={colors.textSecondary}
              />

              <Button
                title={isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                onPress={handleApplySubmit}
                loading={isSubmitting}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backBtnText: {
    fontWeight: '800',
    fontSize: 12,
    marginLeft: 6,
    color: '#000',
    textTransform: 'uppercase',
  },
  acceptedBanner: {
    backgroundColor: '#86efac',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    transform: [{ rotate: '-1deg' }],
  },
  acceptedBannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000',
  },
  acceptedBannerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: '#fefcf8',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    elevation: 4,
  },
  headerBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e2e8f0',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  jobTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  metaBadgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
  },
  metaItemText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  divider: {
    height: 3,
    backgroundColor: '#000',
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  descriptionBox: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    padding: spacing.md,
    borderRadius: 6,
    shadowColor: '#ffc900',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 2,
    transform: [{ rotate: '-0.5deg' }],
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  skillChip: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
  },
  skillChipText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  noSkillsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#f1f5f9',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sidebarCard: {
    backgroundColor: '#fefcf8',
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 8,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    elevation: 4,
  },
  budgetBox: {
    backgroundColor: '#86efac',
    borderWidth: 3,
    borderColor: '#000',
    padding: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    transform: [{ rotate: '1deg' }],
  },
  budgetLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  budgetValWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  budgetValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    lineHeight: 32,
  },
  budgetCurrency: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  openBudgetVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  errorAlert: {
    backgroundColor: colors.brutalRed,
    borderWidth: 3,
    borderColor: '#000',
    padding: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    transform: [{ rotate: '-1deg' }],
  },
  errorAlertText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brutalBlue,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 3,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brutalPink,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 3,
  },
  cancelBtnText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  completedStatusBanner: {
    borderWidth: 3,
    borderColor: '#000',
    padding: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
  },
  completedStatusTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
  },
  completedStatusBadge: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completedStatusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  closedStatusBanner: {
    backgroundColor: '#e2e8f0',
    borderWidth: 3,
    borderColor: '#000',
    padding: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
  },
  closedStatusText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  closedBadge: {
    backgroundColor: '#94a3b8',
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },
  sectionLabelTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: spacing.sm,
    borderRadius: 6,
    shadowColor: '#ffc900',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    marginBottom: spacing.md,
  },
  employerAvatar: {
    width: 48,
    height: 48,
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 4,
    resizeMode: 'cover',
  },
  employerAvatarPlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: colors.brutalYellow,
    borderWidth: 2.5,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employerAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  employerName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  employerCompany: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statsCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 2.5,
    borderColor: '#000',
    padding: spacing.sm,
    borderRadius: 6,
    gap: 8,
    shadowColor: colors.brutalBlue,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    transform: [{ rotate: '-0.5deg' }],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  statBadge: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  statBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: 8,
    padding: spacing.lg,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 5,
  },
  closeModalBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
    backgroundColor: colors.brutalPink,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  modalTextArea: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 6,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: '#000',
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
});
