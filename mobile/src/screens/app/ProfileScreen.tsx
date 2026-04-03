import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { User, Mail } from 'lucide-react-native';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <User size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>Hoş Geldiniz,</Text>
        <View style={styles.infoRow}>
          <Mail size={18} color={colors.textSecondary} />
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Text style={styles.idText}>ID: {user?.id}</Text>
      </View>

      <Button
        title="Çıkış Yap"
        variant="outline"
        onPress={() => logout()}
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  logoutButton: {
    width: '100%',
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
