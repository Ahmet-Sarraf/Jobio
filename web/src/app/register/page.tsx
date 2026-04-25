'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Mail, Lock, User, Building, Laptop } from 'lucide-react';
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
      // Adjust endpoint matching your NestJS backend
      await api.post('/auth/register', { name, email, password, role });
      
      // On success, redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl ring-1 ring-gray-200">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Jobio to find your next opportunity
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Kullanım Amacı
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setRole('CUSTOMER')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  role === 'CUSTOMER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-1 ring-blue-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <Building className={`h-7 w-7 mb-2 ${role === 'CUSTOMER' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-semibold">İşveren / Müşteri</span>
              </div>

              <div
                onClick={() => setRole('FREELANCER')}
                className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  role === 'FREELANCER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-1 ring-blue-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <Laptop className={`h-7 w-7 mb-2 ${role === 'FREELANCER' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-semibold">Freelancer / İş Arıyorum</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 pl-10 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 pl-10 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 pl-10 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
