'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Send, Target, Layers, X, Tag, AlignLeft, Clock, DollarSign } from 'lucide-react';
import api from '@/lib/axios';

export default function CreateJobPage() {
  const router = useRouter();
  
  // Temel Bilgiler
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  
  // Proje Detayları
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');

  // Gereksinimler
  const [experienceLevel, setExperienceLevel] = useState('Orta');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        title,
        description,
        category: category || undefined,
        experienceLevel,
        duration: duration || undefined,
        skills,
        budget: budget ? Number(budget) : undefined,
      };

      await api.post('/jobs', payload);
      
      router.push('/profile'); // Başarılı olunca profile yönlendir ki ilanlarımda görebilsin
    } catch (err: any) {
      setError(err.response?.data?.message || 'İlan oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-xl ring-1 ring-gray-200/50 sm:p-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-inset ring-blue-100/50 shadow-sm">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">İş İlanı Oluştur</h1>
              <p className="mt-1 text-sm text-gray-500 font-medium">Harika yetenekleri bulmak için projenizi detaylandırın.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-12">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
              <X className="h-5 w-5 text-red-500" />
              {error}
            </div>
          )}

          {/* BÖLÜM 1: TEMEL BİLGİLER */}
          <section className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Temel Bilgiler
              </h2>
              <p className="mt-1 text-sm text-gray-500">İlanınızın başlığını ve kategorisini belirleyin.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  İlan Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  required
                  type="text"
                  placeholder="Örn: Kıdemli Frontend Geliştirici"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white/50 transition-shadow hover:shadow-md"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white/50 cursor-pointer transition-shadow hover:shadow-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="Web Geliştirme">Web Geliştirme</option>
                  <option value="Mobil Uygulama">Mobil Uygulama</option>
                  <option value="UI/UX Tasarım">UI/UX Tasarım</option>
                  <option value="Dijital Pazarlama">Dijital Pazarlama</option>
                  <option value="Veri Bilimi">Veri Bilimi</option>
                  <option value="İçerik Üretimi">İçerik Üretimi</option>
                </select>
              </div>
            </div>
          </section>

          {/* BÖLÜM 2: PROJE DETAYLARI */}
          <section className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                Proje Detayları
              </h2>
              <p className="mt-1 text-sm text-gray-500">Projenin kapsamını ve bütçenizi detaylandırın.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-gray-400" />
                İş Açıklaması <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                placeholder="Projenin detayları, freelancer'dan beklentileriniz ve teknik gereksinimler..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white/50 resize-y transition-shadow hover:shadow-md"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Tahmini Süre
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white/50 cursor-pointer transition-shadow hover:shadow-md"
                >
                  <option value="">Seçiniz</option>
                  <option value="1 aydan az">1 aydan az</option>
                  <option value="1-3 Ay">1-3 Ay</option>
                  <option value="3-6 Ay">3-6 Ay</option>
                  <option value="6 aydan uzun">6 aydan uzun</option>
                  <option value="Sürekli / Tam Zamanlı">Sürekli / Tam Zamanlı</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  Bütçe (₺) <span className="text-gray-400 font-normal text-xs">(Opsiyonel)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 sm:text-sm font-medium">₺</span>
                  </div>
                  <input
                    id="budget"
                    type="number"
                    placeholder="Örn: 15000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 py-3 pl-9 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm bg-white/50 transition-shadow hover:shadow-md"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BÖLÜM 3: GEREKSİNİMLER */}
          <section className="space-y-6 bg-gray-50/50 -mx-8 px-8 py-8 border-y border-gray-100 sm:-mx-12 sm:px-12">
            <div className="border-b border-gray-200 pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Gereksinimler
              </h2>
              <p className="mt-1 text-sm text-gray-500">Aradığınız freelancer'ın yetkinlikleri ve deneyim seviyesi.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Deneyim Seviyesi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Başlangıç', desc: 'Uygun maliyetli, temel işler' },
                  { id: 'Orta', desc: 'Kaliteli sonuçlar, makul bütçe' },
                  { id: 'Uzman', desc: 'Üst düzey kalite, tecrübe' }
                ].map(level => (
                  <div 
                    key={level.id} 
                    onClick={() => setExperienceLevel(level.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                      experienceLevel === level.id 
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20 shadow-md transform -translate-y-0.5' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`font-bold text-lg ${experienceLevel === level.id ? 'text-blue-800' : 'text-gray-700'}`}>
                      {level.id}
                    </div>
                    <div className={`text-xs mt-1 ${experienceLevel === level.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {level.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                Gerekli Yetenekler
              </label>
              <div className="rounded-xl border border-gray-300 bg-white/80 p-2 shadow-sm ring-1 ring-inset ring-transparent focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 focus-within:border-transparent transition-all">
                <div className="flex flex-wrap gap-2 mb-2 px-1">
                  {skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm animate-in zoom-in-95 duration-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-700 hover:text-red-400 transition-colors focus:outline-none"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  id="skills"
                  type="text"
                  placeholder="Yetenek yazıp 'Enter' veya virgül (,) tuşuna basın..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="block w-full border-0 py-2 px-3 text-gray-900 bg-transparent focus:ring-0 sm:text-sm placeholder:text-gray-400"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 font-medium ml-1">Örn: React, Node.js, Figma, SEO (Maksimum 10 yetenek önerilir)</p>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  İlan Yayınlanıyor...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
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
