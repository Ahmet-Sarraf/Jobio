'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Send } from 'lucide-react';
import api from '@/lib/axios';

export default function CreateJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        title,
        description,
        budget: budget ? Number(budget) : undefined,
      };

      await api.post('/jobs', payload);
      
      // Navigate to home on success
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'İlan oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 sm:p-10">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
          <div className="rounded-full bg-blue-50 p-3">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni İş İlanı Oluştur</h1>
            <p className="text-sm text-gray-500">Mükemmel yeteneğe ulaşmak için ilan detaylarını girin.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                İlan Başlığı <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                required
                type="text"
                placeholder="Örn: React Native Geliştirici"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                İş Açıklaması <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={5}
                placeholder="İşin detayları, beklentiler ve teknik gereksinimler..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Bütçe (₺) <span className="text-gray-400 font-normal">(Opsiyonel)</span>
              </label>
              <input
                id="budget"
                type="number"
                placeholder="Örn: 15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70 transition-all"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  İlanı Yayınla
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
