# 🎯 Hiring Management System

> Sistem manajemen rekrutmen modern yang dilengkapi dengan fitur AI dan verifikasi hand pose untuk keamanan tambahan.

**Version:** 0.0.2-44424

---

## 📋 Project Overview

Hiring Management System adalah aplikasi web yang dirancang untuk memudahkan proses rekrutmen dan manajemen lowongan pekerjaan. Aplikasi ini menawarkan berbagai fitur canggih seperti:

- **Manajemen Lowongan Kerja** - Buat, edit, dan kelola job posting dengan mudah
- **Aplikasi Lamaran** - Sistem untuk mengelola aplikasi lamaran kerja dari kandidat
- **AI Grooming** - Fitur AI untuk membantu analisis dan screening kandidat
- **Hand Pose Verification** - Sistem verifikasi unik menggunakan hand pose capture dengan MediaPipe
- **Dashboard Analytics** - Visualisasi data recruitment dengan charts dan reports
- **Autentikasi & Authorization** - Sistem login yang aman dengan Supabase
- **Modern UI/UX** - Antarmuka yang cantik dan responsif menggunakan Ant Design Pro

---

## 🛠️ Tech Stack Used

### Core Framework
- **React 19** - Library UI terbaru dengan React Compiler
- **Vite 6** - Build tool yang super cepat untuk development dan production
- **React Router 7** - Routing modern untuk SPA

### UI & Styling
- **Ant Design 5** - Komponen UI enterprise-grade
- **Ant Design Pro Components** - Advanced components untuk dashboard dan forms
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library yang modern dan lengkap

### State Management & Data Fetching
- **TanStack React Query** - Powerful data fetching dan caching
- **Zustand** - State management yang simple dan lightweight
- **React Hook Form** - Form management dengan validasi Zod

### Backend & Services
- **Supabase** - Backend-as-a-Service (database, auth, storage)
- **Axios** - HTTP client untuk API calls
- **MediaPipe Hands** - Hand detection dan pose recognition

### Dev Tools
- **Biome** - Linter dan formatter super cepat (pengganti ESLint + Prettier)
- **Husky** - Git hooks untuk quality assurance
- **pnpm** - Package manager yang cepat dan efisien

---

## 🚀 How to Run Locally

### Prerequisites

Pastikan Anda sudah menginstall:
- **Node.js** versi 22.x atau lebih tinggi
- **pnpm** versi 10.x atau lebih tinggi

> 💡 **Tip:** Install pnpm dengan cara `npm install -g pnpm`

### Installation

1. **Clone repository ini**
   ```bash
   git clone <repository-url>
   cd project_hiring
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   
   Buat file `.env` di root folder dan isi dengan konfigurasi berikut:
   ```env
   VITE_API_BASE_URL=your_api_url
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Development

Jalankan development server:

```bash
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan)

### Other Commands

```bash
# Development dengan mode sandbox
pnpm dev:sandbox

# Development dengan mode production
pnpm dev:prod

# Build untuk production
pnpm build

# Preview production build
pnpm preview

# Linting dan formatting
pnpm lint
pnpm format
```

---

## 📁 Project Structure

```
src/
├── assets/          # Gambar dan file statis
├── blocs/           # Komponen blok UI reusable
├── components/      # Komponen React reusable
├── config/          # Konfigurasi aplikasi
├── pages/           # Halaman-halaman utama aplikasi
│   ├── auth/        # Login & Register
│   ├── dashboard/   # Dashboard utama
│   ├── jobs/        # Manajemen jobs
│   └── ai/          # AI features
├── routes/          # Route configurations
├── stores/          # Zustand store & slices
├── styles/          # Theme dan styling
└── utils/           # Helper functions & hooks
```

---

## 🤝 Contributing

Jika Anda ingin berkontribusi, dan berkembang bersama saya maka izinkan saya bergabugn dalam tim
kalian.

---

## 📝 License

Private project - All rights reserved

---

**Made with ❤️ using React & Vite**
