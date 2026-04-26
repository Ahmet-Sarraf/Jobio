'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import api from '@/lib/axios';
import { User, Mail, Camera, Building, AlertCircle, CheckCircle2, Save, Settings, Briefcase, Users, MessageSquare, X, FileText, Star, Link as LinkIcon, Upload } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuthStore();
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState('Temel Bilgiler'); 

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    bio: '',
    hourlyRate: 0,
    portfolioUrl: '',
  });

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
        
        if (res.data.role === 'CUSTOMER') {
          setActiveTab('Profil Ayarları');
        } else if (res.data.role === 'FREELANCER') {
          setActiveTab('Temel Bilgiler');
        }
      } catch { }
    };
    
    if (user) {
      fetchProfile();
      if (user.role === 'CUSTOMER' && activeTab === 'Temel Bilgiler') setActiveTab('Profil Ayarları');
      else if (user.role === 'FREELANCER' && activeTab === 'Profil Ayarları') setActiveTab('Temel Bilgiler');
    }
  }, []);

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

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updateUserProfile({ avatarUrl: publicUrl });
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
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {message && (
        <div className={`mb-8 p-4 flex items-start gap-3 border-[3px] border-black shadow-brutal transition-all duration-300 ${message.type === 'success' ? 'bg-green-300' : 'bg-brutal-pink'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-6 w-6 mt-0.5 shrink-0" strokeWidth={2.5} /> : <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" strokeWidth={2.5} />}
          <div>
            <h3 className="text-base font-black tracking-wide">{message.type === 'success' ? 'BAŞARILI' : 'HATA'}</h3>
            <p className="text-sm font-bold mt-1">{message.text}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Kolon */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white border-[3px] border-black shadow-brutal p-8 flex flex-col items-center text-center">
            <div className="relative group flex h-32 w-32 items-center justify-center rounded-full border-4 border-black bg-brutal-yellow overflow-hidden cursor-pointer shadow-brutal-sm transition-transform hover:-translate-y-1">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Profil Fotoğrafı" fill className="object-cover" />
              ) : (
                user.role === 'CUSTOMER' ? <Building className="h-16 w-16 text-black" strokeWidth={2} /> : <User className="h-16 w-16 text-black" strokeWidth={2} />
              )}
              
              <label htmlFor="avatar-upload" className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                {loadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-white mb-1" strokeWidth={2} />
                    <span className="text-xs font-bold text-white tracking-wider">DEĞİŞTİR</span>
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
            
            <h2 className="mt-6 text-2xl font-black text-black">
              {user.role === 'CUSTOMER' ? (formData.company || 'Şirket Adı Yok') : (formData.name || 'İsimsiz Kullanıcı')}
            </h2>
            <p className="text-sm text-black font-bold tracking-wide uppercase bg-brutal-pink px-2 py-1 mt-2 border-2 border-black shadow-brutal-sm -rotate-2">{user.role}</p>
          </div>
          
          <nav className="flex flex-col gap-3">
            {activeMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-5 py-4 text-left font-bold transition-all duration-200 border-[3px] border-black ${
                  activeTab === item.id
                    ? 'bg-brutal-yellow shadow-brutal -translate-y-[2px] -translate-x-[2px]'
                    : 'bg-white hover:bg-gray-100 hover:shadow-brutal hover:-translate-y-[2px] hover:-translate-x-[2px]'
                }`}
              >
                <item.icon className="h-6 w-6 text-black" strokeWidth={2.5} />
                <span className="text-black text-base">{item.id}</span>
              </button>
            ))}
          </nav>
          
          <div className="bg-brutal-blue border-[3px] border-black p-6 shadow-brutal text-white -rotate-1 hover:rotate-0 transition-transform">
            <h3 className="text-lg font-black mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 fill-white" /> 
              {user.role === 'CUSTOMER' ? 'İşveren Paneli' : 'Freelancer Paneli'}
            </h3>
            <p className="text-sm font-semibold leading-relaxed">
              {user.role === 'CUSTOMER' 
                ? 'Bu panelden kurumsal bilgilerinizi güncelleyebilir, ilanlarınızı yönetebilirsiniz. Neo-brutalist tarzın tadını çıkarın!'
                : 'Kendinizi tanıtın, portfolyonuzu ekleyin ve dikkat çekin. Gölgelerle oynamaktan çekinmeyin!'
              }
            </p>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="md:col-span-2">
          {user.role === 'CUSTOMER' && activeTab === 'Profil Ayarları' && (
            <div className="bg-white border-[3px] border-black shadow-brutal">
              <div className="border-b-[3px] border-black p-6 bg-brutal-orange text-black">
                <h1 className="text-3xl font-black uppercase tracking-wide">Şirket Profili</h1>
                <p className="mt-1 text-sm font-bold">Fatura ve iletişim detaylarınızı yönetin.</p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <Building className="h-6 w-6" strokeWidth={2.5} /> Kurumsal Bilgiler
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="company" className="block text-sm font-bold text-black mb-2">Şirket / Marka Adı</label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full p-4"
                        placeholder="Örn: Jobio Teknoloji A.Ş."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <User className="h-6 w-6" strokeWidth={2.5} /> Yetkili Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-black mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4"
                        placeholder="Yetkili kişi adı"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                        E-posta <span className="text-xs bg-black text-white px-1 ml-1">KİLİTLİ</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          readOnly
                          disabled
                          className="w-full pl-12 p-4 bg-gray-200 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-brutal-blue px-8 py-4 text-base font-black text-white border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal transition-all"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <Save className="h-6 w-6" strokeWidth={2.5} />
                    )}
                    {saving ? 'KAYDEDİLİYOR...' : 'PROFİLİ KAYDET'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user.role === 'CUSTOMER' && activeTab === 'İlanlarım' && <MyJobsTab />}

          {user.role === 'FREELANCER' && activeTab === 'Temel Bilgiler' && (
            <div className="bg-white border-[3px] border-black shadow-brutal">
              <div className="border-b-[3px] border-black p-6 bg-brutal-yellow text-black">
                <h1 className="text-3xl font-black uppercase tracking-wide">Temel Bilgiler</h1>
                <p className="mt-1 text-sm font-bold">İletişim bilgilerinizi ve profil detaylarınızı yönetin.</p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <User className="h-6 w-6" strokeWidth={2.5} /> İletişim Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-black mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4"
                        placeholder="İsminiz ve soyisminiz"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                        E-posta <span className="text-xs bg-black text-white px-1 ml-1">KİLİTLİ</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          readOnly
                          disabled
                          className="w-full pl-12 p-4 bg-gray-200 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <FileText className="h-6 w-6" strokeWidth={2.5} /> Profil Detayları
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="bio" className="block text-sm font-bold text-black mb-2">Hakkımda (Bio)</label>
                      <textarea
                        id="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-4"
                        placeholder="Kendinizden, yeteneklerinizden ve tecrübelerinizden bahsedin..."
                      />
                    </div>
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-bold text-black mb-2">Saatlik Ücret</label>
                      <div className="relative max-w-[200px]">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <span className="font-bold text-black text-lg">$</span>
                        </div>
                        <input
                          type="number"
                          id="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                          className="w-full pl-10 pr-12 p-4"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="font-bold text-black">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-brutal-blue px-8 py-4 text-base font-black text-white border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal transition-all"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <Save className="h-6 w-6" strokeWidth={2.5} />
                    )}
                    {saving ? 'KAYDEDİLİYOR...' : 'PROFİLİ KAYDET'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user.role === 'FREELANCER' && activeTab === 'Özgeçmiş & Portfolyo' && (
            <div className="bg-white border-[3px] border-black shadow-brutal">
              <div className="border-b-[3px] border-black p-6 bg-brutal-pink text-black">
                <h1 className="text-3xl font-black uppercase tracking-wide">Özgeçmiş & Portfolyo</h1>
                <p className="mt-1 text-sm font-bold">CV'nizi yükleyin ve çalışmalarınızı sergileyin.</p>
              </div>
              
              <div className="p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <FileText className="h-6 w-6" strokeWidth={2.5} /> Özgeçmiş (CV)
                  </h3>
                  
                  <div className="mt-4 flex justify-center border-[3px] border-dashed border-black px-6 py-12 bg-brutal-yellow/10 hover:bg-brutal-yellow/20 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-black mb-4" strokeWidth={2} />
                      <div className="flex text-sm justify-center">
                        <label
                          htmlFor="cv-upload"
                          className="relative cursor-pointer bg-brutal-blue px-4 py-2 text-white font-black border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                          <span>DOSYA SEÇİN</span>
                          <input id="cv-upload" name="cv-upload" type="file" className="sr-only" accept=".pdf" onChange={uploadCv} disabled={loadingCv} />
                        </label>
                      </div>
                      <p className="text-xs font-bold mt-4">Sadece PDF (Maks. 5MB)</p>
                      
                      {loadingCv && (
                        <div className="mt-4 flex justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                        </div>
                      )}
                      
                      {user.cvUrl && !loadingCv && (
                        <div className="mt-6 inline-flex items-center gap-2 bg-green-300 text-black px-4 py-2 border-2 border-black shadow-brutal-sm font-bold">
                          <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
                          <span>Mevcut CV Yüklü</span>
                          <a href={user.cvUrl} target="_blank" rel="noreferrer" className="ml-2 bg-black text-white px-2 py-0.5 text-xs hover:bg-gray-800">Görüntüle</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-black border-t-2" />

                <form onSubmit={handleSaveProfile}>
                  <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2 inline-flex">
                    <LinkIcon className="h-6 w-6" strokeWidth={2.5} /> Portfolyo Linki
                  </h3>
                  <div>
                    <label htmlFor="portfolioUrl" className="block text-sm font-bold text-black mb-2">Websitesi veya Portfolyo</label>
                    <input
                      type="url"
                      id="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full p-4"
                      placeholder="https://www.ornek.com"
                    />
                  </div>
                  
                  <div className="pt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 bg-brutal-blue px-8 py-4 text-base font-black text-white border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal transition-all"
                    >
                      {saving ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <Save className="h-6 w-6" strokeWidth={2.5} />
                      )}
                      {saving ? 'KAYDEDİLİYOR...' : 'KAYDET'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {((user.role === 'CUSTOMER' && activeTab !== 'Profil Ayarları' && activeTab !== 'İlanlarım') || 
            (user.role === 'FREELANCER' && activeTab !== 'Temel Bilgiler' && activeTab !== 'Özgeçmiş & Portfolyo')) && (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-brutal-blue border-[4px] border-black shadow-brutal p-12 text-center -rotate-1">
              <div className="h-24 w-24 bg-brutal-yellow border-[3px] border-black shadow-brutal flex items-center justify-center mb-8 rotate-3">
                <Settings className="h-12 w-12 text-black animate-[spin_4s_linear_infinite]" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider shadow-black drop-shadow-md">YAKINDA!</h2>
              <p className="text-white text-lg font-bold max-w-md mx-auto">
                <span className="bg-black text-brutal-yellow px-2 py-1 mr-2">{activeTab}</span> 
                modülü çok yakında yayında olacak!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
        return <span className="inline-block bg-green-300 text-black border-2 border-black font-bold px-3 py-1 shadow-brutal-sm -rotate-1">AÇIK İLAN</span>;
      case 'IN_PROGRESS':
        return <span className="inline-block bg-brutal-blue text-white border-2 border-black font-bold px-3 py-1 shadow-brutal-sm rotate-1">DEVAM EDİYOR</span>;
      case 'COMPLETED':
        return <span className="inline-block bg-gray-300 text-black border-2 border-black font-bold px-3 py-1 shadow-brutal-sm -rotate-2">TAMAMLANDI</span>;
      case 'CANCELLED':
        return <span className="inline-block bg-brutal-pink text-black border-2 border-black font-bold px-3 py-1 shadow-brutal-sm rotate-2">İPTAL EDİLDİ</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white border-[3px] border-black shadow-brutal">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-brutal-yellow"></div>
        <p className="mt-4 text-base font-black uppercase">İlanlar Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-[3px] border-black shadow-brutal flex flex-col h-full min-h-[500px]">
        <div className="border-b-[3px] border-black p-6 bg-brutal-blue text-white flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide">İlanlarım</h1>
            <p className="mt-1 text-sm font-bold">Oluşturduğunuz tüm iş ilanları.</p>
          </div>
          <div className="bg-brutal-yellow text-black border-2 border-black px-4 py-2 font-black shadow-brutal-sm rotate-2">
            TOPLAM: {jobs.length}
          </div>
        </div>
        
        <div className="p-8 flex-1 overflow-auto bg-brutal-bg">
          {jobs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-white border-4 border-black shadow-brutal h-24 w-24 flex items-center justify-center mx-auto mb-6 -rotate-3">
                <Briefcase className="h-10 w-10 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-black uppercase mb-2">İLAN YOK</h3>
              <p className="text-base font-bold text-gray-700 max-w-sm mx-auto">
                Yeni bir ilan oluşturarak freelancer'larla çalışmaya başlayın.
              </p>
            </div>
          ) : (
             <div className="space-y-6">
               {jobs.map((job) => (
                 <div 
                   key={job.id} 
                   onClick={() => setSelectedJob(job)}
                   className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group cursor-pointer"
                 >
                   <div>
                     <h3 className="text-xl font-black text-black uppercase">{job.title}</h3>
                     <div className="flex items-center gap-3 mt-3 font-bold">
                       <span className="text-black bg-brutal-yellow px-2 py-1 border-2 border-black">
                         ${job.budget}
                       </span>
                       <span className="text-black bg-gray-200 px-2 py-1 border-2 border-black">
                         {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                       </span>
                     </div>
                   </div>
                   <div className="mt-6 sm:mt-0">
                     {getStatusBadge(job.status)}
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <div 
            className="bg-white border-4 border-black shadow-brutal w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-brutal-pink">
              <h2 className="text-2xl font-black text-black uppercase line-clamp-1 pr-4">{selectedJob.title}</h2>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 bg-white border-2 border-black shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <X className="h-6 w-6 text-black" strokeWidth={3} />
              </button>
            </div>
            
            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {getStatusBadge(selectedJob.status)}
                <span className="bg-brutal-yellow text-black px-3 py-1 border-2 border-black font-black rotate-1">
                  ${selectedJob.budget} BÜTÇE
                </span>
                <span className="bg-gray-200 text-black px-3 py-1 border-2 border-black font-bold -rotate-1">
                  {new Date(selectedJob.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-black text-black mb-2 uppercase border-b-2 border-black inline-block">İLAN DETAYI</h4>
                  <p className="text-black font-medium leading-loose bg-brutal-bg p-6 border-2 border-black shadow-brutal-sm">
                    {selectedJob.description || 'Detaylı açıklama bulunmuyor.'}
                  </p>
                </div>
                
                {selectedJob.freelancer && (
                  <div>
                    <h4 className="text-lg font-black text-black mb-3 uppercase border-b-2 border-black inline-block">ATANAN FREELANCER</h4>
                    <div className="flex items-center gap-4 bg-brutal-blue p-6 border-2 border-black shadow-brutal">
                      {selectedJob.freelancer.user?.avatarUrl ? (
                        <img src={selectedJob.freelancer.user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-black object-cover bg-white" />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black">
                          <User className="h-8 w-8 text-black" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-2xl text-white uppercase">{selectedJob.freelancer.user?.name || 'İsimsiz'}</p>
                        <p className="text-sm font-bold text-brutal-yellow uppercase mt-1">Bu Projede Çalışıyor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-brutal-bg border-t-4 border-black flex justify-end">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-8 py-3 bg-black text-white font-black uppercase hover:bg-gray-800 border-2 border-black hover:-translate-y-1 transition-transform"
              >
                KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
