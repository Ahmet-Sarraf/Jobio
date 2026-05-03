'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Star, Search, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [debouncedSkill, setDebouncedSkill] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Custom Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedSkill(skillFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, skillFilter]);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/freelancers', {
        params: {
          q: debouncedSearch,
          skill: debouncedSkill,
          page,
          limit: 12
        }
      });
      setFreelancers(res.data.data);
      setTotalPages(res.data.meta.totalPages || 1);
    } catch (error) {
      console.error('Freelancerlar yüklenirken hata oluştu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page on new search
  }, [debouncedSearch, debouncedSkill]);

  useEffect(() => {
    fetchFreelancers();
  }, [debouncedSearch, debouncedSkill, page]);

  // Neo-Brutalist background colors for cards
  const cardColors = ['bg-brutal-yellow', 'bg-brutal-pink', 'bg-green-300', 'bg-blue-300', 'bg-orange-300'];

  return (
    <div className="min-h-screen bg-brutal-bg flex flex-col">

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-4">
              Yetenekleri Keşfet
            </h1>
            <p className="text-xl font-bold max-w-2xl bg-white border-2 border-black inline-block px-4 py-2 shadow-brutal-sm -rotate-1">
              Projeniz için en iyi bağımsız çalışanları bulun.
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-black uppercase mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" /> İsim veya Açıklamada Ara
              </label>
              <input
                type="text"
                placeholder="Örn: Frontend Developer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-[3px] border-black p-4 font-bold text-lg focus:outline-none focus:bg-brutal-yellow focus:-translate-y-1 focus:shadow-brutal transition-all"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-black uppercase mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Yetenek Filtresi
              </label>
              <input
                type="text"
                placeholder="Örn: React, Figma, Python..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full bg-gray-50 border-[3px] border-black p-4 font-bold text-lg focus:outline-none focus:bg-brutal-pink focus:-translate-y-1 focus:shadow-brutal transition-all"
              />
            </div>
          </div>
        </div>

        {/* Freelancers Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-black border-t-brutal-blue"></div>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="bg-white border-[4px] border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-2xl font-black uppercase">Sonuç Bulunamadı</p>
            <p className="font-bold text-gray-600 mt-2">Arama kriterlerinizi değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {freelancers.map((freelancer, idx) => (
              <div 
                key={freelancer.id} 
                className={`border-[4px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full ${cardColors[idx % cardColors.length]}`}
              >
                <div className="flex flex-col items-center mb-4">
                  <div className="h-24 w-24 rounded-full border-[3px] border-black bg-white overflow-hidden mb-4 shadow-brutal-sm">
                    {freelancer.avatarUrl ? (
                      <img src={freelancer.avatarUrl} alt={freelancer.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black uppercase text-center line-clamp-1 bg-white px-2 border-2 border-black -rotate-2">
                    {freelancer.name || 'İsimsiz Kullanıcı'}
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-1 mb-4 bg-white border-2 border-black py-1 px-3 shadow-brutal-sm w-fit mx-auto">
                  <Star className="w-5 h-5 fill-black text-black" strokeWidth={2} />
                  <span className="font-black text-lg">{Number(freelancer.averageScore || 0).toFixed(1)}</span>
                  <span className="text-xs font-bold ml-1">({freelancer.totalReviews})</span>
                </div>

                <p className="font-bold text-sm line-clamp-3 mb-6 flex-grow text-center opacity-90">
                  {freelancer.bio || "Bu freelancer henüz hakkında bir bilgi eklememiş."}
                </p>

                {freelancer.skills && freelancer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
                    {freelancer.skills.slice(0, 3).map((skill: any) => (
                      <span key={skill.id} className="text-xs font-black uppercase bg-white border-2 border-black px-2 py-1">
                        {skill.name}
                      </span>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <span className="text-xs font-black uppercase bg-black text-white px-2 py-1">
                        +{freelancer.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <Link 
                  href={`/freelancers/${freelancer.id}`}
                  className="mt-auto block w-full text-center bg-black text-white font-black uppercase py-3 border-[3px] border-black hover:bg-white hover:text-black transition-colors"
                >
                  Detayları Gör
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-3 bg-white border-[3px] border-black shadow-brutal hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={3} />
            </button>
            
            <div className="font-black text-xl bg-white border-[3px] border-black px-6 py-2 shadow-brutal">
              {page} / {totalPages}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-3 bg-white border-[3px] border-black shadow-brutal hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
