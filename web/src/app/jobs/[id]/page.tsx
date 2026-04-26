'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Clock, Building, ArrowLeft, Send, Tag, Briefcase, BarChart, CalendarDays, CheckCircle2, BadgeCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  category?: string;
  experienceLevel?: string;
  duration?: string;
  budget?: number;
  status: string;
  createdAt: string;
  requiredSkills?: Skill[];
  customer?: {
    company?: string;
    user?: {
      name: string;
      avatarUrl?: string;
    };
  };
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs');
      const foundJob = response.data.find((j: Job) => j.id === id);
      
      if (foundJob) {
        setJob(foundJob);
      } else {
        setError('İlan bulunamadı veya silinmiş.');
      }
    } catch (err: any) {
      setError('İlan detayları yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role === 'CUSTOMER') {
      setApplyMessage('Hata! İşveren hesapları ilanlara başvuramaz.');
      return;
    }
    
    if (!user.cvUrl) {
      setApplyMessage('Hata! Başvuru yapabilmek için profilinizden CV yüklemelisiniz.');
      return;
    }

    setApplyMessage('Tebrikler! İlana başarıyla başvuru yaptınız. Sonucu profilinizden takip edebilirsiniz.');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#fdfbf7]">
        <div className="h-16 w-16 border-4 border-black border-t-brutal-yellow animate-spin shadow-brutal-sm bg-white"></div>
        <p className="text-black font-black uppercase tracking-widest animate-pulse">İlan Yükleniyor...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-[#fdfbf7]">
        <div className="bg-brutal-pink border-4 border-black shadow-brutal p-8 text-center -rotate-1">
          <p className="text-xl font-black text-black uppercase">{error}</p>
        </div>
        <Link href="/">
          <button className="bg-brutal-blue border-[3px] border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none px-8 py-3 font-black text-white uppercase transition-all">
            İLANLARA DÖN
          </button>
        </Link>
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group mb-8 inline-flex items-center text-base font-black text-black border-b-4 border-transparent hover:border-black transition-all uppercase tracking-wide">
          <ArrowLeft className="mr-2 h-6 w-6 transition-transform group-hover:-translate-x-2" strokeWidth={3} />
          İlan Listesine Dön
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* SOL KOLON: İş Detayları (%70) */}
          <div className="w-full lg:w-[70%] space-y-8">
            <div className="bg-[#fdfbf7] p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[4px] border-black">
              {/* Header / Title */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className={`inline-block border-2 border-black px-4 py-1.5 text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2 ${job.status === 'OPEN' ? 'bg-green-300' : 'bg-gray-300'}`}>
                    {job.status === 'OPEN' ? 'AÇIK BAŞVURU' : job.status}
                  </span>
                  <span className="text-sm font-bold text-black flex items-center gap-1.5 bg-gray-200 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-1">
                    <Clock className="h-4 w-4" strokeWidth={2.5} />
                    {new Date(job.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-none mb-8 uppercase">
                  {job.title}
                </h1>

                {/* Sub-info Badges */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-black text-black uppercase">
                  {job.category && (
                    <div className="flex items-center gap-1.5 bg-brutal-blue text-white px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                      <Briefcase className="h-5 w-5" strokeWidth={2.5} />
                      {job.category}
                    </div>
                  )}
                  {job.experienceLevel && (
                    <div className="flex items-center gap-1.5 bg-brutal-yellow px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-2">
                      <BarChart className="h-5 w-5" strokeWidth={2.5} />
                      Deneyim: {job.experienceLevel}
                    </div>
                  )}
                  {job.duration && (
                    <div className="flex items-center gap-1.5 bg-brutal-pink px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                      <CalendarDays className="h-5 w-5" strokeWidth={2.5} />
                      Süre: {job.duration}
                    </div>
                  )}
                </div>
              </div>

              <div className="my-10 border-t-4 border-black"></div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-black text-black mb-6 uppercase inline-block border-b-4 border-black pb-1">İş Tanımı ve Kapsam</h2>
                <div className="prose prose-blue max-w-none text-black whitespace-pre-wrap leading-loose text-lg font-bold bg-white p-6 border-2 border-black shadow-brutal-sm -rotate-1">
                  {job.description}
                </div>
              </div>

              <div className="my-10 border-t-4 border-black"></div>

              {/* Skills */}
              <div>
                <h2 className="text-2xl font-black text-black mb-6 uppercase inline-flex items-center gap-3 border-b-4 border-black pb-1">
                  <Tag className="h-7 w-7 text-black" strokeWidth={2.5} />
                  Aranan Yetenekler
                </h2>
                {job.requiredSkills && job.requiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {job.requiredSkills.map((skill) => (
                       <span 
                         key={skill.id} 
                         className="inline-block bg-black text-white px-4 py-2 text-base font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(150,150,150,1)] hover:scale-105 transition-transform"
                       >
                         {skill.name}
                       </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-black text-base font-bold bg-gray-200 border-2 border-black p-4 inline-block shadow-brutal-sm">Bu ilan için özel bir yetenek belirtilmemiş.</p>
                )}
              </div>
            </div>
          </div>

          {/* SAĞ KOLON: Aksiyon ve Müşteri Kartı (%30) */}
          <div className="w-full lg:w-[30%] lg:sticky lg:top-12 space-y-8">
            <div className="bg-[#fdfbf7] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[4px] border-black">
              
              {/* Budget */}
              <div className="text-center mb-8 border-[4px] border-black bg-green-300 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 hover:rotate-0 transition-transform">
                <p className="text-base font-black text-black uppercase tracking-widest mb-3">Proje Bütçesi</p>
                {job.budget ? (
                  <div className="flex items-center justify-center gap-1 text-black font-sans">
                    <span className="text-6xl font-black tracking-tighter">{job.budget.toLocaleString('tr-TR')}</span>
                    <span className="text-4xl font-black self-end mb-1 ml-1">₺</span>
                  </div>
                ) : (
                  <div className="text-2xl font-black text-black uppercase">Tekliflere Açık</div>
                )}
              </div>

              {/* Action Button */}
              {!isCustomer ? (
                 <button 
                  onClick={handleApply}
                  disabled={job.status !== 'OPEN'}
                  className="w-full inline-flex items-center justify-center gap-3 bg-brutal-blue px-6 py-5 text-xl font-black text-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all uppercase tracking-wider disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed"
                 >
                   <Send className="h-6 w-6" strokeWidth={3} />
                   {job.status === 'OPEN' ? 'HEMEN BAŞVUR' : 'BAŞVURUYA KAPALI'}
                 </button>
              ) : (
                <div className="w-full bg-brutal-bg border-[4px] border-black px-6 py-5 text-center text-base font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                  MÜŞTERİ HESAPLARI BAŞVURU YAPAMAZ.
                </div>
              )}

              {/* Messages */}
              {applyMessage && (
                <div className={`mt-6 p-5 border-[3px] border-black shadow-brutal-sm text-sm font-black uppercase flex gap-3 items-start ${applyMessage.includes('Hata') ? 'bg-brutal-pink text-black' : 'bg-green-300 text-black'}`}>
                  {applyMessage.includes('Hata') ? <AlertCircle className="h-6 w-6 shrink-0" strokeWidth={2.5} /> : <CheckCircle2 className="h-6 w-6 shrink-0" strokeWidth={2.5} />}
                  {applyMessage}
                </div>
              )}

              <div className="my-8 border-t-4 border-black"></div>

              {/* Employer Info */}
              <div>
                <p className="text-base font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2 border-b-4 border-black pb-2 inline-flex">
                  <Building className="h-5 w-5" strokeWidth={2.5} />
                  İşveren Bilgileri
                </p>
                
                <div className="flex items-center gap-5 mb-6 bg-white border-2 border-black p-4 shadow-brutal-sm">
                  {job.customer?.user?.avatarUrl ? (
                    <img src={job.customer.user.avatarUrl} alt="Avatar" className="h-16 w-16 border-4 border-black object-cover" />
                  ) : (
                    <div className="h-16 w-16 bg-brutal-yellow flex items-center justify-center text-black font-black text-2xl border-4 border-black">
                      {job.customer?.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-black text-black text-lg flex items-center gap-1.5 uppercase">
                      {job.customer?.user?.name || 'Gizli Kullanıcı'}
                      <BadgeCheck className="h-6 w-6 text-brutal-blue shrink-0" strokeWidth={2.5} />
                    </div>
                    {job.customer?.company && (
                      <div className="text-sm font-bold text-gray-700 uppercase">{job.customer.company}</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-100 p-5 border-[3px] border-black space-y-3 shadow-brutal-sm -rotate-1">
                  <div className="flex justify-between text-sm font-black uppercase">
                    <span className="text-black">Kayıt Tarihi</span>
                    <span className="text-black bg-white border-2 border-black px-2 py-0.5">NİSAN 2026</span>
                  </div>
                  <div className="flex justify-between text-sm font-black uppercase">
                    <span className="text-black">Tamamlanan İş</span>
                    <span className="text-black bg-white border-2 border-black px-2 py-0.5">0</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
