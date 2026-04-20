'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { DollarSign, Briefcase, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  description: string;
  budget?: number;
  status: string;
  createdAt: string;
  customer?: {
    name: string;
  };
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Güvenlik: Eğer giriş yapılmadıysa axios interceptor zaten login'e atar, 
    // ama frontend tarafında hızlıca kontrol edip engellemek de iyi bir pratiktir.
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchJobs();
  }, [isAuthenticated, router]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'İlanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-25"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">İlanlar Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={fetchJobs}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          En Yeni İlanlar
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Sizin için en uygun fırsatları inceleyin ve başvurunuzu yapın.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Henüz İlan Bulunmuyor</h3>
          <p className="mt-2 text-gray-500">Kısa bir süre sonra tekrar kontrol edebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative"
            >
              {/* Statü Rozeti */}
              <div className="absolute top-6 right-6">
                 <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                    {job.status === 'OPEN' ? 'Açık' : job.status}
                 </span>
              </div>

              <div>
                <h3 className="pr-12 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                
                {job.customer?.name && (
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {job.customer.name}
                  </p>
                )}

                <div className="mt-4">
                  <div className="flex items-start text-sm text-gray-600 mb-3 line-clamp-3 min-h-[60px]">
                    <FileText className="mr-2 h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                    <span>{job.description}</span>
                  </div>

                  <div className="flex items-center text-sm font-semibold text-gray-900 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-100">
                    <DollarSign className="mr-1 h-4 w-4 text-blue-600" />
                    {job.budget ? `${job.budget} ₺` : 'Bütçe Belirtilmedi'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">
                  {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <Link href={`/jobs/${job.id}`}>
                  <button className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white">
                    Detayları Gör
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
