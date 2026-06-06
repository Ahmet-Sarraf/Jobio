# 🚀 Jobio — AI-Powered Freelance Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/NestJS-11-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?style=for-the-badge&logo=socket.io" />
</p>

> **Jobio**, müşterilerin iş ilanı oluşturup freelancer'larla eşleştiği, Google Gemini AI destekli çift yönlü akıllı eşleştirme sistemi, gerçek zamanlı mesajlaşma ve Neo-Brutalist tasarım diliyle modern bir freelance platformudur.

---

## 📸 Özellikler

- 🧠 **Gemini AI Akıllı Eşleştirme** — Hem müşteri hem freelancer tarafı için yetenek bazlı AI eşleştirme
- 🤖 **AI Başvuru Değerlendirme** — Her başvuru alındığında otomatik uygunluk skoru (0–100)
- 💬 **Gerçek Zamanlı Mesajlaşma** — Socket.io tabanlı anlık chat sistemi
- 🔔 **Bildirim Sistemi** — Uygulama içi notification modülü
- 📋 **İş İlanı Yönetimi** — Kategori, bütçe, deneyim seviyesi ve yetenek etiketleriyle detaylı ilan oluşturma
- ✅ **Başvuru & İşe Alım Süreci** — Başvuru yapma, kabul/red, iş tamamlama ve değerlendirme
- 👤 **İkili Profil Sistemi** — `CUSTOMER` ve `FREELANCER` rolleri için ayrı profil yapıları
- ⭐ **Değerlendirme Sistemi** — İş tamamlandığında müşteriden freelancer'a yıldız puanlama ve yorum
- 📁 **Dosya Yükleme** — Supabase Storage üzerinden avatar ve CV yükleme
- 🎨 **Neo-Brutalist UI** — Pastel/Neon tema değiştirici, 3D toast bildirimleri, hover animasyonları

---

## 🏗️ Proje Yapısı

```
Jobio/
├── backend/          # NestJS REST API + WebSocket Sunucusu
│   ├── src/
│   │   ├── ai/           # Google Gemini AI eşleştirme & değerlendirme
│   │   ├── auth/         # JWT kimlik doğrulama (Supabase)
│   │   ├── chat/         # Gerçek zamanlı mesajlaşma (Socket.io)
│   │   ├── jobs/         # İş ilanı CRUD + başvuru yönetimi
│   │   ├── notifications/ # Kullanıcı bildirimleri
│   │   ├── reviews/      # Değerlendirme sistemi
│   │   ├── storage/      # Dosya yükleme (Supabase Storage)
│   │   └── users/        # Kullanıcı & profil yönetimi
│   └── prisma/
│       └── schema.prisma # Veritabanı şeması
│
├── web/              # Next.js 16 Frontend
│   └── src/
│       ├── app/
│       │   ├── (/)           # Ana sayfa — İş ilanları listesi
│       │   ├── create-job/   # Yeni ilan oluşturma
│       │   ├── freelancers/  # Freelancer listesi & profil detayı
│       │   ├── matchmaking/  # AI Sihirli Eşleştirme sayfası
│       │   ├── messages/     # Gerçek zamanlı mesajlaşma
│       │   ├── profile/      # Kullanıcı profili & iş yönetimi
│       │   ├── login/        # Giriş sayfası
│       │   └── register/     # Kayıt sayfası
│       ├── components/
│       │   ├── Navbar.tsx              # Global navbar (tema değiştirici dahil)
│       │   └── BrutalToastContainer.tsx # 3D katmanlı bildirim sistemi
│       ├── store/
│       │   ├── useAuthStore.ts         # Zustand auth state (persist)
│       │   └── useToastStore.ts        # Zustand global toast bildirimleri
│       └── lib/
│           ├── axios.ts      # Axios instance (JWT interceptor)
│           └── socket.ts     # Socket.io client helper
│
└── mobile/           # Expo React Native Mobil Uygulama
    ├── src/
    │   ├── components/   # Ortak UI bileşenleri (Button, Input, vb.)
    │   ├── navigation/   # Navigasyon yönlendiricileri (Tab & Stack)
    │   ├── screens/      # Uygulama ekranları (Chat, Profile, İlanlar, vb.)
    │   ├── services/     # API (Axios) ve WebSocket (Socket.io) servisleri
    │   ├── store/        # Zustand global state yönetimi
    │   └── theme/        # Global Neobrutalist renk ve stil şeması
```

