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
    if (isAuthenticated) {
      fetchJobs();
    } else {
      setLoading(false);
    }
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
        <div className="h-16 w-16 border-4 border-black border-t-brutal-yellow animate-spin shadow-brutal-sm bg-white"></div>
        <p className="text-black font-black uppercase tracking-widest animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="bg-brutal-pink border-4 border-black shadow-brutal p-8 text-center -rotate-1">
          <p className="text-xl font-black text-black uppercase">{error}</p>
        </div>
        <button
          onClick={fetchJobs}
          className="bg-brutal-blue border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none px-8 py-3 font-black text-white uppercase transition-all"
        >
          TEKRAR DENE
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
      <div className="mb-12 text-center sm:text-left bg-brutal-blue text-white border-4 border-black p-8 shadow-brutal inline-block -rotate-1 hover:rotate-0 transition-transform">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider">
          En Yeni İlanlar
        </h1>
        <p className="mt-3 text-lg font-bold">
          Sizin için en uygun fırsatları inceleyin ve başvurunuzu yapın.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 bg-white border-[4px] border-black p-16 text-center shadow-brutal rotate-1">
          <div className="mx-auto flex h-24 w-24 items-center justify-center bg-brutal-yellow border-4 border-black shadow-brutal -rotate-3 mb-6">
            <Briefcase className="h-12 w-12 text-black" strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-black text-black uppercase">Henüz İlan Bulunmuyor</h3>
          <p className="mt-4 text-lg font-bold text-gray-700">Kısa bir süre sonra tekrar kontrol edebilirsiniz.</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between bg-white border-[4px] border-black p-6 shadow-brutal hover:-translate-y-2 hover:-translate-x-2 transition-transform relative"
            >
              {/* Statü Rozeti */}
              <div className="absolute -top-4 -right-4 rotate-6 group-hover:rotate-12 transition-transform">
                 <span className={`inline-block border-2 border-black px-4 py-1 text-sm font-black uppercase shadow-brutal-sm ${job.status === 'OPEN' ? 'bg-green-300 text-black' : 'bg-gray-300 text-black'}`}>
                    {job.status === 'OPEN' ? 'Açık' : job.status}
                 </span>
              </div>

              <div>
                <h3 className="pr-12 text-2xl font-black text-black uppercase mb-2 line-clamp-2">
                  {job.title}
                </h3>
                
                {job.customer?.name && (
                  <p className="text-base font-bold text-gray-600 bg-gray-100 inline-block px-2 border-2 border-black">
                    {job.customer.name}
                  </p>
                )}

                <div className="mt-6">
                  <div className="flex items-start text-base font-medium text-black mb-4 line-clamp-3 min-h-[60px] bg-brutal-bg p-3 border-2 border-black">
                    {job.description}
                  </div>

                  <div className="flex items-center text-lg font-black text-black bg-brutal-yellow inline-flex px-4 py-2 border-2 border-black shadow-brutal-sm -rotate-2">
                    <DollarSign className="mr-1 h-5 w-5" strokeWidth={3} />
                    {job.budget ? `${job.budget} ₺` : 'Bütçe Belirtilmedi'}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t-4 border-black flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                </span>
                <Link href={`/jobs/${job.id}`}>
                  <button className="bg-brutal-pink px-5 py-2.5 text-sm font-black text-black uppercase border-2 border-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
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

function LandingPage() {
  const letters = [
    { char: 'J', color: 'bg-brutal-yellow', rotate: '-rotate-6', mt: 'mt-2' },
    { char: 'O', color: 'bg-brutal-pink', rotate: 'rotate-3', mt: '-mt-4' },
    { char: 'B', color: 'bg-brutal-blue', rotate: '-rotate-12', mt: 'mt-1' },
    { char: 'I', color: 'bg-brutal-orange', rotate: 'rotate-6', mt: '-mt-2' },
    { char: 'O', color: 'bg-green-300', rotate: '-rotate-3', mt: 'mt-3' },
  ];

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-transparent px-4 sm:px-6 lg:px-8 relative overflow-hidden py-20">
      
      {/* Animated Sticker Text */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-16 drop-shadow-sm z-10">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] px-5 py-2 sm:px-8 sm:py-4 font-black text-7xl sm:text-8xl md:text-9xl text-black ${letter.color} ${letter.rotate} ${letter.mt} hover:-translate-y-4 hover:rotate-0 hover:scale-110 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-12 duration-700`}
            style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
          >
            {letter.char}
          </span>
        ))}
      </div>

      {/* Intro Text Box */}
      <div 
        className="max-w-3xl text-center bg-white border-[4px] border-black shadow-brutal p-8 md:p-12 mb-16 -rotate-1 hover:rotate-0 transition-transform z-10"
        style={{ animationDelay: '800ms', animationFillMode: 'backwards' }}
      >
        <div className="mb-6">
          <span className="text-sm sm:text-base font-black text-black tracking-[0.2em] uppercase bg-brutal-yellow inline-block px-6 py-2 border-[3px] border-black shadow-brutal-sm -rotate-2">
            Geleceğin İş Gücü Platformu
          </span>
        </div>
        <p className="text-lg sm:text-xl md:text-2xl text-black leading-relaxed font-bold">
          Jobio, yetenekli freelancer'ları vizyoner işverenlerle buluşturan yeni nesil bir ekosistemdir. Hemen katılın, vizyonunuzu hayata geçirin veya hayalinizdeki işi bulun.
        </p>
      </div>

      {/* Action Buttons */}
      <div 
        className="flex flex-col sm:flex-row gap-6 animate-in fade-in zoom-in-95 duration-700 w-full sm:w-auto px-6 sm:px-0 z-10"
        style={{ animationDelay: '1200ms', animationFillMode: 'backwards' }}
      >
        <Link href="/login" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black text-xl border-[4px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-widest">
            Giriş Yap
          </button>
        </Link>
        <Link href="/register" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-12 py-5 bg-brutal-blue text-white font-black text-xl border-[4px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-widest">
            Hemen Kaydol
          </button>
        </Link>
      </div>
    </div>
  );
}
