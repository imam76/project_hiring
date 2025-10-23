# Job Module Documentation

## Overview
Module Job Listing dengan role-based access control untuk admin/company dan user biasa.

## Features

### Untuk Admin/Company
- **Create Job**: Membuat lowongan pekerjaan baru
- **Read Jobs**: Melihat semua lowongan pekerjaan
- **Update Job**: Mengedit lowongan pekerjaan yang ada
- **Delete Job**: Menghapus lowongan pekerjaan

### Untuk User Biasa
- **Read Jobs**: Melihat semua lowongan pekerjaan yang tersedia
- **View Details**: Melihat detail lengkap lowongan pekerjaan
- **Apply Job**: Melamar pekerjaan (sementara console.log)

## File Structure

```
src/pages/workspaces/jobs/
├── jobs.jsx          # Main page component dengan job listing
├── JobForm.jsx       # Form untuk create/edit job
├── JobDetail.jsx     # Component untuk menampilkan detail job
└── README.md         # Dokumentasi
```

## Role Detection

Role detection menggunakan `useAuthStore` untuk mengecek apakah user adalah admin/company:

```javascript
const isAdminOrCompany =
  user?.role === 'admin' ||
  user?.role === 'company' ||
  user?.is_admin === true;
```

## Data Hooks

Module ini menggunakan custom hooks dari `@/utils/hooks/useJobList.js`:

- `useJobs(filters)` - Fetch semua jobs dengan optional filters
- `useCreateJob()` - Create job mutation
- `useUpdateJob()` - Update job mutation
- `useDeleteJob()` - Delete job mutation

## Job Data Structure

```javascript
{
  id: uuid,
  title: string,
  company_id: uuid,                // Foreign key ke users.id
  user: {                          // Relasi ke users table (auto-loaded)
    id: uuid,
    role: 'candidate' | 'company' | 'admin',
    email: string,
    full_name: string,
    company_name: string,
    phone_number: string
  },
  company_name: string,            // Auto-mapped dari user.company_name atau user.full_name
  location: string,
  slug: string,
  status: string,
  salary_min: number,
  salary_max: number,
  currency: string,
  started_on: date,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Company ID Management

- **PENTING**: Table `job_list` TIDAK memiliki column `company`, hanya `company_id`
- **company_id** adalah **foreign key ke users.id**
- **Company Name** ditampilkan di form dalam mode disabled (tidak bisa diedit)
- **Company Name** diambil dengan priority:
  1. `user.company_name` (untuk role company)
  2. `user.full_name` (fallback)
  3. `user.email` (fallback terakhir)
- Saat create/edit job, `company_id` otomatis di-inject dari `user.id`
- Data user di-fetch dengan Supabase relation: `user:company_id(id, email, full_name, company_name, role)`
- Display company name menggunakan `job.company_name` yang sudah di-map dari relasi user

### Database Schema (Actual)

**Users Table:**
- `id` (uuid, PK)
- `role` (text: 'candidate', 'company', 'admin')
- `email` (text, unique)
- `password_hash` (text)
- `full_name` (text)
- `company_name` (text)
- `phone_number` (text)
- `created_at`, `updated_at`

**Job_List Table:**
- `id` (uuid, PK)
- `title` (varchar)
- `slug` (varchar)
- `status` (varchar)
- `salary_min` (numeric)
- `salary_max` (numeric)
- `currency` (varchar)
- `started_on` (date)
- `company_id` (uuid, FK → users.id)
- `created_at`, `updated_at`

## Navigation

Jobs page bisa diakses melalui:
- URL: `/jobs`
- Sidebar menu: "Jobs" dengan icon Briefcase

## Actions

### Admin/Company Actions
- **View**: Melihat detail lengkap job
- **Edit**: Membuka modal edit untuk mengubah data job
- **Delete**: Menghapus job dengan konfirmasi

### User Actions
- **View**: Melihat detail lengkap job
- **Apply**: Melamar job (saat ini hanya console.log dan message notification)

## Future Enhancements

1. Implementasi aplikasi job yang sebenarnya (simpan ke database)
2. Tracking aplikasi user (applied jobs)
3. Filter dan search functionality
4. Pagination untuk job listing
5. Upload attachment untuk aplikasi (CV, portfolio)
6. Email notification untuk aplikasi baru
7. Dashboard untuk melihat statistik aplikasi

