import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { Sparkles, User as UserIcon, Briefcase, ChevronRight } from 'lucide-react-native';

const CARD_COLORS = [
  colors.brutalPink,
  '#86efac', // brutal green
  '#93c5fd', // brutal blue
  '#fdba74', // brutal orange
  '#c084fc', // brutal purple
];

export const MatchmakingScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [customerJobs, setCustomerJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    if (isCustomer) {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      const openJobs = res.data.filter((job: any) => job.status === 'OPEN');
      setCustomerJobs(openJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const matchFreelancers = async (jobId: string) => {
    setLoading(true);
    setHasSearched(false);
    setSelectedJob(jobId);
    setMatches([]);
    try {
      const res = await api.get(`/ai/match-freelancers/${jobId}`);
      setMatches(res.data);
    } catch (error: any) {
      console.error('AI match failed:', error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const matchJobsForMe = async () => {
    setLoading(true);
    setHasSearched(false);
    setMatches([]);
    try {
      const res = await api.get('/ai/match-jobs');
      setMatches(res.data);
    } catch (error: any) {
      console.error('AI match failed:', error);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const renderFreelancerMatch = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.card, { backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar as any} />
            ) : (
              <UserIcon size={24} color={colors.text} />
            )}
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name || 'Freelancer'}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>%{item.matchScore}</Text>
        </View>
      </View>
      
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>NEDEN UYGUN?</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('FreelancerDetails', { freelancerId: item.freelancerId })}
      >
        <Text style={styles.actionButtonText}>PROFİLİ GÖSTER</Text>
        <ChevronRight size={18} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );

  const renderJobMatch = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.card, { backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Briefcase size={20} color={colors.text} />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'İş İlanı'}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>%{item.matchScore}</Text>
        </View>
      </View>
      
      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>NEDEN UYGUN?</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('JobDetails', { job: { id: item.jobId } })}
      >
        <Text style={styles.actionButtonText}>İLANI İNCELE</Text>
        <ChevronRight size={18} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isCustomer ? (
        <FlatList
          data={matches}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderFreelancerMatch}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>AÇIK İLANLARINIZ</Text>
              {customerJobs.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>
                    Hiç açık ilanınız bulunmuyor. Eşleştirme yapabilmek için önce bir ilan oluşturun.
                  </Text>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.jobsList}
                >
                  {customerJobs.map((job) => (
                    <TouchableOpacity
                      key={job.id}
                      style={[
                        styles.jobTabButton,
                        selectedJob === job.id && styles.jobTabButtonActive
                      ]}
                      onPress={() => matchFreelancers(job.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.jobTabButtonText,
                        selectedJob === job.id && styles.jobTabButtonTextActive
                      ]}>
                        {job.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {loading && <BrutalAiLoader />}
              {!loading && hasSearched && matches.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    BU İLAN İÇİN UYGUN ADAY BULUNAMADI.
                  </Text>
                </View>
              )}
              {!loading && matches.length > 0 && (
                <Text style={styles.sectionTitle}>ÖNERİLEN FREELANCERLAR</Text>
              )}
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderJobMatch}
          ListHeaderComponent={
            <View style={styles.headerCenter}>
              <TouchableOpacity
                style={styles.findJobsButton}
                onPress={matchJobsForMe}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Sparkles size={24} color={colors.text} style={styles.sparkleIcon} />
                <Text style={styles.findJobsButtonText}>
                  BANA UYGUN İŞLERİ BUL
                </Text>
              </TouchableOpacity>
              {loading && <BrutalAiLoader />}
              {!loading && hasSearched && matches.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    PROFİLİNİZE UYGUN AÇIK İLAN BULUNAMADI.
                  </Text>
                </View>
              )}
              {!loading && matches.length > 0 && (
                <Text style={styles.sectionTitle}>SENİN İÇİN SEÇTİĞİMİZ İLANLAR</Text>
              )}
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
};

const BrutalAiLoader = () => {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const loadingTexts = [
    'Yapay Zeka Profilleri İnceliyor...',
    'Eşleşme Puanları Hesaplanıyor...',
    'Adayların Yetenekleri Analiz Ediliyor...',
    'Sihirli Eşleşmeler Hazırlanıyor...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderBox}>
        <Animated.View style={[styles.loaderSpinnerContainer, { transform: [{ rotate: spin }] }]}>
          <Sparkles size={32} color={colors.text} strokeWidth={2.5} />
        </Animated.View>
        <Text style={styles.loaderText}>
          {loadingTexts[loadingTextIndex]}
        </Text>
        <Text style={styles.loaderSubtext}>
          SİHİRLİ EŞLEŞTİRME SİSTEMİ v2.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerCenter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 8,
    padding: spacing.md,
  },
  emptyCardText: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 20,
  },
  jobsList: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  jobTabButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  jobTabButtonActive: {
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  jobTabButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.text,
  },
  jobTabButtonTextActive: {
    fontWeight: '900',
  },
  findJobsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brutalYellow,
    borderWidth: 3,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    marginVertical: spacing.md,
  },
  findJobsButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.5,
  },
  sparkleIcon: {
    marginRight: spacing.sm,
  },
  emptyStateContainer: {
    backgroundColor: colors.brutalPink,
    borderWidth: 3,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    // Slight natural rotation for brutalist charm
    transform: [{ rotate: '-0.5deg' }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: colors.brutalYellow,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  scoreText: {
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    color: colors.text,
  },
  reasonContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    backgroundColor: '#000',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: typography.sizes.sm,
    fontWeight: '900',
    marginRight: spacing.xs,
  },
  loaderContainer: {
    marginVertical: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
    transform: [{ rotate: '1deg' }],
  },
  loaderSpinnerContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.brutalYellow,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loaderText: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  loaderSubtext: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
});