---

## 🗄️ Veritabanı Şeması

```
User ──────────────┬── FreelancerProfile ──┬── Skill (many-to-many)
                   │                       ├── Application
                   │                       ├── Review (alınan)
                   │                       └── Conversation
                   │
                   └── CustomerProfile ────┬── Job ──────┬── Application
                                           │             │     ├── aiScore (Gemini AI)
                                           │             │     └── aiReasoning
                                           │             ├── Skill (many-to-many)
                                           │             └── Review
                                           ├── Review (verilen)
                                           └── Conversation ── Message[]

Notification (userId → User)
```

---

## ⚙️ Teknoloji Yığını

### Backend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| NestJS | 11 | REST API çerçevesi |
| Prisma ORM | 6 | Veritabanı ORM |
| PostgreSQL | — | Veritabanı (Supabase üzerinde) |
| Supabase | — | Auth (JWT) & Storage |
| Socket.io | 4 | Gerçek zamanlı mesajlaşma |
| Google Gemini AI | 2.5 Flash | AI eşleştirme & değerlendirme |
| Passport JWT | — | API güvenliği |
| class-validator | — | DTO doğrulama |

### Frontend
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Next.js | 16 | React framework (App Router) |
| TypeScript | 5 | Tip güvenliği |
| Tailwind CSS | 4 | Stil sistemi |
| Zustand | 5 | State yönetimi |
| Axios | — | HTTP istekleri |
| Socket.io Client | 4 | WebSocket bağlantısı |
| Lucide React | — | İkon kütüphanesi |
| Outfit (Google Fonts) | — | Tipografi |

### Mobil (React Native / Expo)
| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| Expo | 54 | Mobil uygulama iskeleti |
| React Native | 0.81 | Yerel uygulama motoru |
| React Navigation | 7 | Ekranlar arası geçiş ve menüler |
| Zustand | 5 | Global state yönetimi |
| Axios | — | HTTP API istekleri |
| Socket.io Client | 4 | Gerçek zamanlı chat bağlantısı |
| Expo Image | 3 | Yüksek performanslı görsel önbellekleme |
| React Hook Form & Zod | — | Form validasyonu ve doğrulama |
| Lucide React Native | — | Uygulama içi ikonlar |

---

## 🤖 AI Özellikleri (Google Gemini 2.5 Flash)

### 1. Müşteri İçin Freelancer Eşleştirme
Müşteri bir iş ilanı seçtiğinde Gemini AI, ilanın gerektirdiği yeteneklere sahip freelancer'ları analiz ederek **0–100 arası uygunluk skoru** ve Türkçe açıklama üretir.

### 2. Freelancer İçin İş Eşleştirme
Freelancer'ın profiline (yetenekler, bio) göre açık iş ilanları analiz edilerek en uygun işler sıralanır.

### 3. Otomatik Başvuru Değerlendirme
Her başvuru gönderildiğinde, arka planda Gemini AI başvuruyu (cover letter + yetekler) ilanla karşılaştırır ve `aiScore` / `aiReasoning` alanlarına kayıt eder. Müşteri adayları otomatik olarak AI skoruna göre sıralı görür.

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 20+
- npm veya yarn
- Supabase hesabı (veritabanı & auth & storage)
- Google AI Studio API anahtarı

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/kullaniciadi/jobio.git
cd jobio
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

`backend/.env` dosyası oluşturun:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..."
GEMINI_API_KEY="AIza..."
JWT_SECRET="your-jwt-secret"
```

```bash
npx prisma migrate dev
npm run start:dev
```

> Backend `http://localhost:3000` adresinde çalışır.

