'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import api from '@/lib/axios';
import { User, Mail, Camera, FileText, CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuthStore();
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Sayfa açılınca backend'den en güncel profil verisini çek
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        updateUserProfile({
          avatarUrl: res.data.avatarUrl ?? undefined,
          cvUrl: res.data.cvUrl ?? undefined,
          name: res.data.name ?? undefined,
        });
      } catch { /* sessizce hata yut, eski cache'teki veri gösterilir */ }
    };
    fetchProfile();
  }, []);

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

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Public URL oluşturma
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updateUserProfile({ avatarUrl: publicUrl });
      // DB'ye kaydet — tüm cihazlar bu URL'yi görebilsin
      await api.patch('/users/me', { avatarUrl: publicUrl });
      setMessage({ text: 'Profil fotoğrafı başarıyla güncellendi.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Fotoğraf yüklenemedi.', type: 'error' });
    } finally {
      setLoadingAvatar(false);
    }
  };

  const uploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = getFileExtension(file.name);
    const fileName = `${user.id}-cv-${Date.now()}.${fileExt}`;

    try {
      setLoadingCv(true);
      setMessage(null);

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      updateUserProfile({ cvUrl: publicUrl });
      // DB'ye kaydet — tüm cihazlar bu URL'yi görebilsin
      await api.patch('/users/me', { cvUrl: publicUrl });
      setMessage({ text: 'CV özgeçmişiniz başarıyla yüklendi.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'CV yüklenemedi.', type: 'error' });
    } finally {
      setLoadingCv(false);
    }
  };

  if (!user) {
    return null; // or loading
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 sm:h-48"></div>
        
        {/* Profile Info & Avatar */}
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="-mt-16 sm:-mt-24 sm:flex sm:items-end sm:space-x-5">
            <div className="relative group flex h-32 w-32 items-center justify-center rounded-full ring-4 ring-white sm:h-48 sm:w-48 bg-gray-100 overflow-hidden cursor-pointer">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
              
              {/* Avatar Upload Overlay */}
              <label htmlFor="avatar-upload" className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {loadingAvatar ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-white" />
                    <span className="text-xs text-white mt-1 font-medium">Değiştir</span>
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
            
            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="truncate text-3xl font-bold text-gray-900">{user.name || 'İsimsiz Kullanıcı'}</h1>
                <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {user.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold text-gray-900">{user.name || 'İsimsiz'}</h1>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
               <Mail className="h-4 w-4" /> {user.email}
            </p>
          </div>

          {message && (
            <div className={`mt-6 rounded-lg p-4 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
              <div>
                <h3 className="text-sm font-medium">{message.type === 'success' ? 'Başarılı' : 'Hata'}</h3>
                <p className="text-sm mt-1">{message.text}</p>
              </div>
            </div>
          )}

          {/* CV Section */}
          <div className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" /> Belgeler ve Özgeçmiş
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Şirketlerin size ulaşabilmesi ve ilanlara başvurabilmeniz için PDF formatında özgeçmişinizi yükleyin.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {user.cvUrl ? (
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-4 w-full sm:w-auto flex-1 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded shrink-0">
                      <FileText className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mevcut Özgeçmiş (Yüklü)</p>
                      <a href={user.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Görüntüle / İndir</a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex bg-orange-50 border border-orange-100 rounded-lg p-4 w-full sm:w-auto flex-1 items-center gap-3 text-orange-800">
                   <AlertCircle className="h-6 w-6 shrink-0" />
                   <p className="text-sm">Sisteme henüz bir CV yüklenmemiş. Başvurularınızı tamamlamak için CV yüklemeniz şarttır.</p>
                </div>
              )}

              <div className="w-full sm:w-auto shrink-0 relative">
                <input 
                  type="file" 
                  id="cv-upload" 
                  accept=".pdf,.doc,.docx" 
                  className="hidden" 
                  disabled={loadingCv}
                  onChange={uploadCV}
                />
                <label 
                  htmlFor="cv-upload" 
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
                >
                  {loadingCv ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {user.cvUrl ? 'Yeni CV Yükle' : 'CV Yükle'}
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
