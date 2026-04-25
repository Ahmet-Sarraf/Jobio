'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import api from '@/lib/axios';
import { User, Mail, Camera, Building, AlertCircle, CheckCircle2, Save, Settings, Briefcase, Users, MessageSquare, X, FileText, Star, DollarSign, Link as LinkIcon, Upload } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuthStore();
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState('Temel Bilgiler'); // Will be updated by useEffect based on role

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    bio: '',
    hourlyRate: 0,
    portfolioUrl: '',
  });

  // Sayfa açılınca backend'den en güncel profil verisini çek
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        updateUserProfile({
          avatarUrl: res.data.avatarUrl ?? undefined,
          name: res.data.name ?? undefined,
          company: res.data.company ?? undefined,
          role: res.data.role ?? undefined,
          bio: res.data.bio ?? undefined,
          hourlyRate: res.data.hourlyRate ?? undefined,
          portfolioUrl: res.data.portfolioUrl ?? undefined,
          cvUrl: res.data.cvUrl ?? undefined,
        });
        setFormData({
          name: res.data.name || '',
          company: res.data.company || '',
          bio: res.data.bio || '',
          hourlyRate: res.data.hourlyRate || 0,
          portfolioUrl: res.data.portfolioUrl || '',
        });
        
        // Rolüne göre varsayılan tab'ı belirle
        if (res.data.role === 'CUSTOMER') {
          setActiveTab('Profil Ayarları');
        } else if (res.data.role === 'FREELANCER') {
          setActiveTab('Temel Bilgiler');
        }
      } catch { /* sessizce hata yut, eski cache'teki veri gösterilir */ }
    };
    
    if (user) {
      fetchProfile();
      if (user.role === 'CUSTOMER' && activeTab === 'Temel Bilgiler') setActiveTab('Profil Ayarları');
      else if (user.role === 'FREELANCER' && activeTab === 'Profil Ayarları') setActiveTab('Temel Bilgiler');
    }
  }, []);

  // Handle local state changes if user object updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || 0,
        portfolioUrl: user.portfolioUrl || '',
      });
    }
  }, [user?.name, user?.company, user?.bio, user?.hourlyRate, user?.portfolioUrl]);

  // Dosya uzantısını alma yardımcısı
  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = getFileExtension(file.name);
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      setLoadingAvatar(true);
      setMessage(null);

      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Public URL oluşturma
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updateUserProfile({ avatarUrl: publicUrl });
      
      // DB'ye kaydet
      await api.patch('/users/me', { avatarUrl: publicUrl });
      setMessage({ text: 'Profil fotoğrafı başarıyla güncellendi.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Fotoğraf yüklenemedi.', type: 'error' });
    } finally {
      setLoadingAvatar(false);
    }
  };

  const uploadCv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = getFileExtension(file.name);
    const fileName = `${user.id}-cv-${Date.now()}.${fileExt}`;

    try {
      setLoadingCv(true);
      setMessage(null);

      const { error } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName);

      updateUserProfile({ cvUrl: publicUrl });
      await api.patch('/users/me', { cvUrl: publicUrl });
      setMessage({ text: 'Özgeçmiş başarıyla yüklendi.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Özgeçmiş yüklenemedi.', type: 'error' });
    } finally {
      setLoadingCv(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setMessage(null);

      const payload: any = { name: formData.name };
      
      if (user.role === 'CUSTOMER') {
        payload.company = formData.company;
      } else if (user.role === 'FREELANCER') {
        payload.bio = formData.bio;
        payload.hourlyRate = Number(formData.hourlyRate);
        payload.portfolioUrl = formData.portfolioUrl;
      }

      await api.patch('/users/me', payload);

      updateUserProfile(payload);

      setMessage({ text: 'Profiliniz başarıyla güncellendi.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Profil güncellenirken bir hata oluştu.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  // Menü Tanımları
  const customerMenu = [
    { id: 'Profil Ayarları', icon: Settings },
    { id: 'İlanlarım', icon: Briefcase },
    { id: 'Freelancer\'larım', icon: Users },
    { id: 'Mesajlar', icon: MessageSquare },
  ];

  const freelancerMenu = [
    { id: 'Temel Bilgiler', icon: Settings },
    { id: 'Özgeçmiş & Portfolyo', icon: FileText },
    { id: 'İşlerim & Başvurular', icon: Briefcase },
    { id: 'Değerlendirmeler', icon: Star },
    { id: 'Mesajlar', icon: MessageSquare },
  ];

  const activeMenu = user.role === 'CUSTOMER' ? customerMenu : freelancerMenu;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Toast Message */}
      {message && (
        <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 shadow-sm border ${message.type === 'success' ? 'bg-green-50/80 border-green-200 text-green-800' : 'bg-red-50/80 border-red-200 text-red-800'} backdrop-blur-sm transition-all duration-300`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" /> : <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />}
          <div>
            <h3 className="text-sm font-semibold">{message.type === 'success' ? 'Başarılı' : 'Hata'}</h3>
            <p className="text-sm mt-1">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Avatar, Menu & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50 p-6 flex flex-col items-center text-center">
            <div className="relative group flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full ring-4 ring-white shadow-xl bg-gray-50 overflow-hidden cursor-pointer transition-transform hover:scale-105">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Profil Fotoğrafı" fill className="object-cover" />
              ) : (
                user.role === 'CUSTOMER' ? <Building className="h-16 w-16 text-gray-300" /> : <User className="h-16 w-16 text-gray-300" />
              )}
              
              {/* Avatar Upload Overlay */}
              <label htmlFor="avatar-upload" className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                {loadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-white mb-1 drop-shadow-md" />
                    <span className="text-xs font-semibold text-white drop-shadow-md tracking-wider">DEĞİŞTİR</span>
                  </>
                )}
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                disabled={loadingAvatar}
                onChange={uploadAvatar} 
              />
            </div>
            
            <h2 className="mt-5 text-xl font-bold text-gray-900">
              {user.role === 'CUSTOMER' ? (formData.company || 'Şirket Adı Yok') : (formData.name || 'İsimsiz Kullanıcı')}
            </h2>
            <p className="text-sm text-gray-500 font-medium tracking-wide">{user.role}</p>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-2 rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50 p-4">
            {activeMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 ring-1 ring-transparent hover:ring-gray-200'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                {item.id}
              </button>
            ))}
          </nav>
          
          <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              {user.role === 'CUSTOMER' ? 'İşveren Paneli' : 'Freelancer Paneli'}
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              {user.role === 'CUSTOMER' 
                ? 'Bu panelden kurumsal bilgilerinizi güncelleyebilir, şirketinizi freelance yeteneklere en iyi şekilde tanıtabilirsiniz. İş ilanlarınızı oluşturmadan önce profilinizin eksiksiz olduğundan emin olun.'
                : 'Bu panelden profil bilgilerinizi, yeteneklerinizi ve portfolyonuzu güncelleyerek potansiyel müşterilerin dikkatini çekebilirsiniz. Kendinizi ne kadar iyi tanıtırsanız, o kadar çok iş alırsınız!'
              }
            </p>
          </div>
        </div>

        {/* Right Column - Content Area */}
        <div className="md:col-span-2">
          {user.role === 'CUSTOMER' && activeTab === 'Profil Ayarları' && (
            <div className="overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50">
              <div className="border-b border-gray-100 px-8 py-6 bg-white/50">
                <h1 className="text-2xl font-bold text-gray-900">Şirket Profili</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Fatura ve iletişim detaylarınızı yönetin.
                </p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                {/* Kurumsal Bilgiler */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" /> Kurumsal Bilgiler
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Şirket / Marka Adı
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50"
                        placeholder="Örn: Jobio Teknoloji A.Ş."
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Kişisel / Yetkili Bilgileri */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" /> Yetkili Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50"
                        placeholder="Yetkili kişi adı"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta Adresi <span className="text-xs text-gray-400 font-normal ml-1">(Değiştirilemez)</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          readOnly
                          disabled
                          className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-10 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 cursor-not-allowed sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user.role === 'CUSTOMER' && activeTab === 'İlanlarım' && <MyJobsTab />}

          {user.role === 'FREELANCER' && activeTab === 'Temel Bilgiler' && (
            <div className="overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50">
              <div className="border-b border-gray-100 px-8 py-6 bg-white/50">
                <h1 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h1>
                <p className="mt-1 text-sm text-gray-500">
                  İletişim bilgilerinizi ve profil detaylarınızı yönetin.
                </p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" /> İletişim Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50"
                        placeholder="İsminiz ve soyisminiz"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta Adresi <span className="text-xs text-gray-400 font-normal ml-1">(Değiştirilemez)</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          readOnly
                          disabled
                          className="block w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-10 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-200 cursor-not-allowed sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" /> Profil Detayları
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Hakkımda (Bio)
                      </label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50 resize-y"
                        placeholder="Kendinizden, yeteneklerinizden ve tecrübelerinizden bahsedin..."
                      />
                    </div>
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                        Saatlik Ücret
                      </label>
                      <div className="relative mt-2 rounded-md shadow-sm max-w-[200px]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="hourlyRate"
                          id="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                          className="block w-full rounded-xl border-gray-300 py-3 pl-7 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm" id="price-currency">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    {saving ? 'Kaydediliyor...' : 'Profili Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user.role === 'FREELANCER' && activeTab === 'Özgeçmiş & Portfolyo' && (
            <div className="overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50">
              <div className="border-b border-gray-100 px-8 py-6 bg-white/50">
                <h1 className="text-2xl font-bold text-gray-900">Özgeçmiş & Portfolyo</h1>
                <p className="mt-1 text-sm text-gray-500">
                  CV'nizi yükleyin ve çalışmalarınızı müşterilere sergileyin.
                </p>
              </div>
              
              <div className="p-8 space-y-8">
                {/* CV Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" /> Özgeçmiş (CV)
                  </h3>
                  
                  <div className="mt-2 flex justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-10 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <label
                          htmlFor="cv-upload"
                          className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Dosya Seçin</span>
                          <input id="cv-upload" name="cv-upload" type="file" className="sr-only" accept=".pdf" onChange={uploadCv} disabled={loadingCv} />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-500 mt-1">Sadece PDF (Maks. 5MB)</p>
                      
                      {loadingCv && (
                        <div className="mt-4 flex justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        </div>
                      )}
                      
                      {user.cvUrl && !loadingCv && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium ring-1 ring-inset ring-green-600/20">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Mevcut CV Yüklü</span>
                          <a href={user.cvUrl} target="_blank" rel="noreferrer" className="ml-2 text-green-800 underline hover:text-green-900">Görüntüle</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Portfolyo Linki */}
                <form onSubmit={handleSaveProfile}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-blue-600" /> Portfolyo Bağlantısı
                  </h3>
                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Kişisel Websitesi veya Portfolyo Linki
                    </label>
                    <input
                      type="url"
                      id="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-shadow bg-white/50"
                      placeholder="https://www.ornek.com"
                    />
                  </div>
                  
                  {/* Submit Button for Portfolio */}
                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                    >
                      {saving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {((user.role === 'CUSTOMER' && activeTab !== 'Profil Ayarları' && activeTab !== 'İlanlarım') || 
            (user.role === 'FREELANCER' && activeTab !== 'Temel Bilgiler' && activeTab !== 'Özgeçmiş & Portfolyo')) && (
            <div className="flex flex-col items-center justify-center min-h-[500px] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50 p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                <Settings className="h-10 w-10 text-blue-400 animate-[spin_4s_linear_infinite]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bu modül yakında eklenecek</h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                <span className="font-semibold text-gray-700">"{activeTab}"</span> sekmesi üzerindeki çalışmalarımız tüm hızıyla devam ediyor. Çok yakında burada harika özellikler göreceksiniz!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Yeni İlanlarım Komponenti (Değişmedi)
function MyJobsTab() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/my-jobs');
        setJobs(res.data);
      } catch (err) {
        console.error('İlanlar alınamadı', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">Açık İlan</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">Devam Ediyor</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/10">Tamamlandı</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">İptal Edildi</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-gray-200/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">İlanlarınız yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg ring-1 ring-gray-200/50 flex flex-col h-full min-h-[500px]">
        <div className="border-b border-gray-100 px-8 py-6 bg-white/50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
            <p className="mt-1 text-sm text-gray-500">Oluşturduğunuz tüm iş ilanları ve güncel durumları.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold ring-1 ring-inset ring-blue-600/20 shadow-sm">
            Toplam: {jobs.length}
          </div>
        </div>
        
        <div className="p-8 flex-1 overflow-auto bg-gray-50/30">
          {jobs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-white shadow-sm">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Henüz ilanınız yok</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Sisteme kayıtlı hiçbir ilanınız bulunmuyor. Yeni bir ilan oluşturarak freelancer'larla çalışmaya başlayabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-200/60 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer"
                >
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        ${job.budget}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Popup */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedJob(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-gray-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 line-clamp-1 pr-4">{selectedJob.title}</h2>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {getStatusBadge(selectedJob.status)}
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 text-sm font-semibold">
                  ${selectedJob.budget} Bütçe
                </span>
                <span className="text-gray-500 text-sm bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 font-medium">
                  {new Date(selectedJob.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">İlan Detayı</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm">
                    {selectedJob.description || 'Detaylı açıklama bulunmuyor.'}
                  </p>
                </div>
                
                {selectedJob.freelancer && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Atanan Freelancer</h4>
                    <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      {selectedJob.freelancer.user?.avatarUrl ? (
                        <img src={selectedJob.freelancer.user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <User className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{selectedJob.freelancer.user?.name || 'İsimsiz'}</p>
                        <p className="text-xs font-medium text-blue-600">Bu projede çalışıyor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
