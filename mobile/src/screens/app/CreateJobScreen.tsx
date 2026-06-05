import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import { api } from '../../services/api';
import {
  Briefcase,
  Send,
  Target,
  Layers,
  X,
  Tag,
  Clock,
  DollarSign,
  Plus,
  AlertCircle,
} from 'lucide-react-native';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Next.js', 'Python', 'Java',
  'Vue.js', 'Angular', 'Go', 'Flutter', 'React Native', 'SQL',
  'PostgreSQL', 'Docker', 'AWS', 'Figma', 'SEO',
];

const CATEGORIES = [
  'Web Geliştirme',
  'Mobil Uygulama',
  'UI/UX Tasarım',
  'Dijital Pazarlama',
  'Veri Bilimi',
  'İçerik Üretimi',
];

const DURATIONS = [
  '1 aydan az',
  '1-3 Ay',
  '3-6 Ay',
  '6 aydan uzun',
  'Sürekli / Tam Zamanlı',
];

export const CreateJobScreen = ({ navigation }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Orta');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [budget, setBudget] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAddSkill = () => {
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      if (skills.length >= 10) {
        Alert.alert('Limit', 'En fazla 10 yetenek ekleyebilirsiniz.');
        return;
      }
      setSkills([...skills, cleanSkill]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errors.title = 'İş başlığı en az 3 karakter olmalıdır';
    }
    if (!description.trim() || description.trim().length < 10) {
      errors.description = 'Açıklama en az 10 karakter olmalıdır';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doğru şekilde doldurun.');
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        title,
        description,
        category: category || undefined,
        experienceLevel,
        duration: duration || undefined,
        skills,
        budget: budget ? Number(budget) : undefined,
      };

      await api.post('/jobs', payload);

      Alert.alert('Başarılı', 'İş ilanınız başarıyla oluşturuldu ve yayınlandı.', [
        {
          text: 'Tamam',
          onPress: () => {
            // Reset state
            setTitle('');
            setCategory('');
            setDescription('');
            setDuration('');
            setExperienceLevel('Orta');
            setSkills([]);
            setSkillInput('');
            setBudget('');
            setValidationErrors({});
            navigation.navigate('TabHome');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Create job error:', error.response?.data || error);
      const msg = error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu.';
      setApiError(msg);
      Alert.alert('Hata', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Yeni İlan Oluştur</Text>
      <Text style={styles.headerSubtitle}>
        Harika yetenekleri bulmak için projenizi detaylandırın.
      </Text>

      {apiError && (
        <View style={styles.errorBanner}>
          <AlertCircle size={20} color="#fff" />
          <Text style={styles.errorBannerText}>{apiError}</Text>
        </View>
      )}

      <View style={styles.formCard}>
        {/* Başlık */}
        <Input
          label="İlan Başlığı *"
          placeholder="Örn: Kıdemli Frontend Geliştirici"
          value={title}
          onChangeText={setTitle}
          error={validationErrors.title}
        />

        {/* Kategori */}
        <Text style={styles.sectionLabel}>Kategori</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(category === cat ? '' : cat)}
                style={[
                  styles.chipButton,
                  isSelected && styles.chipButtonActive,
                ]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {isSelected ? `✓ ${cat}` : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Deneyim Seviyesi */}
        <Text style={styles.sectionLabel}>Deneyim Seviyesi</Text>
        <View style={styles.experienceRow}>
          {[
            { id: 'Başlangıç', desc: 'Temel işler' },
            { id: 'Orta', desc: 'Makul bütçe' },
            { id: 'Uzman', desc: 'Üst düzey' },
          ].map((level) => {
            const isSelected = experienceLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                onPress={() => setExperienceLevel(level.id)}
                style={[
                  styles.experienceCard,
                  isSelected && styles.experienceCardActive,
                ]}
              >
                <Text style={[styles.experienceCardTitle, isSelected && styles.experienceCardTitleActive]}>
                  {level.id}
                </Text>
                <Text style={styles.experienceCardDesc}>{level.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Yetenekler */}
        <Text style={styles.sectionLabel}>Gerekli Yetenekler (Maks. 10)</Text>
        <View style={styles.skillInputWrapper}>
          <TextInput
            style={styles.skillTextInput}
            placeholder="Yetenek yazın..."
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={handleAddSkill}
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity style={styles.addSkillBtn} onPress={handleAddSkill}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Popüler Yetenekler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
            <TouchableOpacity
              key={skill}
              onPress={() => {
                if (skills.length >= 10) {
                  Alert.alert('Limit', 'En fazla 10 yetenek ekleyebilirsiniz.');
                  return;
                }
                setSkills([...skills, skill]);
              }}
              style={styles.popularSkillChip}
            >
              <Text style={styles.popularSkillText}>+ {skill}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Seçilen Yetenekler */}
        {skills.length > 0 && (
          <View style={styles.selectedSkillsContainer}>
            {skills.map((skill) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
                <TouchableOpacity onPress={() => removeSkill(skill)}>
                  <X size={14} color="#000" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Açıklama */}
        <Input
          label="İş Açıklaması *"
          placeholder="Projenin detayları, freelancer'dan beklentileriniz ve teknik gereksinimler..."
          value={description}
          onChangeText={setDescription}
          error={validationErrors.description}
          multiline
          numberOfLines={6}
          style={styles.textArea}
        />

        {/* Tahmini Süre */}
        <Text style={styles.sectionLabel}>Tahmini Süre</Text>
        <View style={styles.durationContainer}>
          {DURATIONS.map((dur) => {
            const isSelected = duration === dur;
            return (
              <TouchableOpacity
                key={dur}
                onPress={() => setDuration(duration === dur ? '' : dur)}
                style={[
                  styles.chipButton,
                  isSelected && styles.chipButtonActive,
                  { marginBottom: spacing.xs },
                ]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {isSelected ? `✓ ${dur}` : dur}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bütçe */}
        <Input
          label="Bütçe (Opsiyonel)"
          placeholder="Örn: 15000"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          icon={<DollarSign size={18} color="#000" />}
        />

        <Button
          title={isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
          onPress={onSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
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
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '900',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: spacing.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  horizontalScroll: {
    marginVertical: spacing.xs,
  },
  chipButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipButtonActive: {
    backgroundColor: colors.brutalPink,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    transform: [{ translateY: -2 }],
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  chipTextActive: {
    fontWeight: '900',
  },
  experienceRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: spacing.xs,
  },
  experienceCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceCardActive: {
    backgroundColor: colors.brutalYellow,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    transform: [{ translateY: -2 }],
  },
  experienceCardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000',
  },
  experienceCardTitleActive: {
    color: '#000',
  },
  experienceCardDesc: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  skillInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 52,
    marginBottom: spacing.sm,
  },
  skillTextInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.md,
    color: '#000',
    fontWeight: '700',
  },
  addSkillBtn: {
    backgroundColor: colors.brutalBlue,
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: '#000',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  popularSkillChip: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  popularSkillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.sm,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brutalPink,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.xs,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  errorBanner: {
    backgroundColor: colors.brutalRed,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
});