### 3. Frontend Kurulumu
```bash
cd web
npm install
```

`web/.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

```bash
npm run dev
```

> Frontend `http://localhost:3001` adresinde çalışır.

### 4. Mobil (Expo) Kurulumu
```bash
cd mobile
npm install
```

`mobile/.env` dosyası oluşturun:
```env
EXPO_PUBLIC_API_URL="http://<yerel-ip-adresiniz>:3000"
EXPO_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```
> ⚠️ **Önemli:** Telefonda test ederken `localhost` veya `127.0.0.1` yerine bilgisayarınızın yerel ağ IP adresini (örn: `192.168.1.34`) yazmalısınız.

```bash
npm run start
```
> Mobil geliştirme arayüzü (Expo Metro Bundler) başlar. Terminaldeki QR kodu Expo Go uygulaması ile okutarak testi başlatabilirsiniz.

---

## 📡 API Endpoints (Özet)

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| POST | `/auth/login` | Giriş |
| POST | `/auth/register` | Kayıt |
| GET | `/jobs` | Tüm açık ilanlar |
| POST | `/jobs` | Yeni ilan oluştur |
| GET | `/jobs/my-jobs` | Kullanıcının ilanları |
| POST | `/jobs/:id/apply` | İlana başvur (AI değerlendirme tetiklenir) |
| PATCH | `/jobs/:id/complete` | İşi tamamla |
| GET | `/ai/match-freelancers/:jobId` | AI: İlan için freelancer eşleştir |
| GET | `/ai/match-jobs` | AI: Freelancer için iş eşleştir |
| GET | `/users/freelancers` | Tüm freelancer listesi |
| GET | `/users/freelancer/:id` | Freelancer profil detayı |
| PATCH | `/users/profile` | Profil güncelle |
| POST | `/reviews` | Değerlendirme yap |
| GET | `/reviews/freelancer/:id` | Freelancer değerlendirmeleri |
| POST | `/chat/start` | Sohbet başlat |
| GET | `/chat/conversations` | Sohbet listesi |
| GET | `/notifications` | Bildirimler |

---

## 🎨 UI/UX Özellikleri

- **Neo-Brutalist Tasarım** — Kalın siyah kenarlıklar, flat gölgeler, güçlü tipografi
- **Pastel / Neon Tema** — Navbar'daki palet butonu ile anlık tema geçişi (`localStorage` destekli)
- **3D Katmanlı Toast Bildirimleri** — Tüm `alert()` kutularının yerini alan premium bildirim sistemi
- **Hover Wobble Animasyonları** — İnteraktif kart ve buton sallanma efektleri
- **AI Sihirli Eşleştirme Yükleyici** — Gemini AI çalışırken görünen özel animasyonlu loader
- **Gizli Scrollbar** — Temiz native-app hissi için tüm sayfalarda scrollbar gizlendi

---

## 📁 Ortam Değişkenleri

### Backend (`backend/.env`)
```
DATABASE_URL          # Supabase PostgreSQL bağlantı URL'i (pooled)
DIRECT_URL            # Supabase PostgreSQL doğrudan bağlantı URL'i
SUPABASE_URL          # Supabase proje URL'i
SUPABASE_SERVICE_KEY  # Supabase service role key
GEMINI_API_KEY        # Google AI Studio API anahtarı
JWT_SECRET            # JWT imzalama anahtarı
```

### Frontend (`web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL       # Supabase proje URL'i
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon/public key
NEXT_PUBLIC_API_URL            # Backend API adresi
```

### Mobil (`mobile/.env`)
```
EXPO_PUBLIC_API_URL            # Backend API adresi (Yerel IP adresi olmalı)
EXPO_PUBLIC_SUPABASE_URL       # Supabase proje URL'i
EXPO_PUBLIC_SUPABASE_ANON_KEY  # Supabase anon/public key
```

---

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

---

<p align="center">
  <strong>Jobio</strong> — Yetenekleri işlerle buluşturan akıllı platform. 🚀
</p>
