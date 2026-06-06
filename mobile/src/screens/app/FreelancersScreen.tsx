import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { User, Star, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';

const CARD_COLORS = [
  colors.brutalYellow,
  colors.brutalPink,
  '#86efac', // brutal green
  colors.brutalBlue,
  '#fdba74', // brutal orange
];

export const FreelancersScreen = ({ navigation }: any) => {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [debouncedSkill, setDebouncedSkill] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debouncing search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedSkill(skillFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, skillFilter]);

  const fetchFreelancers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const currentPage = isRefresh ? 1 : page;
      if (isRefresh) setPage(1);

      const res = await api.get('/users/freelancers', {
        params: {
          q: debouncedSearch,
          skill: debouncedSkill,
          page: currentPage,
          limit: 10,
        },
      });

      setFreelancers(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch freelancers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFreelancers();
    }, [debouncedSearch, debouncedSkill, page])
  );

  const onRefresh = () => {
    fetchFreelancers(true);
  };

  const renderFreelancerCard = ({ item, index }: { item: any; index: number }) => {
    const cardBgColor = CARD_COLORS[index % CARD_COLORS.length];
    const isBlue = cardBgColor === colors.brutalBlue;

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBgColor }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('FreelancerDetails', { freelancerId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={30} color="#000" />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.nameText, { color: isBlue ? '#fff' : '#000' }]} numberOfLines={1}>
              {item.name || 'İsimsiz Kullanıcı'}
            </Text>
            <View style={styles.ratingBadge}>
              <Star size={12} color="#000" fill={colors.brutalYellow} />
              <Text style={styles.ratingText}>
                {Number(item.averageScore || 0).toFixed(1)} ({item.totalReviews || 0})
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[styles.bioText, { color: isBlue ? '#f3f4f6' : colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.bio || 'Bu freelancer henüz kendisi hakkında bir bilgi eklememiş.'}
        </Text>

        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {item.skills.slice(0, 3).map((skill: any) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              return (
                <View key={skill.id || skillName} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skillName}</Text>
                </View>
              );
            })}
            {item.skills.length > 3 && (
              <View style={[styles.skillTag, { backgroundColor: '#000' }]}>
                <Text style={[styles.skillTagText, { color: '#fff' }]}>+{item.skills.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Profilini İncele</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header / Search Form */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="İsim veya açıklamada ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              setPage(1);
            }}
          />
        </View>

        <View style={styles.searchContainer}>
          <Filter size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Yetenek filtresi (React, Figma...)"
            placeholderTextColor={colors.textSecondary}
            value={skillFilter}
            onChangeText={(text) => {
              setSkillFilter(text);
              setPage(1);
            }}
          />
        </View>
      </View>

      {/* Main List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={freelancers}
          keyExtractor={(item) => item.id}
          renderItem={renderFreelancerCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <User size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aradığınız kriterlere uygun freelancer bulunamadı.</Text>
            </View>
          }
          ListFooterComponent={
            !loading && totalPages > 1 ? (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  disabled={page === 1}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                  <Text style={styles.pageText}>
                    {page} / {totalPages}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  disabled={page === totalPages}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={24} color="#000" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 50,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    height: '100%',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  nameText: {
    fontSize: typography.sizes.lg,
    fontWeight: '900',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    marginLeft: 4,
  },
  bioText: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  skillTag: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: spacing.xs,
  },
  skillTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
  },
  actionBtn: {
    backgroundColor: '#000',
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: typography.sizes.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  pageBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: spacing.xs,
    padding: 6,
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageIndicator: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: spacing.xs,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  pageText: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: '#000',
  },
});
