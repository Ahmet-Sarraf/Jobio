# Jobio 🚀 | Yapay Zeka Destekli Freelancer Eşleştirme Platformu

Jobio, yetenekli freelancer'lar ile doğru müşterileri bir araya getiren, modern, ölçeklenebilir ve yapay zekâ (AI) destekli bir platformdur. Klasik filtreleme yöntemlerinin ötesine geçerek, müşteri taleplerini semantik olarak analiz eder ve en uygun uzmanları saniyeler içinde önerir.

## ✨ Temel Özellikler

* **Yapay Zekâ ile Akıllı Eşleştirme:** Müşterilerin iş tanımlarını OpenAI ve pgvector kullanarak analiz eder, en uygun yetenek setine sahip freelancer'ları anlamsal (vektörel) olarak eşleştirir.
* **Çift Platform (Web & Mobil):** Web'de Next.js ile kusursuz SEO ve performans sunarken, mobil cihazlarda React Native ile doğal (native) bir uygulama deneyimi yaşatır.
* **Merkezi ve Güçlü Backend:** NestJS mimarisi ile her iki platforma da hizmet veren, güvenli ve yüksek performanslı tek bir API altyapısı.
* **Gelişmiş Profil ve Portfolyo Yönetimi:** Freelancer'ların yeteneklerini ve geçmiş işlerini (PDF, Görsel) Supabase Storage ile güvenle sergileyebileceği alanlar.

## 🛠️ Teknoloji Yığını (Tech Stack)

| Kategori | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Web Frontend** | React & Next.js | Yüksek performanslı, SEO uyumlu arayüz. |
| **Mobil Frontend** | React Native (Expo) | iOS ve Android için ortak kod tabanlı mobil uygulama. |
| **Stil / Tasarım** | Tailwind CSS & Shadcn | Modern, hızlı ve tam duyarlı (responsive) bileşenler. |
| **Backend (API)** | Node.js & NestJS | Kurumsal mimari standartlarında, tip güvenli (TypeScript) sunucu. |
| **Veritabanı** | PostgreSQL (Supabase) | Dünyanın en güçlü açık kaynak ilişkisel veritabanı. |
| **ORM** | Prisma | Hızlı, güvenli ve geliştirici dostu veritabanı yönetimi. |
| **Yapay Zekâ** | OpenAI API & pgvector | Vektörel veri saklama ve semantik arama / eşleştirme motoru. |
| **Auth & Storage** | Supabase | Güvenli kimlik doğrulama ve portfolyo/dosya depolama sistemi. |

## 🚀 Kurulum (Local Setup)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# Projeyi klonlayın ve backend dizinine girin
git clone [https://github.com/KULLANICI_ADIN/jobio.git](https://github.com/KULLANICI_ADIN/jobio.git)
cd jobio/backend

# Paketleri yükleyin
npm install
