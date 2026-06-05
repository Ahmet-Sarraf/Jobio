import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/spacing';
import {
  User,
  Mail,
  Camera,
  FileText,
  Star,
  Trash2,
  Plus,
  X,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Brain,
  Clock,
  DollarSign,
  Tag,
} from 'lucide-react-native';
import { supabase } from '../../services/supabase';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Next.js', 'Python', 'Java',
  'Vue.js', 'Angular', 'Go', 'Flutter', 'React Native', 'SQL',
  'PostgreSQL', 'Docker', 'AWS', 'Figma', 'SEO',
];

const CARD_COLORS = [
  colors.brutalYellow,
  colors.brutalPink,
  '#86efac', // brutal green
  '#93c5fd', // light brutal blue
  '#fdba74', // light brutal orange
];

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);

  // Loading and alerts
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);

  // Profile forms (used in Temel Bilgiler tab)
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [hourlyRate, setHourlyRate] = useState(String(user?.hourlyRate || ''));
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || '');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState('Profil');

  // Job Posting / Application Data
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);

  // Review Modal for Customer completing a job
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // AI Analysis Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [aiReasoning, setAiReasoning] = useState('');

  // Application Details & Cancellation Modal
  const [isAppDetailModalOpen, setIsAppDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [cancelingApp, setCancelingApp] = useState(false);

  const handleCancelApplication = async (jobId: string) => {
    if (!jobId) return;
    Alert.alert(
      'Başvuruyu İptal Et',
      'Bu iş ilanına yaptığınız başvuruyu geri çekmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelingApp(true);
              await api.delete(`/jobs/${jobId}/apply`);
              Alert.alert('Başarılı', 'Başvurunuz başarıyla iptal edildi.');
              setIsAppDetailModalOpen(false);
              setSelectedApp(null);
              fetchTabContent();
            } catch (error) {
              Alert.alert('Hata', 'Başvuru iptal edilirken bir hata oluştu.');
            } finally {
              setCancelingApp(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchTabContent();
  }, [activeTab]);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me');
      updateUserProfile(res.data);
      setName(res.data.name || '');
      setCompany(res.data.company || '');
      setBio(res.data.bio || '');
      setHourlyRate(String(res.data.hourlyRate || ''));
      setPortfolioUrl(res.data.portfolioUrl || '');
      if (res.data.skills) {
        setSkills(res.data.skills.map((s: any) => typeof s === 'string' ? s : s.name));
      }
    } catch (error) {
      console.log('Failed to fetch profile info', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabContent = async () => {
    try {
      if (
        activeTab === 'İlanlarım' ||
        activeTab === 'Aktif İşler' ||
        activeTab === 'Aktif İşlerim' ||
        activeTab === 'Tamamlanan' ||
        activeTab === 'Değerlendirmeler'
      ) {
        const res = await api.get('/jobs/my-jobs');
        setJobs(res.data);
      } else if (activeTab === 'Başvurular') {
        const res = await api.get('/jobs/my-applications');
        setApplications(res.data);
      }
    } catch (error) {
      console.log('Failed to fetch tab data', error);
    }
  };

  // Helper file extensions and Supabase Upload
  const getFileExt = (uri: string) => {
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
    return ext;
  };

  const uploadToSupabase = async (bucket: string, path: string, uri: string, contentType: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), { contentType, upsert: true });

      if (error) throw error;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicData.publicUrl;
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
  };

  const deleteOldFile = async (bucket: string, oldUrl?: string | null) => {
    if (!oldUrl) return;
    try {
      const pathSegment = `/public/${bucket}/`;
      const pathIndex = oldUrl.indexOf(pathSegment);
      if (pathIndex !== -1) {
        const filePath = oldUrl.substring(pathIndex + pathSegment.length);
        if (filePath) {
          await supabase.storage.from(bucket).remove([filePath]);
        }
      }
    } catch (error) {
      console.log('Old file deletion error:', error);
    }
  };

  // Avatar Upload
  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user?.id) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        const ext = getFileExt(asset.uri);
        const fileName = `${user.id}_${Date.now()}.${ext}`;
        const contentType = asset.mimeType || `image/${ext}`;

        const publicUrl = await uploadToSupabase('avatars', fileName, asset.uri, contentType);
        await deleteOldFile('avatars', user?.avatarUrl);
        await updateUserProfile({ avatarUrl: publicUrl });
        await api.patch('/users/me', { avatarUrl: publicUrl });
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf yüklenemedi.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // CV Upload
  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0] && user?.id) {
        setIsUploadingCV(true);
        const asset = result.assets[0];
        const ext = getFileExt(asset.uri);
        const fileName = `${user.id}_cv_${Date.now()}.${ext}`;
        const contentType = asset.mimeType || 'application/pdf';

        const publicUrl = await uploadToSupabase('documents', fileName, asset.uri, contentType);
        await deleteOldFile('documents', user?.cvUrl);
        await updateUserProfile({ cvUrl: publicUrl });
        await api.patch('/users/me', { cvUrl: publicUrl });
        Alert.alert('Başarılı', 'CV başarıyla yüklendi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'CV yüklenemedi.');
    } finally {
      setIsUploadingCV(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload: any = { name };
      if (user?.role === 'CUSTOMER') {
        payload.company = company;
      } else {
        payload.bio = bio;
        payload.hourlyRate = Number(hourlyRate) || 0;
        payload.portfolioUrl = portfolioUrl;
        payload.skills = skills;
      }

      const res = await api.patch('/users/me', payload);
      updateUserProfile(res.data);
      Alert.alert('Başarılı', 'Profiliniz başarıyla güncellendi.');
      setActiveTab('Profil'); // Redirect back to read-only view
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Profil kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  // Freelancer completes active job
  const handleFreelancerComplete = async (jobId: string) => {
    Alert.alert('İşi Tamamla', 'Bu işi tamamladığınızı işverene bildirmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Tamamladım',
        onPress: async () => {
          try {
            await api.patch(`/jobs/${jobId}/complete`);
            Alert.alert('Başarılı', 'İş tamamlandı olarak işaretlendi.');
            fetchTabContent();
          } catch (error) {
            Alert.alert('Hata', 'İş tamamlanırken hata oluştu.');
          }
        },
      },
    ]);
  };

  // Manage Skills
  const addSkill = () => {
    const clean = skillInput.trim().toLowerCase();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Fetch job applications for Customer
  const viewJobApplications = async (job: any) => {
    try {
      setSelectedJob(job);
      setLoadingJobDetails(true);
      const res = await api.get(`/jobs/${job.id}/applications`);
      setJobApplications(res.data);
    } catch (error) {
      Alert.alert('Hata', 'Başvurular alınamadı.');
    } finally {
      setLoadingJobDetails(false);
    }
  };

  // Accept/Reject application
  const updateApplicationStatus = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.patch(`/jobs/applications/${applicationId}/status`, { status });
      setJobApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      Alert.alert('Başarılı', `Başvuru ${status === 'ACCEPTED' ? 'kabul edildi' : 'reddedildi'}.`);
      if (status === 'ACCEPTED') {
        fetchTabContent();
      }
    } catch (error) {
      Alert.alert('Hata', 'Statü güncellenirken hata oluştu.');
    }
  };

  // Complete job and Review Modal (Customer)
  const startCompleteJobFlow = (jobId: string) => {
    setReviewJobId(jobId);
    setReviewScore(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleCompleteAndReview = async () => {
    if (!reviewJobId) return;
    try {
      setSubmittingReview(true);
      await api.post('/reviews', {
        jobId: reviewJobId,
        score: reviewScore,
        comment: reviewComment,
      });

      Alert.alert('Başarılı', 'İş tamamlandı ve değerlendirmeniz kaydedildi.');
      setIsReviewModalOpen(false);
      fetchTabContent();
    } catch (error) {
      Alert.alert('Hata', 'İş tamamlanamadı.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete posted job
  const handleDeleteJob = (jobId: string) => {
    Alert.alert('İlanı Sil', 'Bu iş ilanını silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/jobs/${jobId}`);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            Alert.alert('Başarılı', 'İlan silindi.');
          } catch (error) {
            Alert.alert('Hata', 'İlan silinemedi.');
          }
        },
      },
    ]);
  };

  // Open AI modal
  const openAiAnalysis = (score: number | null, reasoning: string) => {
    setAiScore(score);
    setAiReasoning(reasoning);
    setIsAiModalOpen(true);
  };

  // Render Tabs
  const getTabActiveStyle = (tab: string) => {
    switch (tab) {
      case 'Profil':
        return { backgroundColor: colors.brutalYellow, textColor: '#000000' };
      case 'Temel Bilgiler':
        return { backgroundColor: colors.brutalPink, textColor: '#000000' };
      case 'Başvurular':
      case 'İlanlarım':
        return { backgroundColor: colors.brutalBlue, textColor: '#ffffff' };
      case 'Aktif İşler':
      case 'Aktif İşlerim':
        return { backgroundColor: colors.success, textColor: '#ffffff' };
      case 'Tamamlanan':
      case 'Değerlendirmeler':
        return { backgroundColor: colors.brutalRed, textColor: '#ffffff' };
      default:
        return { backgroundColor: colors.brutalYellow, textColor: '#000000' };
    }
  };

  // Render Tabs
  const renderTabs = () => {
    const tabs =
      user?.role === 'CUSTOMER'
        ? ['Profil', 'Temel Bilgiler', 'İlanlarım', 'Aktif İşler', 'Tamamlanan']
        : ['Profil', 'Temel Bilgiler', 'Başvurular', 'Aktif İşlerim', 'Değerlendirmeler'];

    return (
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const activeStyle = getTabActiveStyle(tab);
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                isActive
                  ? { backgroundColor: activeStyle.backgroundColor, borderBottomWidth: 4, borderRightWidth: 4 }
                  : styles.tabButtonInactive,
              ]}
              onPress={() => {
                setSelectedJob(null);
                setActiveTab(tab);
                setShowRejected(false);
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive ? { color: activeStyle.textColor } : styles.tabButtonTextInactive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Tab 1: Profil (Read-Only)
  const renderReadOnlyProfile = () => {
    const isCustomer = user?.role === 'CUSTOMER';
    const cleanSkills = user?.skills || [];

    return (
      <View style={styles.tabContent}>
        {/* Big Avatar */}
        <View style={[styles.avatarWrapper, { marginBottom: spacing.md }]}>
          <View style={[styles.avatarContainer, { width: 110, height: 110 }]}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={60} color={colors.text} />
            )}
          </View>
        </View>

        {/* Read Only Stats Card */}
        <View style={styles.card}>
          <View style={styles.readOnlyRow}>
            <User size={16} color="#666" />
            <Text style={styles.readOnlyLabel}>Ad Soyad: </Text>
            <Text style={styles.readOnlyValue}>{user?.name || 'Belirtilmedi'}</Text>
          </View>

          <View style={styles.readOnlyRow}>
            <Mail size={16} color="#666" />
            <Text style={styles.readOnlyLabel}>E-posta: </Text>
            <Text style={styles.readOnlyValue}>{user?.email}</Text>
          </View>

          {isCustomer ? (
            <View style={styles.readOnlyRow}>
              <Building size={16} color="#666" />
              <Text style={styles.readOnlyLabel}>Şirket Adı: </Text>
              <Text style={styles.readOnlyValue}>{user?.company || 'Belirtilmedi'}</Text>
            </View>
          ) : (
            <>
              <View style={styles.readOnlyRow}>
                <DollarSign size={16} color="#666" />
                <Text style={styles.readOnlyLabel}>Saatlik Ücret: </Text>
                <Text style={styles.readOnlyValue}>
                  {user?.hourlyRate ? `${user.hourlyRate} ₺ / Saat` : 'Belirtilmedi'}
                </Text>
              </View>

              {user?.portfolioUrl && (
                <TouchableOpacity
                  style={styles.readOnlyRow}
                  onPress={() => Linking.openURL(user.portfolioUrl!)}
                >
                  <ExternalLink size={16} color={colors.primary} />
                  <Text style={styles.readOnlyLabel}>Portfolyo: </Text>
                  <Text style={[styles.readOnlyValue, { color: colors.primary, textDecorationLine: 'underline' }]}>
                    {user.portfolioUrl}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {!isCustomer && (
          <>
            {/* Bio Card */}
            {user?.bio && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Hakkımda</Text>
                <Text style={styles.readOnlyBio}>"{user.bio}"</Text>
              </View>
            )}

            {/* Skills */}
            {cleanSkills.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Yetenekler</Text>
                <View style={styles.tagsContainer}>
                  {cleanSkills.map((skill: any) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    return (
                      <View key={skillName} style={[styles.skillTag, { backgroundColor: colors.brutalYellow }]}>
                        <Text style={styles.skillTagText}>{skillName}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* CV View */}
            {user?.cvUrl && (
              <TouchableOpacity
                style={[styles.card, styles.cvDownloadCard]}
                onPress={() => Linking.openURL(user.cvUrl!)}
              >
                <FileText size={28} color="#000" />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cvDownloadTitle}>Özgeçmişinizi İnceleyin</Text>
                  <Text style={styles.cvDownloadSub}>CV dosyasını tarayıcıda açmak için dokunun</Text>
                </View>
                <ExternalLink size={18} color="#000" />
              </TouchableOpacity>
            )}
          </>
        )}

        <Button title="Çıkış Yap" variant="outline" onPress={logout} style={{ marginTop: spacing.md, marginBottom: spacing.xl }} />
      </View>
    );
  };

  // Tab 2: Temel Bilgiler (Editable Form)
  const renderEditableProfile = () => {
    const isCustomer = user?.role === 'CUSTOMER';
    return (
      <View style={styles.tabContent}>
        {/* Editable Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {isUploadingAvatar ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <User size={50} color={colors.text} />
            )}
          </View>
          <TouchableOpacity style={styles.avatarEditBtn} onPress={pickAvatar} disabled={isUploadingAvatar}>
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Forms */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
          />

          {isCustomer ? (
            <>
              <Text style={styles.fieldLabel}>Şirket Adı</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Şirket isminiz"
              />
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Saatlik Ücret (₺ / Saat)</Text>
              <TextInput
                style={styles.input}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="Örn: 150"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Portfolyo URL</Text>
              <TextInput
                style={styles.input}
                value={portfolioUrl}
                onChangeText={setPortfolioUrl}
                placeholder="https://behance.net/kullanici"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Hakkımda (Bio)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tecrübelerinizden bahsedin..."
                multiline
                numberOfLines={4}
              />
            </>
          )}
        </View>

        {!isCustomer && (
          <>
            {/* Skills Editable */}
            <View style={styles.card}>
              <View style={styles.skillsHeading}>
                <Text style={styles.sectionTitle}>Yeteneklerim</Text>
                <View style={styles.aiBadge}>
                  <Brain size={12} color="#fff" />
                  <Text style={styles.aiBadgeText}>AI Önerisi</Text>
                </View>
              </View>

              {/* Suggestions */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                {POPULAR_SKILLS.filter((s) => !skills.includes(s.toLowerCase())).map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={styles.suggestionTag}
                    onPress={() => setSkills([...skills, skill.toLowerCase()])}
                  >
                    <Text style={styles.suggestionTagText}>+ {skill}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {skills.map((skill) => (
                  <View key={skill} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                    <TouchableOpacity onPress={() => removeSkill(skill)}>
                      <X size={14} color="#000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add Input */}
              <View style={styles.addSkillContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Yetenek ekle..."
                  value={skillInput}
                  onChangeText={setSkillInput}
                />
                <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                  <Plus size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Document upload */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Özgeçmiş Yükle (CV)</Text>
              <View style={styles.cvContainer}>
                <FileText size={24} color={user?.cvUrl ? colors.primary : '#888'} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.cvStatusText} numberOfLines={1}>
                    {user?.cvUrl ? 'CV Dosyası Mevcut (PDF)' : 'CV yüklenmedi'}
                  </Text>
                </View>
                {isUploadingCV ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <TouchableOpacity style={styles.cvBtn} onPress={pickCV}>
                    <Text style={styles.cvBtnText}>{user?.cvUrl ? 'Değiştir' : 'Yükle'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}

        <Button
          title={saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          variant="primary"
          onPress={handleSaveProfile}
          disabled={saving}
          style={{ marginBottom: spacing.xl }}
        />
      </View>
    );
  };

  // Tab 3: Freelancer Applications (Only PENDING / Beklemede)
  const [showRejected, setShowRejected] = useState(false);

  const renderApplicationsTab = () => {
    const pendingApps = applications.filter((app) => app.status === 'PENDING');
    const rejectedApps = applications.filter((app) => app.status === 'REJECTED');

    if (showRejected) {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setShowRejected(false)}>
            <Text style={styles.backBtnText}>← Bekleyen Başvurulara Dön</Text>
          </TouchableOpacity>

          <Text style={styles.tabHeading}>Reddedilen İş Başvurularım</Text>
          {rejectedApps.length === 0 ? (
            <View style={styles.emptyCard}>
              <AlertCircle size={40} color="#ccc" />
              <Text style={styles.emptyText}>Reddedilen herhangi bir başvurunuz bulunmuyor.</Text>
            </View>
          ) : (
            rejectedApps.map((app, idx) => (
              <View key={app.id} style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
                <Text style={styles.jobTitle}>{app.job?.title}</Text>
                <Text style={styles.jobMeta}>
                  İşveren: {app.job?.customer?.company || 'İsimsiz Şirket'}
                </Text>
                <Text style={styles.jobMeta}>
                  Başvuru Tarihi: {new Date(app.createdAt).toLocaleDateString('tr-TR')}
                </Text>

                {app.aiScore !== null && app.aiScore !== undefined && (
                  <TouchableOpacity
                    style={styles.aiMatchBadge}
                    onPress={() => openAiAnalysis(app.aiScore, app.aiReasoning || '')}
                  >
                    <Brain size={14} color="#000" />
                    <Text style={styles.aiMatchText}>Yapay Zeka Eşleşmesi: %{app.aiScore}</Text>
                    <ExternalLink size={12} color="#000" />
                  </TouchableOpacity>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Durum: </Text>
                    <View style={[styles.badge, styles.badgeError]}>
                      <Text style={[styles.badgeText, { color: '#fff' }]}>REDDEDİLDİ</Text>
                    </View>
                  </View>
                  {app.job?.budget && (
                    <Text style={styles.budgetAmount}>{app.job.budget.toLocaleString()} ₺</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabHeading}>Bekleyen İş Başvurularım</Text>
        {pendingApps.length === 0 ? (
          <View style={styles.emptyCard}>
            <Clock size={40} color="#ccc" />
            <Text style={styles.emptyText}>Bekleme durumunda herhangi bir başvurunuz bulunmuyor.</Text>
          </View>
        ) : (
          pendingApps.map((app, idx) => (
            <TouchableOpacity
              key={app.id}
              style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}
              onPress={() => {
                setSelectedApp(app);
                setIsAppDetailModalOpen(true);
              }}
            >
              <Text style={styles.jobTitle}>{app.job?.title}</Text>
              <Text style={styles.jobMeta}>
                İşveren: {app.job?.customer?.company || 'İsimsiz Şirket'}
              </Text>
              <Text style={styles.jobMeta}>
                Başvuru Tarihi: {new Date(app.createdAt).toLocaleDateString('tr-TR')}
              </Text>

              {app.aiScore !== null && app.aiScore !== undefined && (
                <TouchableOpacity
                  style={[styles.aiMatchBadge, { zIndex: 10 }]}
                  onPress={() => {
                    openAiAnalysis(app.aiScore, app.aiReasoning || '');
                  }}
                >
                  <Brain size={14} color="#000" />
                  <Text style={styles.aiMatchText}>Yapay Zeka Eşleşmesi: %{app.aiScore}</Text>
                  <ExternalLink size={12} color="#000" />
                </TouchableOpacity>
              )}

              <View style={styles.cardFooter}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Durum: </Text>
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <Text style={styles.badgeText}>BEKLEMEDE</Text>
                  </View>
                </View>
                {app.job?.budget && (
                  <Text style={styles.budgetAmount}>{app.job.budget.toLocaleString()} ₺</Text>
                )}
              </View>
              
              <Text style={{ marginTop: 10, color: colors.brutalBlue, fontWeight: '900', fontSize: 12, textAlign: 'right' }}>
                Detayları Gör & İptal Et →
              </Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={[styles.cardBtn, { backgroundColor: colors.brutalRed, marginTop: spacing.md, borderBottomWidth: 4, borderRightWidth: 4 }]}
          onPress={() => setShowRejected(true)}
        >
          <Text style={[styles.cardBtnText, { color: '#fff' }]}>
            Reddedilen Başvurularımı Gör ({rejectedApps.length})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Tab 4: Freelancer Active Jobs
  const renderFreelancerActiveJobsTab = () => {
    const activeJobs = jobs.filter((j) => j.status === 'IN_PROGRESS');

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabHeading}>Devam Eden İşlerim (Aldığım İşler)</Text>
        {activeJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Briefcase size={40} color="#ccc" />
            <Text style={styles.emptyText}>Üzerinizde devam eden aktif bir iş bulunmuyor.</Text>
          </View>
        ) : (
          activeJobs.map((job, idx) => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>İşveren: {job.customer?.user?.name || 'Müşteri'}</Text>
              <Text style={styles.jobMeta}>Bütçe: {job.budget?.toLocaleString()} ₺</Text>
              <Text style={styles.jobMeta}>Kategori: {job.category || 'Belirtilmedi'}</Text>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.brutalBlue, flex: 1 }]}
                  onPress={() => handleFreelancerComplete(job.id)}
                >
                  <Text style={[styles.cardBtnText, { color: '#fff' }]}>✓ İşi Tamamladım</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  // Tab 3: Customer Job Postings (Active Open Jobs)
  const renderJobPostingsTab = () => {
    if (selectedJob) {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedJob(null)}>
            <Text style={styles.backBtnText}>← İlanlarıma Geri Dön</Text>
          </TouchableOpacity>

          <Text style={styles.tabHeading}>{selectedJob.title} - Aday Başvuruları ({jobApplications.length})</Text>

          {loadingJobDetails ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : jobApplications.length === 0 ? (
            <View style={styles.emptyCard}>
              <User size={40} color="#ccc" />
              <Text style={styles.emptyText}>Bu ilana henüz başvuran aday yok.</Text>
            </View>
          ) : (
            jobApplications.map((app) => (
              <View key={app.id} style={styles.applicantCard}>
                <TouchableOpacity
                  style={styles.applicantHeader}
                  onPress={() => navigation.navigate('FreelancerDetails', { freelancerId: app.freelancerId })}
                  activeOpacity={0.7}
                >
                  <View style={styles.applicantAvatar}>
                    {app.freelancer?.user?.avatarUrl ? (
                      <Image
                        source={{ uri: app.freelancer.user.avatarUrl }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <User size={24} color="#000" />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.applicantName}>{app.freelancer?.user?.name || 'İsimsiz'}</Text>
                    <Text style={styles.applicantEmail}>{app.freelancer?.user?.email}</Text>
                  </View>
                  <ExternalLink size={16} color={colors.textSecondary} />
                </TouchableOpacity>

                {app.freelancer?.skills && app.freelancer.skills.length > 0 && (
                  <View style={[styles.tagsContainer, { marginTop: spacing.sm }]}>
                    {app.freelancer.skills.map((skill: any) => (
                      <View key={skill.id || skill.name} style={[styles.skillTag, { backgroundColor: '#e2e8f0' }]}>
                        <Text style={[styles.skillTagText, { fontSize: 10 }]}>{skill.name || skill}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {app.aiScore !== null && app.aiScore !== undefined && (
                  <TouchableOpacity
                    style={styles.aiMatchBadge}
                    onPress={() => openAiAnalysis(app.aiScore, app.aiReasoning || '')}
                  >
                    <Brain size={14} color="#000" />
                    <Text style={styles.aiMatchText}>AI Analiz Skoru: %{app.aiScore}</Text>
                    <ExternalLink size={12} color="#000" />
                  </TouchableOpacity>
                )}

                <View style={styles.applicantActions}>
                  {app.status === 'PENDING' ? (
                    <>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.acceptBtn]}
                        onPress={() => updateApplicationStatus(app.id, 'ACCEPTED')}
                      >
                        <Text style={styles.actionBtnText}>Kabul Et</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => updateApplicationStatus(app.id, 'REJECTED')}
                      >
                        <Text style={[styles.actionBtnText, { color: '#000' }]}>Reddet</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View
                      style={[
                        styles.badge,
                        app.status === 'ACCEPTED' ? styles.badgeSuccess : styles.badgeError,
                        { flex: 1, paddingVertical: 10 },
                      ]}
                    >
                      <Text style={[styles.badgeText, { textAlign: 'center' }]}>
                        {app.status === 'ACCEPTED' ? '✓ ADAY KABUL EDİLDİ' : 'ADAY REDDEDİLDİ'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      );
    }

    const openJobs = jobs.filter((j) => j.status === 'OPEN');

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabHeading}>Açık İş İlanlarım</Text>
        {openJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Briefcase size={40} color="#ccc" />
            <Text style={styles.emptyText}>Henüz aktif ilanınız yok.</Text>
          </View>
        ) : (
          openJobs.map((job, idx) => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>Bütçe: {job.budget?.toLocaleString()} ₺</Text>
              <Text style={styles.jobMeta}>Kategori: {job.category || 'Belirtilmedi'}</Text>
              <Text style={styles.jobMeta}>
                Tarih: {new Date(job.createdAt).toLocaleDateString('tr-TR')}
              </Text>
              <Text style={styles.jobMeta}>
                Başvuru Sayısı: {job._count?.applications ?? 0}
              </Text>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.brutalPink, flex: 1 }]}
                  onPress={() => viewJobApplications(job)}
                >
                  <Text style={styles.cardBtnText}>Başvuruları Gör</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: '#fff', width: 48 }]}
                  onPress={() => handleDeleteJob(job.id)}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  // Tab 3: Customer Active Jobs
  const renderCustomerActiveJobsTab = () => {
    const activeJobs = jobs.filter((j) => j.freelancerId !== null && j.status !== 'COMPLETED');
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabHeading}>Devam Eden İşlerim</Text>
        {activeJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Briefcase size={40} color="#ccc" />
            <Text style={styles.emptyText}>Aktif yürütülen iş bulunmuyor.</Text>
          </View>
        ) : (
          activeJobs.map((job, idx) => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobMeta}>Freelancer: {job.freelancer?.user?.name || 'Atanmış Aday'}</Text>
              <Text style={styles.jobMeta}>Bütçe: {job.budget?.toLocaleString()} ₺</Text>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={[styles.cardBtn, { backgroundColor: colors.success, flex: 1 }]}
                  onPress={() => startCompleteJobFlow(job.id)}
                >
                  <Text style={styles.cardBtnText}>İşi Tamamla & Değerlendir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  // Tab 5 / Tab 4: Completed Jobs & Reviews (Freelancer or Customer)
  const renderCompletedJobsTab = () => {
    const isCustomer = user?.role === 'CUSTOMER';
    const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');

    if (isCustomer) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.tabHeading}>Tamamlanmış Projeler</Text>
          {completedJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle2 size={40} color="#ccc" />
              <Text style={styles.emptyText}>Henüz bitmiş projeniz bulunmuyor.</Text>
            </View>
          ) : (
            completedJobs.map((job, idx) => (
              <View key={job.id} style={[styles.jobCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobMeta}>Freelancer: {job.freelancer?.user?.name || 'Bilinmiyor'}</Text>
                <Text style={styles.jobMeta}>Bütçe: {job.budget?.toLocaleString()} ₺</Text>

                {job.review ? (
                  <View style={styles.reviewSnippet}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= job.review.score ? colors.brutalYellow : '#cbd5e1'}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewComment}>"{job.review.comment}"</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.cardBtn, { backgroundColor: colors.brutalYellow, marginTop: 8 }]}
                    onPress={() => startCompleteJobFlow(job.id)}
                  >
                    <Text style={styles.cardBtnText}>Puan & Yorum Ekle</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      );
    } else {
      // Freelancer Reviews (Web-like detail cards showing Title, Stars, Budget, Category, Date, Customer Name, and Comments)
      const reviewedJobs = completedJobs.filter((j) => j.review);
      const totalScore = reviewedJobs.reduce((acc, j) => acc + j.review.score, 0);
      const averageScore = reviewedJobs.length > 0 ? totalScore / reviewedJobs.length : 0;

      return (
        <View style={styles.tabContent}>
          <Text style={styles.tabHeading}>Değerlendirmelerim</Text>
          {reviewedJobs.length > 0 && (
            <View style={styles.ratingSummaryCard}>
              <Text style={styles.avgScoreText}>{averageScore.toFixed(1)} / 5</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    color={star <= Math.round(averageScore) ? colors.brutalYellow : '#cbd5e1'}
                  />
                ))}
              </View>
              <Text style={styles.reviewCountText}>Toplam {reviewedJobs.length} değerlendirme</Text>
            </View>
          )}

          {completedJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Star size={40} color="#ccc" />
              <Text style={styles.emptyText}>Henüz tamamlanmış bir işiniz bulunmuyor.</Text>
            </View>
          ) : (
            completedJobs.map((job, idx) => (
              <View key={job.id} style={[styles.reviewJobDetailCard, { backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }]}>
                {/* Header Container */}
                <View style={[styles.reviewCardHeader, { backgroundColor: 'transparent' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewJobTitle}>{job.title || 'İsimsiz İş'}</Text>
                    <View style={styles.reviewMetaWrap}>
                      <Text style={styles.reviewMetaItem}>
                        İşveren: {job.customer?.user?.name || 'Müşteri'}
                      </Text>
                      {job.budget && (
                        <Text style={[styles.reviewMetaItem, styles.reviewBudgetBadge]}>
                          {job.budget.toLocaleString()} ₺
                        </Text>
                      )}
                      {job.category && (
                        <Text style={[styles.reviewMetaItem, styles.reviewCategoryBadge]}>
                          {job.category}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.reviewDateText}>
                      Tarih: {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>

                  {job.review && (
                    <View style={styles.reviewScoreBadge}>
                      <Text style={styles.reviewScoreText}>{job.review.score}.0</Text>
                      <Star size={14} color="#000" fill={colors.brutalYellow} />
                    </View>
                  )}
                </View>

                {/* Comment Area */}
                <View style={styles.reviewCardCommentContainer}>
                  {job.review ? (
                    <>
                      <Text style={styles.reviewSectionLabel}>Müşteri Değerlendirmesi</Text>
                      <Text style={styles.reviewCommentText}>
                        &ldquo;{job.review.comment}&rdquo;
                      </Text>
                    </>
                  ) : (
                    <View style={styles.noReviewAlert}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.noReviewAlertText}>İşveren henüz yorum yapmadı.</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profil Header */}
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>Hesap Yönetimi</Text>
        <Text style={styles.userRoleBadge}>{user?.role === 'CUSTOMER' ? 'İŞVEREN' : 'FREELANCER'}</Text>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Render active content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {activeTab === 'Profil' ? renderReadOnlyProfile() : null}
          {activeTab === 'Temel Bilgiler' ? renderEditableProfile() : null}
          {activeTab === 'Başvurular' ? renderApplicationsTab() : null}
          {activeTab === 'İlanlarım' ? renderJobPostingsTab() : null}
          {activeTab === 'Aktif İşler' ? renderCustomerActiveJobsTab() : null}
          {activeTab === 'Aktif İşlerim' ? renderFreelancerActiveJobsTab() : null}
          {activeTab === 'Tamamlanan' || activeTab === 'Değerlendirmeler' ? renderCompletedJobsTab() : null}
        </>
      )}

      {/* REVIEW MODAL */}
      <Modal visible={isReviewModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>İşi Değerlendir</Text>
            <Text style={styles.modalSubtitle}>Proje başarıyla tamamlandı. Puan verin ve tecrübenizi yazın.</Text>

            <View style={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewScore(star)}>
                  <Star
                    size={36}
                    color={star <= reviewScore ? colors.brutalYellow : '#e2e8f0'}
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: '#fff', height: 100 }]}
              placeholder="Freelancer performansı hakkında yorum yazın..."
              multiline
              numberOfLines={4}
              value={reviewComment}
              onChangeText={setReviewComment}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ef4444' }]}
                onPress={() => setIsReviewModalOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.brutalBlue, flex: 1 }]}
                onPress={handleCompleteAndReview}
                disabled={submittingReview}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet & Bitir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI ANALYSIS MODAL */}
      <Modal visible={isAiModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { borderLeftWidth: 10, borderLeftColor: colors.brutalPink }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
              <Brain size={24} color="#000" />
              <Text style={styles.modalTitle}>AI Eşleşme Analizi</Text>
            </View>

            {aiScore !== null && (
              <View style={styles.aiScoreCircle}>
                <Text style={styles.aiScoreNumber}>%{aiScore}</Text>
                <Text style={styles.aiScoreLabel}>Uyum Skoru</Text>
              </View>
            )}

            <ScrollView style={{ maxHeight: 200, marginBottom: spacing.md }}>
              <Text style={styles.aiReasoningText}>{aiReasoning || 'Analiz bulunamadı.'}</Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#000' }]}
              onPress={() => setIsAiModalOpen(false)}
            >
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* APPLICATION DETAIL MODAL */}
      <Modal visible={isAppDetailModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { padding: 0, overflow: 'hidden', maxHeight: '85%' }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: colors.brutalBlue }]}>
              <Text style={[styles.modalTitle, { color: '#fff', fontSize: 16 }]} numberOfLines={2}>
                {selectedApp?.job?.title || 'İlan Detayı'}
              </Text>
              <TouchableOpacity onPress={() => setIsAppDetailModalOpen(false)} style={styles.closeModalBtn}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.md }}>
              {/* Meta Stats Row */}
              <View style={styles.detailMetaRow}>
                {selectedApp?.job?.budget && (
                  <View style={[styles.metaBadge, { backgroundColor: colors.brutalYellow }]}>
                    <Text style={styles.metaBadgeText}>{selectedApp.job.budget.toLocaleString()} ₺</Text>
                  </View>
                )}
                {selectedApp?.job?.category && (
                  <View style={[styles.metaBadge, { backgroundColor: '#000' }]}>
                    <Text style={[styles.metaBadgeText, { color: '#fff' }]}>{selectedApp.job.category}</Text>
                  </View>
                )}
                {selectedApp?.job?.duration && (
                  <View style={[styles.metaBadge, { backgroundColor: colors.brutalPink }]}>
                    <Text style={styles.metaBadgeText}>{selectedApp.job.duration}</Text>
                  </View>
                )}
              </View>

              {/* Info section */}
              <View style={styles.detailInfoBox}>
                <Text style={styles.detailInfoLabel}>İşveren Firma</Text>
                <Text style={styles.detailInfoValue}>
                  {selectedApp?.job?.customer?.company || 'Belirtilmedi'}
                </Text>

                {selectedApp?.job?.experienceLevel && (
                  <>
                    <Text style={styles.detailInfoLabel}>Deneyim Seviyesi</Text>
                    <Text style={styles.detailInfoValue}>{selectedApp.job.experienceLevel}</Text>
                  </>
                )}
              </View>

              {/* Description */}
              <Text style={styles.detailSectionTitle}>İş Açıklaması</Text>
              <Text style={styles.detailDescriptionText}>
                {selectedApp?.job?.description || 'Açıklama belirtilmemiş.'}
              </Text>

              {/* Skills */}
              {selectedApp?.job?.requiredSkills && selectedApp.job.requiredSkills.length > 0 && (
                <>
                  <Text style={styles.detailSectionTitle}>Aranan Yetenekler</Text>
                  <View style={styles.tagsContainer}>
                    {selectedApp.job.requiredSkills.map((skill: any) => (
                      <View key={skill.id} style={[styles.skillTag, { backgroundColor: '#e2e8f0' }]}>
                        <Text style={styles.skillTagText}>{skill.name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Cover Letter */}
              {selectedApp?.coverLetter && (
                <>
                  <Text style={styles.detailSectionTitle}>Ön Yazınız</Text>
                  <View style={styles.coverLetterBox}>
                    <Text style={styles.coverLetterText}>"{selectedApp.coverLetter}"</Text>
                  </View>
                </>
              )}

              {/* AI Score */}
              {selectedApp?.aiScore !== null && selectedApp?.aiScore !== undefined && (
                <View style={styles.aiScoreDetailBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Brain size={18} color="#000" />
                    <Text style={styles.aiScoreDetailTitle}>
                      AI Uyum Analizi (%{selectedApp.aiScore})
                    </Text>
                  </View>
                  <Text style={styles.aiScoreDetailReasoning}>
                    {selectedApp.aiReasoning || 'AI gerekçesi bulunamadı.'}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Actions Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.brutalRed, flex: 1 }]}
                onPress={() => handleCancelApplication(selectedApp?.job?.id)}
                disabled={cancelingApp}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {cancelingApp ? 'İptal Ediliyor...' : 'Başvuruyu İptal Et'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#000', paddingHorizontal: 20 }]}
                onPress={() => setIsAppDetailModalOpen(false)}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  welcomeText: {
    fontSize: typography.sizes.xl,
    fontWeight: '900',
    color: '#000',
  },
  userRoleBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: '900',
    backgroundColor: colors.brutalPink,
    color: '#000',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: '#000',
    transform: [{ rotate: '-2deg' }],
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.lg,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.brutalYellow,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  tabButtonInactive: {
    backgroundColor: '#fff',
  },
  tabButtonText: {
    fontWeight: '800',
    fontSize: typography.sizes.sm,
  },
  tabButtonTextActive: {
    color: '#000',
  },
  tabButtonTextInactive: {
    color: '#666',
  },
  tabContent: {
    flex: 1,
  },
  tabHeading: {
    fontSize: typography.sizes.lg,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '800',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    padding: spacing.sm,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillsHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brutalBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#000',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  suggestionsScroll: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  suggestionTag: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 4,
  },
  suggestionTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brutalPink,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  addSkillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: colors.brutalYellow,
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  cvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
  },
  cvStatusText: {
    fontWeight: '700',
    fontSize: typography.sizes.sm,
  },
  cvBtn: {
    backgroundColor: colors.brutalBlue,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cvBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontWeight: '700',
    textAlign: 'center',
    color: '#666',
  },
  jobCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  jobTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    marginBottom: 4,
  },
  jobMeta: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  aiMatchText: {
    fontSize: 11,
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeError: {
    backgroundColor: colors.brutalRed,
  },
  badgeWarning: {
    backgroundColor: colors.brutalYellow,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  budgetAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: '900',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  cardBtn: {
    height: 40,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBtnText: {
    fontWeight: '900',
    fontSize: 12,
  },
  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backBtnText: {
    fontWeight: '800',
    fontSize: 12,
  },
  applicantCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  applicantName: {
    fontWeight: '800',
    fontSize: typography.sizes.sm,
  },
  applicantEmail: {
    fontSize: 11,
    color: '#666',
  },
  applicantActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.success,
  },
  rejectBtn: {
    backgroundColor: '#f1f5f9',
  },
  actionBtnText: {
    fontWeight: '900',
    fontSize: 11,
  },
  reviewSnippet: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: '#000',
    padding: spacing.sm,
    borderRadius: 4,
    marginTop: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  ratingSummaryCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avgScoreText: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  reviewCountText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 5,
  },
  modalTitle: {
    fontSize: typography.sizes.md + 4,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    color: '#444',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  ratingPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalBtn: {
    height: 48,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modalBtnText: {
    fontWeight: '900',
    fontSize: 14,
  },
  aiScoreCircle: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brutalYellow,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  aiScoreNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  aiScoreLabel: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  aiReasoningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    lineHeight: 18,
  },

  // Read only profile styles
  readOnlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  readOnlyLabel: {
    fontWeight: '800',
    fontSize: 13,
    marginLeft: spacing.sm,
    color: '#333',
  },
  readOnlyValue: {
    fontWeight: '600',
    fontSize: 13,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  readOnlyBio: {
    fontStyle: 'italic',
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    fontWeight: '600',
  },
  cvDownloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brutalYellow,
  },
  cvDownloadTitle: {
    fontWeight: '900',
    fontSize: 13,
  },
  cvDownloadSub: {
    fontSize: 11,
    color: '#222',
    fontWeight: '600',
  },

  // Web-like detailed review card styles
  reviewJobDetailCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderRadius: 8,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  reviewCardHeader: {
    backgroundColor: '#f4f0eb',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewJobTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewMetaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginVertical: 4,
  },
  reviewMetaItem: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  reviewBudgetBadge: {
    backgroundColor: colors.brutalYellow,
  },
  reviewCategoryBadge: {
    backgroundColor: '#000',
    color: '#fff',
  },
  reviewDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    marginTop: 2,
  },
  reviewScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brutalYellow,
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewScoreText: {
    fontSize: 12,
    fontWeight: '900',
  },
  reviewCardCommentContainer: {
    padding: spacing.md,
  },
  reviewSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 2,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  reviewCommentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  noReviewAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  noReviewAlertText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
  },
  modalHeader: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 4,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  detailInfoBox: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  detailInfoLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#000',
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  detailDescriptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  coverLetterBox: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#000',
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  coverLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    fontStyle: 'italic',
  },
  aiScoreDetailBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: colors.brutalBlue,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  aiScoreDetailTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  aiScoreDetailReasoning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    lineHeight: 16,
  },
  modalFooter: {
    padding: spacing.md,
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 2,
    borderTopColor: '#000',
    backgroundColor: '#fff',
  },
});
