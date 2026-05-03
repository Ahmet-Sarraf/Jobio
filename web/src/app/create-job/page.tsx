'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Send, Target, Layers, X, Tag, AlignLeft, Clock, DollarSign } from 'lucide-react';
import api from '@/lib/axios';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Next.js', 'Python', 'Java', 'C#', 
  'Vue.js', 'Angular', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 
  'Flutter', 'React Native', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 
  'Kubernetes', 'AWS', 'Figma', 'Adobe XD', 'SEO', 'Dijital Pazarlama', 
  'İçerik Üretimi', 'Copywriting', 'SEO Uyumlu İçerik'
];

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#fdfbf7] min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full bg-white border-[4px] border-black p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[4px] border-black pb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brutal-yellow border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
              <Briefcase className="h-8 w-8 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-black uppercase tracking-tight">İş İlanı Oluştur</h1>
              <p className="mt-2 text-base font-bold text-black/70">Harika yetenekleri bulmak için projenizi detaylandırın.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-12">
          {error && (
            <div className="bg-brutal-pink border-[3px] border-black p-4 text-black font-bold flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
              <X className="h-6 w-6 text-black" strokeWidth={3} />
              {error}
            </div>
          )}

          {/* BÖLÜM 1: TEMEL BİLGİLER */}
          <section className="space-y-6">
            <div className="border-b-[3px] border-black pb-3">
              <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase">
                <Briefcase className="h-6 w-6 text-black" strokeWidth={2.5} />
                Temel Bilgiler
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-black text-black uppercase mb-2">
                  İlan Başlığı <span className="text-brutal-pink text-xl">*</span>
                </label>
                <input
                  id="title"
                  required
                  type="text"
                  placeholder="Örn: Kıdemli Frontend Geliştirici"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-black text-black uppercase mb-2">
                  Kategori
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all cursor-pointer appearance-none bg-white"
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
            <div className="border-b-[3px] border-black pb-3">
              <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase">
                <Layers className="h-6 w-6 text-black" strokeWidth={2.5} />
                Proje Detayları
              </h2>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-black" strokeWidth={2.5} />
                İş Açıklaması <span className="text-brutal-pink text-xl">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={6}
                placeholder="Projenin detayları, freelancer'dan beklentileriniz ve teknik gereksinimler..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="duration" className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-black" strokeWidth={2.5} />
                  Tahmini Süre
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all cursor-pointer appearance-none bg-white"
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
                <label htmlFor="budget" className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-black" strokeWidth={2.5} />
                  Bütçe <span className="text-black/50 font-bold text-xs">(Opsiyonel)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-black font-black text-lg">₺</span>
                  </div>
                  <input
                    id="budget"
                    type="number"
                    placeholder="Örn: 15000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="block w-full border-[3px] border-black p-4 pl-10 text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* BÖLÜM 3: GEREKSİNİMLER */}
          <section className="space-y-6 bg-brutal-yellow/20 -mx-8 px-8 py-8 border-y-[4px] border-black sm:-mx-12 sm:px-12 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,transparent_20%,#fdfbf7_20%,#fdfbf7_80%,transparent_80%,transparent)] bg-[length:20px_20px] opacity-10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="border-b-[3px] border-black pb-3">
                <h2 className="text-2xl font-black text-black flex items-center gap-2 uppercase">
                  <Target className="h-6 w-6 text-black" strokeWidth={2.5} />
                  Gereksinimler
                </h2>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-black text-black uppercase mb-4">
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
                      className={`cursor-pointer p-5 transition-all duration-200 bg-white ${
                        experienceLevel === level.id 
                          ? 'border-[4px] border-black bg-brutal-pink text-black scale-105 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 -rotate-2' 
                          : 'border-[3px] border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                      }`}
                    >
                      <div className="font-black text-xl uppercase">
                        {level.id}
                      </div>
                      <div className="text-xs mt-1 font-bold text-black/70">
                        {level.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <label htmlFor="skills" className="block text-sm font-black text-black uppercase mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-black" strokeWidth={2.5} />
                  Gerekli Yetenekler
                </label>
                
                <div className="flex overflow-x-auto gap-3 pb-4 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {POPULAR_SKILLS.filter(s => !skills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSkills([...skills, skill])}
                      className="shrink-0 bg-white border-[2px] border-black px-4 py-2 text-sm font-black text-black hover:bg-brutal-yellow hover:-translate-y-1 hover:shadow-brutal-sm transition-all"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>

                <div className="border-[3px] border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none transition-all">
                  <div className="flex flex-wrap gap-2 mb-2 px-1 mt-1">
                    {skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-2 border-[2px] border-black bg-brutal-pink px-3 py-1 text-sm font-black text-black shadow-brutal-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-black hover:text-white rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" strokeWidth={3} />
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
                    className="block w-full border-0 py-3 px-3 text-black font-bold bg-transparent focus:ring-0 outline-none placeholder:text-black/40"
                  />
                </div>
                <p className="mt-3 text-xs text-black/60 font-bold ml-1">Örn: React, Node.js, Figma, SEO (Maks. 10 yetenek)</p>
              </div>
            </div>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-green-400 px-12 py-6 text-xl font-black text-black uppercase tracking-widest border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed transition-all w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-black/30 border-t-black"></div>
                  YAYINLANIYOR...
                </>
              ) : (
                <>
                  <Send className="h-6 w-6" strokeWidth={3} />
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
