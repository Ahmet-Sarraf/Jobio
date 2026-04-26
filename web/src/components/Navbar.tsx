'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User as UserIcon, Briefcase, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // We only run this on the client to avoid hydration mismatch with Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-[4px] border-black bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="bg-brutal-yellow border-2 border-black p-1 rounded-sm shadow-brutal-sm">
            <Briefcase className="h-6 w-6 text-black" strokeWidth={2.5} />
          </div>
          <Link href="/" className="text-2xl font-black tracking-tight text-black flex items-center gap-1">
            JOB<span className="text-brutal-blue">IO</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!mounted ? (
            <div className="h-10 w-24 border-2 border-black rounded-md bg-gray-200" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/create-job"
                className="hidden sm:flex items-center gap-1.5 rounded-md bg-brutal-yellow px-4 py-2 text-sm font-bold text-black border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <PlusCircle className="h-5 w-5" strokeWidth={2.5} />
                <span>İlan Oluştur</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-bold text-black border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <UserIcon className="h-5 w-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Profil</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md bg-brutal-pink px-4 py-2 text-sm font-bold text-black border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-black border-b-2 border-transparent hover:border-black transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brutal-blue px-5 py-2.5 text-sm font-bold text-white border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all tracking-wide"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
