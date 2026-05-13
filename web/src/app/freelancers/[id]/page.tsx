'use client';

import { use, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { User, Star, Briefcase, FileText, Link as LinkIcon, MessageSquare, Download } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function FreelancerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [freelancer, setFreelancer] = useState<any>(null);
  const [reviewsData, setReviewsData] = useState<{ averageScore: number, totalReviews: number, reviews: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Post-it colors
  const postitColors = ['bg-brutal-yellow', 'bg-brutal-pink', 'bg-green-200', 'bg-blue-200', 'bg-orange-200'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get(`/users/freelancer/${id}`),
          api.get(`/reviews/freelancer/${id}`)
        ]);
        setFreelancer(profileRes.data);
        setReviewsData(reviewsRes.data);
      } catch (err) {
        console.error('Profil yüklenirken hata oluştu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Sadece CUSTOMER rolü başlatabilir kontrolü (AuthStore da role string olabilir)
    const isCustomer = user?.role === 'CUSTOMER' || (user as any)?.user_metadata?.user_role === 'CUSTOMER';
    if (!isCustomer) {
      alert('Sadece İşverenler mesajlaşma başlatabilir.');
      return;
    }

    try {
      await api.post('/chat/start', { freelancerId: freelancer.id });
      router.push('/messages');
    } catch (err) {
      console.error('Mesaj başlatılamadı:', err);
      alert('Sohbet başlatılırken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-black border-t-brutal-pink"></div>
        <p className="mt-6 text-2xl font-black uppercase text-black">Yükleniyor...</p>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center p-4">
        <div className="bg-white border-[4px] border-black p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-2">
          <User className="h-24 w-24 mx-auto text-black mb-6" strokeWidth={2.5} />
          <h1 className="text-4xl font-black uppercase mb-4">Freelancer Bulunamadı</h1>
          <p className="text-xl font-bold">Aradığınız profil mevcut değil veya kaldırılmış.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brutal-bg">
      
      <main className="mx-auto max-w-[1800px] px-4 py-16 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 items-start">
          {/* Sol Kolon - Profil Kartı */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
              <div className="relative mx-auto h-40 w-40 rounded-full border-[4px] border-black bg-brutal-yellow overflow-hidden mb-6 flex items-center justify-center shadow-brutal -rotate-3 hover:rotate-0 transition-transform">
                {freelancer.avatarUrl ? (
                  <img src={freelancer.avatarUrl} alt={freelancer.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-6xl font-black">{freelancer.name?.charAt(0)}</span>
                )}
              </div>
              
              <h1 className="text-3xl font-black uppercase text-black mb-2">{freelancer.name}</h1>
              <p className="text-sm font-bold bg-black text-white px-3 py-1 inline-block -rotate-2 shadow-brutal-sm mb-6">FREELANCER</p>
              
              <div className="flex flex-col items-center justify-center gap-2 mb-6">
                <div className="flex items-center justify-center gap-1 text-xl font-black">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`h-6 w-6 ${star <= Math.round(reviewsData?.averageScore || 0) ? 'fill-brutal-yellow text-black' : 'fill-transparent text-gray-400'}`} strokeWidth={2.5} />
                  ))}
                  <span className="ml-2 text-2xl">{reviewsData?.averageScore ? Number(reviewsData.averageScore).toFixed(1) : '0.0'}</span>
                </div>
                <span className="text-sm font-bold text-gray-600">({reviewsData?.totalReviews || 0} Değerlendirme)</span>
              </div>

              {freelancer.hourlyRate && (
                <div className="bg-green-300 border-2 border-black p-3 mb-6 font-black text-xl shadow-brutal-sm rotate-1">
                  {freelancer.hourlyRate} ₺ / SAAT
                </div>
              )}

              <div className="space-y-4">
                {(!isAuthenticated || user?.role === 'CUSTOMER' || (user as any)?.user_metadata?.user_role === 'CUSTOMER') && (
                  <button onClick={handleStartChat} className="w-full flex items-center justify-center gap-2 bg-brutal-blue text-white border-[3px] border-black py-4 font-black uppercase shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
                    <MessageSquare className="h-5 w-5" strokeWidth={2.5} /> Mesaj Gönder
                  </button>
                )}
                {freelancer.portfolioUrl && (
                  <a href={freelancer.portfolioUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-white text-black border-[3px] border-black py-4 font-black uppercase shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">
                    <LinkIcon className="h-5 w-5" strokeWidth={2.5} /> Portfolyo
                  </a>
                )}
                {isAuthenticated && (user?.role === 'CUSTOMER' || (user as any)?.user_metadata?.user_role === 'CUSTOMER') && freelancer.resumeUrl && (
                  <a href={freelancer.resumeUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-brutal-pink text-black border-[3px] border-black py-4 font-black uppercase shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all mt-4">
                    <Download className="h-5 w-5" strokeWidth={2.5} /> CV'yi Görüntüle
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Detaylar */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Hakkında */}
            <div className="bg-brutal-yellow border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <h2 className="text-2xl font-black uppercase border-b-[4px] border-black pb-4 mb-6 flex items-center gap-3">
                <FileText className="h-8 w-8" strokeWidth={2.5} /> HAKKINDA
              </h2>
              <p className="font-bold text-lg leading-relaxed whitespace-pre-wrap">
                {freelancer.bio || "Bu freelancer henüz hakkında bir bilgi eklememiş."}
              </p>
            </div>

            {/* Yetenekler */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="bg-brutal-pink border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <h2 className="text-2xl font-black uppercase border-b-[4px] border-black pb-4 mb-6 flex items-center gap-3">
                  <Briefcase className="h-8 w-8" strokeWidth={2.5} /> YETENEKLER
                </h2>
                <div className="flex flex-wrap gap-3">
                  {freelancer.skills.map((skill: any) => (
                    <span key={skill.id} className="bg-white text-black font-black uppercase px-4 py-2 border-[3px] border-black shadow-brutal-sm hover:-translate-y-1 transition-transform">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Değerlendirmeler */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-4xl font-black uppercase text-black drop-shadow-md">
                  Değerlendirmeler
                  <span className="ml-4 text-xl bg-black text-white px-3 py-1 align-middle">{reviewsData?.totalReviews || 0}</span>
                </h2>
                
                {reviewsData && reviewsData.totalReviews > 0 && (
                  <div className="flex items-center gap-2 bg-brutal-yellow border-[3px] border-black px-4 py-2 shadow-brutal-sm rotate-1">
                    <span className="text-2xl font-black">{Number(reviewsData.averageScore).toFixed(1)}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`h-5 w-5 ${star <= Math.round(reviewsData.averageScore) ? 'fill-black text-black' : 'fill-transparent text-gray-500'}`} strokeWidth={2.5} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {!reviewsData || reviewsData.reviews.length === 0 ? (
                <div className="bg-white border-[4px] border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Star className="h-16 w-16 mx-auto text-gray-300 mb-4" strokeWidth={2} />
                  <p className="text-xl font-bold uppercase text-gray-500">Henüz değerlendirme yapılmamış.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviewsData.reviews.map((review: any) => (
                    <div key={review.id} className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <h3 className="text-2xl font-black uppercase line-clamp-2 flex-1">{review.job?.title || 'İsimsiz İş'}</h3>
                        <div className="flex items-center gap-1 shrink-0 bg-gray-100 border-2 border-black px-3 py-1">
                          <span className="font-black mr-2">{review.score}.0</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-5 w-5 ${star <= review.score ? 'fill-brutal-yellow text-black' : 'fill-transparent text-gray-400'}`} strokeWidth={2.5} />
                          ))}
                        </div>
                      </div>
                      
                      <p className="font-bold text-lg text-gray-800 italic border-l-4 border-brutal-yellow pl-4 whitespace-pre-wrap">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
