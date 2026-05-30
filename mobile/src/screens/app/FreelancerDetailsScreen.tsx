import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import {
  User as UserIcon,
  Star,
  Briefcase,
  FileText,
  ExternalLink,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react-native';

export const FreelancerDetailsScreen = ({ route, navigation }: any) => {
  const { freelancerId } = route.params;
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [freelancer, setFreelancer] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      try {
        setLoading(true);
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/freelancer/${freelancerId}`),
          api.get(`/reviews/freelancer/${freelancerId}`),
        ]);
        setFreelancer(profileRes.data);
        setReviewsData(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching freelancer profile:', error);
        Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndReviews();
  }, [freelancerId]);

  const handleStartChat = () => {
    if (!isAuthenticated) {
      Alert.alert('Giriş Gerekli', 'Mesaj gönderebilmek için önce giriş yapmalısınız.');
      return;
    }

    const isCustomer = user?.role === 'CUSTOMER';
    if (!isCustomer) {
      Alert.alert('Yetki Yetersiz', 'Sadece İşverenler mesajlaşma başlatabilir.');
      return;
    }

    Alert.alert('Bilgi', 'Sohbet özelliği yakında mobil uygulamamıza eklenecektir!');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!freelancer) {
    return (
      <View style={[styles.container, styles.center, { padding: spacing.lg }]}>
        <UserIcon size={64} color={colors.textSecondary} />
        <Text style={styles.errorTitle}>Profil Bulunamadı</Text>
        <Text style={styles.errorSub}>Aradığınız freelancer profiline ulaşılamadı.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const averageScore = reviewsData?.averageScore || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const reviews = reviewsData?.reviews || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profil Kartı (Sol Kolon benzeri mobil widget) */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          {freelancer.avatarUrl ? (
            <Image source={{ uri: freelancer.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarLetter}>
              {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : 'F'}
            </Text>
          )}
        </View>

        <Text style={styles.nameText}>{freelancer.name || 'İsimsiz'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>FREELANCER</Text>
        </View>

        {/* Rating Row */}
        <View style={styles.ratingSummaryRow}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                color={star <= Math.round(averageScore) ? colors.brutalYellow : '#cbd5e1'}
                fill={star <= Math.round(averageScore) ? colors.brutalYellow : 'transparent'}
                style={{ marginRight: 2 }}
              />
            ))}
          </View>
          <Text style={styles.avgScoreText}>
            {averageScore ? Number(averageScore).toFixed(1) : '0.0'} ({totalReviews} Yorum)
          </Text>
        </View>

        {freelancer.hourlyRate ? (
          <View style={styles.hourlyRateBadge}>
            <Text style={styles.hourlyRateText}>{freelancer.hourlyRate} ₺ / SAAT</Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.brutalBlue }]}
            onPress={handleStartChat}
          >
            <MessageSquare size={18} color="#fff" style={styles.btnIcon} />
            <Text style={[styles.actionBtnText, { color: '#fff' }]}>Mesaj Gönder</Text>
          </TouchableOpacity>

          {freelancer.portfolioUrl ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#fff' }]}
              onPress={() => Linking.openURL(freelancer.portfolioUrl)}
            >
              <ExternalLink size={18} color="#000" style={styles.btnIcon} />
              <Text style={[styles.actionBtnText, { color: '#000' }]}>Portfolyo</Text>
            </TouchableOpacity>
          ) : null}

          {isAuthenticated && user?.role === 'CUSTOMER' && freelancer.cvUrl ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.brutalPink }]}
              onPress={() => Linking.openURL(freelancer.cvUrl)}
            >
              <FileText size={18} color="#000" style={styles.btnIcon} />
              <Text style={[styles.actionBtnText, { color: '#000' }]}>CV'yi Görüntüle</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Hakkında Kartı */}
      <View style={[styles.infoCard, { backgroundColor: colors.brutalYellow }]}>
        <View style={styles.sectionHeader}>
          <FileText size={22} color="#000" />
          <Text style={styles.sectionTitle}>Hakkında</Text>
        </View>
        <Text style={styles.bioBody}>
          {freelancer.bio || 'Bu freelancer henüz kendisi hakkında bir bilgi eklememiş.'}
        </Text>
      </View>

      {/* Yetenekler Kartı */}
      {freelancer.skills && freelancer.skills.length > 0 ? (
        <View style={[styles.infoCard, { backgroundColor: colors.brutalPink }]}>
          <View style={styles.sectionHeader}>
            <Briefcase size={22} color="#000" />
            <Text style={styles.sectionTitle}>Yetenekler</Text>
          </View>
          <View style={styles.skillsWrapper}>
            {freelancer.skills.map((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              return (
                <View key={skill.id || skillName} style={styles.detailsSkillTag}>
                  <Text style={styles.detailsSkillTagText}>{skillName}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Değerlendirmeler Bölümü */}
      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsHeaderTitle}>
          Değerlendirmeler ({totalReviews})
        </Text>

        {reviews.length === 0 ? (
          <View style={styles.emptyReviewsCard}>
            <Star size={36} color="#cbd5e1" />
            <Text style={styles.emptyReviewsText}>Henüz değerlendirme yapılmamış.</Text>
          </View>
        ) : (
          reviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewJobTitle} numberOfLines={1}>
                  {review.job?.title || 'İsimsiz Proje'}
                </Text>
                <View style={styles.reviewScoreBadge}>
                  <Text style={styles.reviewScoreText}>{review.score}.0</Text>
                  <Star size={12} color="#000" fill={colors.brutalYellow} />
                </View>
              </View>
              <Text style={styles.reviewComment}>"{review.comment}"</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  errorSub: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  backBtn: {
    backgroundColor: '#000',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '900',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brutalYellow,
    borderWidth: 3,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000',
  },
  nameText: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
    color: '#000',
    marginBottom: spacing.xs,
  },
  roleBadge: {
    backgroundColor: '#000',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: spacing.xs,
    transform: [{ rotate: '-2deg' }],
    marginBottom: spacing.md,
  },
  roleBadgeText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  avgScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  hourlyRateBadge: {
    backgroundColor: '#86efac', // brutal green
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.xs,
    marginBottom: spacing.lg,
    transform: [{ rotate: '1deg' }],
  },
  hourlyRateText: {
    fontWeight: '900',
    fontSize: typography.sizes.md,
    color: '#000',
  },
  actionButtonsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  actionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: spacing.sm,
  },
  btnIcon: {
    marginRight: spacing.sm,
  },
  actionBtnText: {
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: typography.sizes.sm,
  },
  infoCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: colors.border,
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#000',
  },
  bioBody: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    fontWeight: '700',
    color: '#000',
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailsSkillTag: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: spacing.xs,
  },
  detailsSkillTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  reviewsSection: {
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  reviewsHeaderTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#000',
  },
  emptyReviewsCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyReviewsText: {
    marginTop: spacing.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewJobTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: '#000',
    flex: 1,
    marginRight: spacing.sm,
  },
  reviewScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.xs,
  },
  reviewScoreText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    marginRight: 4,
  },
  reviewComment: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.brutalYellow,
    paddingLeft: spacing.sm,
    lineHeight: 18,
  },
});
