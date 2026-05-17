'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { Sparkles, Loader2, User as UserIcon, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useToastStore } from '@/store/useToastStore';

export default function MatchmakingPage() {
  const { showToast } = useToastStore();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [customerJobs, setCustomerJobs] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  useEffect(() => {
    if (user?.role === 'CUSTOMER') {
      fetchMyJobs();
    }
  }, [user]);

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      const openJobs = res.data.filter((job: any) => job.status === 'OPEN');
      setCustomerJobs(openJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const matchFreelancers = async (jobId: string) => {
    setLoading(true);
    setHasSearched(false);
    setSelectedJob(jobId);
    setMatches([]);
    try {
      const res = await api.get(`/ai/match-freelancers/${jobId}`);
      setMatches(res.data);
      if (res.data.length > 0) {
        showToast('Freelancer eşleşmeleri başarıyla tamamlandı!', 'success');
      } else {
        showToast('Bu ilan için uygun aday bulunamadı.', 'info');
      }
    } catch (error: any) {
      console.error('AI match failed:', error);
      showToast(error.response?.data?.message || 'Yapay zeka eşleşmesinde bir hata oluştu', 'error');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const matchJobsForMe = async () => {
    setLoading(true);
    setHasSearched(false);
    setMatches([]);
    try {
      const res = await api.get('/ai/match-jobs');
      setMatches(res.data);
      if (res.data.length > 0) {
        showToast('Size özel iş teklifleri başarıyla listelendi!', 'success');
      } else {
        showToast('Profilinize uygun ilan bulunamadı.', 'info');
      }
    } catch (error: any) {
      console.error('AI match failed:', error);
      showToast(error.response?.data?.message || 'Yapay zeka eşleşmesinde bir hata oluştu', 'error');
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  if (!_hasHydrated) return null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fdfdfd] p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brutal-yellow border-4 border-black p-2 rounded-sm shadow-brutal-sm">
            <Sparkles className="h-8 w-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-black">Sihirli Eşleşme</h1>
        </div>

        {user?.role === 'CUSTOMER' ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-4 uppercase">Açık İlanlarınız</h2>
              {customerJobs.length === 0 ? (
                <div className="bg-white border-4 border-black p-6 shadow-brutal font-bold">
                  Hiç açık ilanınız bulunmuyor. Eşleştirme yapabilmek için önce bir ilan oluşturun.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customerJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => matchFreelancers(job.id)}
                      className={`text-left p-4 border-4 border-black font-bold transition-transform hover:-translate-y-1 hover:shadow-brutal ${
                        selectedJob === job.id ? 'bg-brutal-yellow shadow-none translate-y-1' : 'bg-white shadow-brutal-sm'
                      }`}
                    >
                      <h3 className="text-xl mb-1 truncate">{job.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{job.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <BrutalAiLoader />
            )}

            {!loading && hasSearched && matches.length === 0 && (
              <div className="bg-brutal-pink/30 border-4 border-black p-6 shadow-brutal text-center font-bold text-xl uppercase mt-8">
                Maalesef bu ilan için uygun freelancer profili bulunamadı.
              </div>
            )}

            {!loading && matches.length > 0 && (
              <div>
                <h2 className="text-2xl font-black mb-4 uppercase">Önerilen Freelancerlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-brutal-pink/30 border-4 border-black p-6 shadow-brutal transform transition-transform hover:scale-[1.02] rotate-[-1deg]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/freelancers/${m.freelancerId}`} className="flex items-center gap-2 hover:underline decoration-4">
                          <div className="bg-white border-2 border-black p-1 rounded-full">
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <span className="font-black text-xl">{m.name || 'Profili Gör'}</span>
                        </Link>
                        <div className="bg-brutal-yellow border-2 border-black px-3 py-1 font-black text-lg shadow-brutal-sm">
                          Uyum Skoru: %{m.matchScore}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-black p-4 text-black font-bold text-sm leading-relaxed">
                        <span className="bg-black text-white px-1 py-0.5 mr-2 uppercase text-xs">Neden Uygun?</span>
                        {m.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-12">
            <button
              onClick={matchJobsForMe}
              disabled={loading}
              className="group relative flex items-center justify-center px-8 py-6 bg-brutal-yellow border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-10 w-10 animate-spin text-black" />
              ) : (
                <div className="flex items-center gap-4">
                  <Sparkles className="h-10 w-10 text-black group-hover:animate-spin" />
                  <span className="text-3xl sm:text-4xl font-black uppercase text-black tracking-tight">
                    Bana Uygun İşleri Bul
                  </span>
                </div>
              )}
            </button>

            {loading && (
              <BrutalAiLoader />
            )}

            {!loading && hasSearched && matches.length === 0 && (
              <div className="w-full mt-12 bg-brutal-blue/20 border-4 border-black p-6 shadow-brutal text-center font-bold text-xl uppercase">
                Şu an için profilinize uygun açık ilan bulunamadı. Yeteneklerinizi güncellemeyi deneyebilirsiniz.
              </div>
            )}

            {!loading && matches.length > 0 && (
              <div className="w-full mt-12">
                <h2 className="text-2xl font-black mb-6 uppercase text-center">Senin İçin Seçtiğimiz İlanlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-brutal-blue/20 border-4 border-black p-6 shadow-brutal transform transition-transform hover:scale-[1.02] rotate-[1deg]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Link href={`/jobs/${m.jobId}`} className="flex items-center gap-2 hover:underline decoration-4">
                          <div className="bg-white border-2 border-black p-1 rounded-sm">
                            <Briefcase className="h-6 w-6" />
                          </div>
                          <span className="font-black text-xl">{m.title || 'İlanı İncele'}</span>
                        </Link>
                        <div className="bg-brutal-yellow border-2 border-black px-3 py-1 font-black text-lg shadow-brutal-sm">
                          Uyum Skoru: %{m.matchScore}
                        </div>
                      </div>
                      <div className="bg-white border-2 border-black p-4 text-black font-bold text-sm leading-relaxed">
                        <span className="bg-black text-white px-1 py-0.5 mr-2 uppercase text-xs">Neden Uygun?</span>
                        {m.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BrutalAiLoader() {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const loadingTexts = [
    'Yapay Zeka Profilleri İnceliyor...',
    'Eşleşme Puanları Hesaplanıyor...',
    'Adayların Yetenekleri Analiz Ediliyor...',
    'Sihirli Eşleşmeler Hazırlanıyor...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 relative w-full">
      <div className="bg-white border-[4px] border-black p-8 shadow-brutal max-w-sm w-full text-center relative rotate-1 overflow-hidden hover-wobble">
        <div className="absolute top-2 left-2 animate-ping h-3 w-3 bg-brutal-yellow border border-black rounded-full"></div>
        <div className="absolute bottom-4 right-4 animate-bounce h-4 w-4 bg-brutal-pink border-2 border-black rounded-full" style={{ animationDelay: '0.2s' }}></div>
        
        <div className="bg-brutal-yellow border-4 border-black p-4 rounded-sm shadow-brutal-sm w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-spin">
          <Sparkles className="h-10 w-10 text-black" strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-black text-black uppercase mb-2 tracking-wide animate-pulse">
          {loadingTexts[loadingTextIndex]}
        </h3>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          SİHİRLİ EŞLEŞTİRME SİSTEMİ v2.0
        </p>
      </div>
    </div>
  );
}
