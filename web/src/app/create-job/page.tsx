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
      
      alert('İlanınız başarıyla yayınlandı!');
      router.push('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'İlan oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 min-h-[calc(100vh-4rem)]">

      {/* Sayfa Başlığı */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-brutal-yellow border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3">
          <Briefcase className="h-8 w-8 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tight">İş İlanı Oluştur</h1>
          <p className="mt-1 text-base font-bold text-black/70">Harika yetenekleri bulmak için projenizi detaylandırın.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-brutal-pink border-[3px] border-black p-4 text-black font-bold flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
          <X className="h-6 w-6 text-black shrink-0" strokeWidth={3} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Ana İçerik: Form (Sol) + Özet Panel (Sağ) */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* FORM ALANI */}
          <div className="w-full xl:w-[68%] bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_#ffc900]">
            
            {/* Form içi iki sütunlu grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y-[4px] lg:divide-y-0 lg:divide-x-[4px] divide-black">

              {/* SOL SÜTUN: Temel Bilgiler + Gereksinimler */}
              <div className="p-8 sm:p-10 space-y-10">

                {/* BÖLÜM 1: TEMEL BİLGİLER */}
                <section className="space-y-5">
                  <div className="border-b-[3px] border-black pb-3">
                    <h2 className="text-xl font-black text-black flex items-center gap-2 uppercase">
                      <Briefcase className="h-5 w-5 text-black" strokeWidth={2.5} />
                      Temel Bilgiler
                    </h2>
                  </div>

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
                      className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_#ffc900] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all"
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
                      className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_#ffc900] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all cursor-pointer appearance-none bg-white"
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
                </section>

                {/* BÖLÜM 3: GEREKSİNİMLER */}
                <section className="space-y-6">
                  <div className="border-b-[3px] border-black pb-3">
                    <h2 className="text-xl font-black text-black flex items-center gap-2 uppercase">
                      <Target className="h-5 w-5 text-black" strokeWidth={2.5} />
                      Gereksinimler
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-black uppercase mb-4">
                      Deneyim Seviyesi
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'Başlangıç', desc: 'Temel işler' },
                        { id: 'Orta', desc: 'Makul bütçe' },
                        { id: 'Uzman', desc: 'Üst düzey' }
                      ].map(level => (
                        <div 
                          key={level.id} 
                          onClick={() => setExperienceLevel(level.id)}
                          className={`cursor-pointer p-4 transition-all duration-200 bg-white text-center ${
                            experienceLevel === level.id 
                              ? 'border-[4px] border-black bg-brutal-pink text-black scale-105 shadow-[6px_6px_0px_0px_#ffc900] z-10 -rotate-1' 
                              : 'border-[3px] border-black text-black shadow-[4px_4px_0px_0px_#ffc900] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                          }`}
                        >
                          <div className="font-black text-sm uppercase">{level.id}</div>
                          <div className="text-xs mt-1 font-bold text-black/60">{level.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="skills" className="block text-sm font-black text-black uppercase mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-black" strokeWidth={2.5} />
                      Gerekli Yetenekler
                    </label>
                    
                    <div className="flex overflow-x-auto gap-2 pb-3 mb-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {POPULAR_SKILLS.filter(s => !skills.includes(s)).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => setSkills([...skills, skill])}
                          className="shrink-0 bg-white border-[2px] border-black px-3 py-1.5 text-xs font-black text-black hover:bg-brutal-yellow hover:-translate-y-1 hover:shadow-brutal-sm transition-all"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>

                    <div className="border-[3px] border-black bg-white p-2 shadow-[4px_4px_0px_0px_#ffc900] focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none transition-all">
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
                        className="block w-full border-0 py-2 px-3 text-black font-bold bg-transparent focus:ring-0 outline-none placeholder:text-black/40 text-sm"
                      />
                    </div>
                    <p className="mt-2 text-xs text-black/60 font-bold ml-1">Örn: React, Node.js, Figma, SEO (Maks. 10 yetenek)</p>
                  </div>
                </section>
              </div>

              {/* SAĞ SÜTUN: Proje Detayları */}
              <div className="p-8 sm:p-10 space-y-6 bg-neutral-50">
                <section className="space-y-5">
                  <div className="border-b-[3px] border-black pb-3">
                    <h2 className="text-xl font-black text-black flex items-center gap-2 uppercase">
                      <Layers className="h-5 w-5 text-black" strokeWidth={2.5} />
                      Proje Detayları
                    </h2>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-black" strokeWidth={2.5} />
                      İş Açıklaması <span className="text-brutal-pink text-xl">*</span>
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={9}
                      placeholder="Projenin detayları, freelancer'dan beklentileriniz ve teknik gereksinimler..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_#ffc900] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all resize-y"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-black" strokeWidth={2.5} />
                      Tahmini Süre
                    </label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="block w-full border-[3px] border-black p-4 text-black font-bold shadow-[4px_4px_0px_0px_#ffc900] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all cursor-pointer appearance-none bg-white"
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
                      <DollarSign className="h-4 w-4 text-black" strokeWidth={2.5} />
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
                        className="block w-full border-[3px] border-black p-4 pl-10 text-black font-bold shadow-[4px_4px_0px_0px_#ffc900] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none focus:bg-amber-50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-3 bg-green-400 px-8 py-5 text-lg font-black text-black uppercase tracking-widest border-[4px] border-black shadow-[8px_8px_0px_0px_#ffc900] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_0px_#ffc900] disabled:cursor-not-allowed transition-all w-full"
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-4 border-black/30 border-t-black"></div>
                        YAYINLANIYOR...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" strokeWidth={3} />
                        İlanı Yayınla
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL: Özet + İpuçları */}
          <div className="w-full xl:w-[32%] xl:sticky xl:top-12 space-y-6">
            {/* İlan Özeti */}
            <div className="bg-brutal-yellow border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-7 rotate-1 hover:rotate-0 transition-transform">
              <h3 className="text-xl font-black uppercase mb-5 border-b-4 border-black pb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5" strokeWidth={2.5} />
                İlan Özeti
              </h3>
              <div className="space-y-3">
                <div className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                  <p className="text-xs font-black uppercase text-black/50 mb-1">Başlık</p>
                  <p className="font-black text-base text-black uppercase">{title || '---'}</p>
                </div>
                <div className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                  <p className="text-xs font-black uppercase text-black/50 mb-1">Kategori</p>
                  <p className="font-black text-base text-black uppercase">{category || 'Belirtilmedi'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                    <p className="text-xs font-black uppercase text-black/50 mb-1">Bütçe</p>
                    <p className="font-black text-sm text-black">{budget ? `₺${Number(budget).toLocaleString('tr-TR')}` : 'Teklife Açık'}</p>
                  </div>
                  <div className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                    <p className="text-xs font-black uppercase text-black/50 mb-1">Deneyim</p>
                    <p className="font-black text-sm text-black">{experienceLevel}</p>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="bg-white border-[3px] border-black p-3 shadow-brutal-sm">
                    <p className="text-xs font-black uppercase text-black/50 mb-2">Yetenekler ({skills.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, i) => (
                        <span key={i} className="text-xs font-black uppercase bg-brutal-pink border-[2px] border-black px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* İpuçları */}
            <div className="bg-brutal-blue border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-7 -rotate-1 hover:rotate-0 transition-transform">
              <h3 className="text-xl font-black uppercase text-white mb-5 border-b-4 border-white pb-3">
                💡 Pro İpuçları
              </h3>
              <ul className="space-y-3">
                {[
                  { tip: 'Net ve spesifik başlık kullanın. "Freelancer Arıyorum" yerine "React.js ile E-ticaret Sitesi" gibi.', icon: '✅' },
                  { tip: 'Bütçenizi belirtirseniz daha nitelikli başvurular alırsınız.', icon: '💰' },
                  { tip: 'Gerekli yetenekleri eklemek, doğru freelancer\'ı hızlı bulmanızı sağlar.', icon: '🎯' },
                  { tip: 'Açıklamada teslimat süresi ve beklentileri detaylandırın.', icon: '📝' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white/10 p-3 border-[2px] border-white/30">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <p className="text-xs font-bold text-white leading-relaxed">{item.tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Destek Kutusu */}
            <div className="bg-brutal-pink border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 rotate-1 hover:rotate-0 transition-transform">
              <p className="text-sm font-black uppercase text-black mb-2">🚀 Hazır mısın?</p>
              <p className="font-bold text-black text-sm leading-relaxed">
                İlanınızı yayınladıktan sonra binlerce freelancer başvurabilecek. Formu doldur ve kazanınlı eşleşmeye başla!
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
