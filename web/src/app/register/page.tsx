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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#fdfbf7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">

        {/* Header Sticker */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-brutal-pink border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-5 -rotate-3 hover:rotate-0 transition-transform">
            <Briefcase className="h-8 w-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">
            Hemen<br />
            <span className="bg-brutal-pink px-2 rotate-1 inline-block">Katıl!</span>
          </h1>
          <p className="mt-3 text-base font-bold text-black/60">
            Jobio'ya kayıt ol, geleceğini şekillendir.
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
  );
}
