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
    // Redirect logic could be handled here or via the Link/Button
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Job<span className="text-blue-600">io</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!mounted ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-gray-200" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/create-job"
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <PlusCircle className="h-4 w-4" />
                <span>İlan Oluştur</span>
              </Link>
              
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              >
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">Profil</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 shadow-sm"
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
