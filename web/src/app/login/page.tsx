'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Mail, Lock, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/login', { email, password });
      const { user: supaUser, access_token } = response.data.session;
      const formattedUser = {
        ...supaUser,
        role: supaUser.user_metadata?.user_role,
        name: supaUser.user_metadata?.name || '',
      };
      login(formattedUser, access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fdfbf7]">
      {/* Sol: Neo-Brutalist Panel (Geniş ekranlarda görünür) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-brutal-yellow border-r-[4px] border-black flex-col items-center justify-center p-16">
        {/* Dekoratif İş İlanları Mock */}
        <div className="absolute top-8 left-8 bg-white border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3 max-w-[220px]">
          <p className="text-xs font-black uppercase text-black/50 mb-1">Yeni İlan</p>
          <p className="font-black text-black uppercase text-sm">React.js Geliştirici Aranıyor</p>
          <p className="text-xs font-bold text-black/60 mt-1">Bütçe: ₺12.000</p>
          <span className="inline-block bg-green-300 border-2 border-black px-2 py-0.5 text-xs font-black mt-2">AÇIK</span>
        </div>
        <div className="absolute top-24 right-8 bg-brutal-pink border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2 max-w-[200px]">
          <p className="text-xs font-black uppercase text-black/50 mb-1">Freelancer</p>
          <p className="font-black text-black uppercase text-sm">Ahmet Y.</p>
          <p className="text-xs font-bold text-black/60 mt-1">★★★★☆ 4.3 / 5</p>
        </div>
        <div className="absolute bottom-24 left-12 bg-blue-300 border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1 max-w-[200px]">
          <p className="text-xs font-black uppercase text-black/50 mb-1">Tamamlandı</p>
          <p className="font-black text-black uppercase text-sm">Logo Tasarımı</p>
          <p className="text-xs font-bold text-green-700 mt-1">✔ Ödeme Alındı</p>
        </div>
        <div className="absolute bottom-16 right-12 bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
          <p className="text-xs font-black uppercase">18 Yeni Başvuru</p>
        </div>

        {/* Ana İçerik */}
        <div className="text-center z-10 relative">
          <div className="flex justify-center gap-3 mb-8">
            {['J','O','B','I','O'].map((char, i) => (
              <span key={i} className={`inline-block border-[4px] border-black px-4 py-2 font-black text-5xl text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                ['bg-white', 'bg-brutal-pink', 'bg-brutal-blue text-white', 'bg-green-300', 'bg-white'][i % 5]
              } ${['-rotate-3','rotate-2','-rotate-1','rotate-3','-rotate-2'][i]}`}>{char}</span>
            ))}
          </div>
          <div className="bg-black text-white border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] -rotate-1">
            <p className="text-2xl font-black uppercase tracking-tight mb-2">Yetenek Pazarı</p>
            <p className="text-sm font-bold text-white/70">Türkiye&apos;nin En İyi Freelance Platformu</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[{ val: '2.4K+', label: 'Freelancer' }, { val: '850+', label: 'İlan' }, { val: '98%', label: 'Memnuniyet' }].map((s, i) => (
              <div key={i} className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                <p className="text-2xl font-black text-black">{s.val}</p>
                <p className="text-xs font-bold text-black/60 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ: Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">

          {/* Header Sticker */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-brutal-yellow border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5 rotate-3 hover:rotate-0 transition-transform">
              <Briefcase className="h-8 w-8 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              Tekrar<br />
              <span className="bg-brutal-yellow px-2 -rotate-1 inline-block">Hoş Geldin!</span>
            </h1>
            <p className="mt-3 text-base font-bold text-black/60">
              Hesabına giriş yap, fırsatları yakala.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-brutal-pink border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-black" strokeWidth={2.5} />
                <p className="text-sm font-bold text-black">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-black text-black uppercase mb-2" htmlFor="email">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-black/40" strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border-[2px] border-black bg-white pl-10 py-3 text-black font-bold placeholder:text-black/30 focus:bg-amber-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                    placeholder="siz@ornek.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-black text-black uppercase mb-2" htmlFor="password">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-black/40" strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border-[2px] border-black bg-white pl-10 py-3 text-black font-bold placeholder:text-black/30 focus:bg-amber-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 bg-green-400 px-6 py-4 text-base font-black text-black uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  ) : null}
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap →'}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm font-bold text-black">
            Hesabın yok mu?{' '}
            <Link
              href="/register"
              className="font-black text-black underline decoration-2 underline-offset-2 hover:bg-brutal-yellow transition-colors px-1"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
