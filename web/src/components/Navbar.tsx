'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User as UserIcon, Briefcase, PlusCircle, Bell, X, CheckCheck, MessageSquare } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && mounted) {
      fetchNotifications();
      fetchUnreadMessages();
      // Poll every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadMessages();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, mounted]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.slice(0, 10));
      setUnreadCount(res.data.filter((n: Notification) => !n.isRead).length);
    } catch {
      // Sessizce geç
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get('/chat/unread-count');
      setUnreadMessages(res.data.count);
    } catch {
      // Sessizce geç
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-[4px] border-black bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-brutal-yellow border-2 border-black p-1 rounded-sm shadow-brutal-sm">
              <Briefcase className="h-6 w-6 text-black" strokeWidth={2.5} />
            </div>
            <Link href="/" className="text-2xl font-black tracking-tight text-black flex items-center gap-1">
              JOB<span className="text-brutal-blue">IO</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="font-black text-black hover:underline decoration-4 underline-offset-4 decoration-brutal-blue transition-all">
              İş İlanları
            </Link>
            <Link href="/freelancers" className="font-black text-black hover:underline decoration-4 underline-offset-4 decoration-brutal-pink transition-all">
              Freelancerlar
            </Link>
          </div>
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

              {/* Mesajlar İkonu */}
              <Link
                href="/messages"
                className="relative flex items-center justify-center h-10 w-10 rounded-md bg-white border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                aria-label="Mesajlar"
              >
                <MessageSquare className="h-5 w-5 text-black" strokeWidth={2.5} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black min-w-[20px] h-5 flex items-center justify-center border-2 border-black px-1">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Bildirim Zili */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="notification-bell"
                  onClick={() => setShowDropdown(v => !v)}
                  className="relative flex items-center justify-center h-10 w-10 rounded-md bg-white border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  aria-label="Bildirimler"
                >
                  <Bell className="h-5 w-5 text-black" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black min-w-[20px] h-5 flex items-center justify-center border-2 border-black px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] bg-white border-[3px] border-black shadow-brutal z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-brutal-yellow">
                      <span className="font-black uppercase text-sm text-black">Bildirimler</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            id="mark-all-read-btn"
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs font-black bg-white border-2 border-black px-2 py-1 shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                          >
                            <CheckCheck className="h-3 w-3" strokeWidth={2.5} />
                            HEPSİNİ OKU
                          </button>
                        )}
                        <button
                          onClick={() => setShowDropdown(false)}
                          className="p-1 border-2 border-black hover:bg-brutal-pink transition-colors"
                        >
                          <X className="h-3 w-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto divide-y-[2px] divide-black">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-3" strokeWidth={1.5} />
                          <p className="font-black text-sm uppercase text-gray-500">Bildirim yok</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            id={`notification-${n.id}`}
                            onClick={() => !n.isRead && handleMarkOneRead(n.id)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-brutal-yellow/30 hover:bg-brutal-yellow/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {!n.isRead && (
                                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 border border-black" />
                              )}
                              <div className={!n.isRead ? '' : 'ml-[22px]'}>
                                <p className="text-sm font-bold text-black leading-snug">{n.message}</p>
                                <p className="text-xs font-bold text-gray-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
                href="/register"
                className="rounded-md bg-brutal-blue px-5 py-2.5 text-sm font-bold text-white border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all tracking-wide"
              >
                Kayıt Ol
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-green-400 px-5 py-2.5 text-sm font-bold text-black border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all tracking-wide"
              >
                Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
