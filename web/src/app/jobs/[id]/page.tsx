'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { DollarSign, Clock, Building, FileText, ArrowLeft, Send } from 'lucide-react';
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

  // Backend'de özel bir GET /jobs/:id ucumuz olmasa bile, 
  // listeyi çekip ID'ye göre filtreleyerek Job bilgisine ulaşıyoruz (Mock Fetch Logic)
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
    
    if (!user.cvUrl) {
      setApplyMessage('Hata! Başvuru yapabilmek için profilinizden CV yüklemelisiniz.');
      return;
    }

    // Mock Başvuru Logic
    setApplyMessage('Tebrikler! İlana başarıyla başvuru yaptınız. Çıkan sonucu bekleyin.');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Detaylar yükleniyor...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <Link href="/" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="group mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        İlanlara Geri Dön
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        
        {/* Header */}
        <div className="border-b border-gray-100 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <span className="inline-flex mb-4 items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                {job.status === 'OPEN' ? 'Açık Başvuru' : job.status}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{job.title}</h1>
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {job.customer?.name && (
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-gray-400" />
                    {job.customer.name}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                </div>
                {job.budget && (
                  <div className="flex items-center gap-1.5 font-medium text-gray-900">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Bütçe: {job.budget} ₺
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0">
               <button 
                onClick={handleApply}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all hover:shadow-md"
               >
                 <Send className="h-4 w-4" />
                 Bu İlana Başvur
               </button>
            </div>
          </div>
          
          {applyMessage && (
            <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${applyMessage.includes('Hata') ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-green-50 text-green-800 border border-green-100'}`}>
              {applyMessage}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" /> İş Açıklaması
          </h2>
          <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

      </div>
    </div>
  );
}
