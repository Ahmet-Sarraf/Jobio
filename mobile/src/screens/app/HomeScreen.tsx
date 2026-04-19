import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import { Briefcase, DollarSign, ChevronRight, Search, ArrowDown01, ArrowUp10 } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const user = useAuthStore((state) => state.user);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs().finally(() => {
        setIsLoading(false);
      });
    }, [])
  );

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery.trim() !== '') {
      result = result.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => (Number(a.budget) || 0) - (Number(b.budget) || 0));
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => (Number(b.budget) || 0) - (Number(a.budget) || 0));
    }

    return result;
  }, [jobs, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    if (sortOrder === null) setSortOrder('desc');
    else if (sortOrder === 'desc') setSortOrder('asc');
    else setSortOrder(null);
  };

  const renderJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('JobDetails', { job: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Briefcase size={20} color={colors.primary} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Yeni'}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.budgetBadge}>
          <DollarSign size={14} color={colors.primary} />
          <Text style={styles.budgetText}>{item.budget ? `${item.budget} TL` : 'Belirtilmedi'}</Text>
        </View>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="İlan ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity 
          style={[styles.sortButton, sortOrder && styles.sortButtonActive]} 
          onPress={toggleSortOrder}
        >
          {sortOrder === 'asc' ? (
            <ArrowUp10 size={20} color={sortOrder ? colors.primary : colors.textSecondary} />
          ) : (
            <ArrowDown01 size={20} color={sortOrder ? colors.primary : colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAndSortedJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={48} color={colors.border} />
            <Text style={styles.emptyText}>Arama kriterlerinize uygun ilan bulunamadı.</Text>
          </View>
        }
      />
    </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    height: '100%',
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  listContainer: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  budgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.sm,
  },
  budgetText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
