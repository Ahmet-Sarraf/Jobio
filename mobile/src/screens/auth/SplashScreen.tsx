import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';

export const SplashScreen = ({ navigation }: any) => {
  const animatedValues = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  const wigglingValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start bouncing animations for each letter sequentially
    const animations = animatedValues.map((val, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(val, {
            toValue: -24, // bounce up
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0, // fall back down
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.delay(500), // delay before next bounce
        ])
      );
    });

    animations.forEach((anim) => anim.start());

    // Loader text wiggling animation
    const wiggle = Animated.loop(
      Animated.sequence([
        Animated.timing(wigglingValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(wigglingValue, {
          toValue: -1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    wiggle.start();

    // Redirect to Login screen after 2.8 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2800);

    return () => {
      clearTimeout(timer);
      animations.forEach((anim) => anim.stop());
      wiggle.stop();
    };
  }, []);

  const letters = [
    { char: 'J', bg: '#ffffff', color: '#000000', rotate: '-6deg' },
    { char: 'O', bg: colors.brutalPink, color: '#000000', rotate: '4deg' },
    { char: 'B', bg: colors.brutalBlue, color: '#ffffff', rotate: '-3deg' },
    { char: 'I', bg: '#86efac', color: '#000000', rotate: '6deg' },
    { char: 'O', bg: '#ffffff', color: '#000000', rotate: '-4deg' },
  ];

  const wiggleInterpolate = wigglingValue.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {letters.map((item, index) => (
          <Animated.View
            key={index}
            style={[
              styles.letterBox,
              {
                backgroundColor: item.bg,
                transform: [
                  { translateY: animatedValues[index] },
                  { rotate: item.rotate },
                ],
              },
            ]}
          >
            <Text style={[styles.letterText, { color: item.color }]}>
              {item.char}
            </Text>
          </Animated.View>
        ))}
      </View>
      <View style={styles.footerContainer}>
        <Animated.View style={{ transform: [{ rotate: wiggleInterpolate }] }}>
          <View style={styles.loadingBadge}>
            <Text style={styles.loaderText}>Yükleniyor...</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brutalYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  letterBox: {
    width: 60,
    height: 68,
    borderWidth: 3,
    borderColor: '#000000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 36,
    fontWeight: '900',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingBadge: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  loaderText: {
    fontSize: typography.sizes.md,
    fontWeight: '800',
    color: '#ffffff',
  },
});
