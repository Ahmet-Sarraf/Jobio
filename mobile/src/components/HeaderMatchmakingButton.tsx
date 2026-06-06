import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';

export const HeaderMatchmakingButton = () => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Matchmaking')}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Sparkles size={24} color={colors.text} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: colors.brutalYellow,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Neo-Brutalist flat shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
