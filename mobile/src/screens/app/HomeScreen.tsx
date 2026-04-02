import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';

export const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz,</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.content}>
        <Text style={styles.info}>Jobio mobil uygulamasındasınız.</Text>
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  info: {
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
    position: 'absolute',
    bottom: spacing.xxl,
  },
});
