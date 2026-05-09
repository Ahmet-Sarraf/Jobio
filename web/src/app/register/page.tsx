'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Mail, Lock, User, Building, Laptop, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'FREELANCER' | 'CUSTOMER'>('FREELANCER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/register', { name, email, password, role });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#fdfbf7]">
      {/* Sol: Neo-Brutalist Panel */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-brutal-red border-r-[4px] border-black flex-col items-center justify-center p-16">
        {/* Dekoratif Kartlar */}
        <div className="absolute top-12 left-8 bg-white border-[3px] border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2 max-w-[220px]">
          <p className="text-xs font-black uppercase text-black/50 mb-2">Freelancer</p>
          <p className="font-black text-black uppercase text-base">Zeynep K.</p>
          <p className="text-xs font-bold text-black/60 mt-1">★★★★★ 5.0 / 5</p>
          <p className="text-xs font-bold text-black/50 mt-1">Frontend Developer</p>
        </div>
        <div className="absolute top-8 right-8 bg-brutal-yellow border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3 max-w-[200px]">
          <p className="text-xs font-black uppercase text-black/50 mb-1">Yeni Başvuru</p>
          <p className="font-black text-black uppercase text-sm">UI/UX Tasarımı</p>
          <p className="text-xs font-bold text-black/60 mt-1">Bütçe: ₺8.500</p>
        </div>
        <div className="absolute bottom-16 left-8 bg-blue-300 border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-2 max-w-[200px]">
          <p className="text-xs font-black uppercase text-black/50 mb-1">İş Teklifi</p>
          <p className="font-black text-black uppercase text-sm">Python Geliştirici</p>
          <p className="text-xs font-bold text-green-700 mt-1">₺22.000 Bütçe</p>
        </div>
        <div className="absolute bottom-24 right-12 bg-white border-[3px] border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <p className="text-xs font-black uppercase">3.2K Aktif İlan</p>
        </div>

        {/* Ana İçerik */}
        <div className="text-center z-10 relative">
          <div className="bg-black text-white border-[4px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] rotate-1 mb-8 hover:rotate-0 transition-transform">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Neden Jobio?</h2>
            <ul className="space-y-3 text-left">
              {[
                { icon: '🚀', text: 'Hızlı eşleşme, anlık bildirimler' },
                { icon: '💼', text: 'Güvenilir işveren ve freelancer havuzu' },
                { icon: '⭐', text: 'Kapsamlı değerlendirme sistemi' },
                { icon: '💰', text: 'Türkiye&apos;nin en iyi iş frelanş platformu' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-white/90 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ val: '2.4K+', label: 'Freelancer' }, { val: '850+', label: 'İlan' }, { val: '4.9★', label: 'Ortalama' }].map((s, i) => (
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
            <div className="inline-flex items-center justify-center h-16 w-16 bg-brutal-red border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5 -rotate-3 hover:rotate-0 transition-transform">
              <Briefcase className="h-8 w-8 text-black" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black text-black uppercase tracking-tight">
              Hemen<br />
              <span className="bg-brutal-red px-2 rotate-1 inline-block text-white">Katıl!</span>
            </h1>
            <p className="mt-3 text-base font-bold text-black/60">
              Jobio&apos;ya kayıt ol, geleceğini şekillendir.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">

            {/* Error Banner */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-brutal-red border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1 text-white">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-black" strokeWidth={2.5} />
                <p className="text-sm font-bold text-black">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-black text-black uppercase mb-3">
                  Kullanım Amacı
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* CUSTOMER */}
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`cursor-pointer border-[3px] border-black p-4 flex flex-col items-center justify-center text-center transition-all duration-150 ${
                      role === 'CUSTOMER'
                        ? 'bg-brutal-blue text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <Building
                      className={`h-7 w-7 mb-2 ${role === 'CUSTOMER' ? 'text-white' : 'text-black'}`}
                      strokeWidth={2.5}
                    />
                    <span className="text-sm font-black uppercase">İşveren</span>
                    <span className={`text-xs font-bold mt-0.5 ${role === 'CUSTOMER' ? 'text-white/80' : 'text-black/50'}`}>
                      Müşteri
                    </span>
                  </button>

                  {/* FREELANCER */}
                  <button
                    type="button"
                    onClick={() => setRole('FREELANCER')}
                    className={`cursor-pointer border-[3px] border-black p-4 flex flex-col items-center justify-center text-center transition-all duration-150 ${
                      role === 'FREELANCER'
                        ? 'bg-brutal-yellow text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <Laptop
                      className={`h-7 w-7 mb-2 ${role === 'FREELANCER' ? 'text-black' : 'text-black'}`}
                      strokeWidth={2.5}
                    />
                    <span className="text-sm font-black uppercase">Freelancer</span>
                    <span className={`text-xs font-bold mt-0.5 ${role === 'FREELANCER' ? 'text-black/70' : 'text-black/50'}`}>
                      İş Arıyorum
                    </span>
                  </button>
                </div>
              </div>

              {/* Seçim etiketi */}
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black font-black text-xs uppercase shadow-brutal-sm transition-all ${role === 'FREELANCER' ? 'bg-brutal-yellow text-black -rotate-1' : 'bg-brutal-blue text-white rotate-1'}`}>
                  {role === 'FREELANCER' ? <Laptop className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Building className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {role === 'FREELANCER' ? 'Freelancer Olarak Devam' : 'İşveren Olarak Devam'}
                </div>
              </div>

              {/* Ad Soyad */}
              <div>
                <label className="block text-sm font-black text-black uppercase mb-2" htmlFor="name">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-black/40" strokeWidth={2} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border-[2px] border-black bg-white pl-10 py-3 text-black font-bold placeholder:text-black/30 focus:bg-amber-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>
              </div>

              {/* E-posta */}
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

              {/* Şifre */}
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full border-[2px] border-black bg-white pl-10 py-3 text-black font-bold placeholder:text-black/30 focus:bg-amber-50 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
                    placeholder="En az 6 karakter"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 bg-brutal-blue px-6 py-4 text-base font-black text-white uppercase tracking-wider border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : null}
                  {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol →'}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm font-bold text-black">
            Zaten hesabın var mı?{' '}
            <Link
              href="/login"
              className="font-black text-black underline decoration-2 underline-offset-2 hover:bg-brutal-yellow transition-colors px-1"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
