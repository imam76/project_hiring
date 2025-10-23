# Job Applications Management

## Deskripsi
Fitur ini memungkinkan employer/company untuk mengelola kandidat yang melamar pekerjaan. Admin/company dapat melihat daftar kandidat, mengupdate status aplikasi, dan melihat detail aplikasi.

## Fitur Utama

### 1. Tombol "Manage" di Jobs Page
- Tombol "Manage" muncul di setiap job card untuk user dengan role admin/company
- Ketika diklik, akan redirect ke halaman manage aplikasi untuk job tersebut
- Route: `/workspaces/jobs/:jobId/applications`

### 2. Job Applications Table
Menampilkan table dengan kolom:
- **Applicant**: Foto profil, nama lengkap, dan email kandidat
- **Contact**: Phone number dan link LinkedIn (jika ada)
- **Application Data**: Jumlah field yang disubmit
- **Applied Date**: Tanggal dan waktu melamar
- **Status**: Dropdown untuk update status
- **Action**: Tombol untuk view detail aplikasi

### 3. Status Management
Status yang tersedia:
- **Pending** (gold) - Aplikasi baru masuk
- **Reviewing** (blue) - Sedang direview
- **Shortlisted** (cyan) - Kandidat terpilih
- **Interview** (purple) - Tahap interview
- **Accepted** (green) - Diterima
- **Rejected** (red) - Ditolak

Admin/company dapat langsung mengubah status dari table dengan dropdown.

### 4. Application Details Modal
Detail aplikasi mencakup:
- **Applicant Information**: Nama, email, phone, LinkedIn
- **Application Data**: Field-field yang disubmit oleh kandidat
- **Application Status**: Status saat ini, tanggal apply, dan notes

### 5. Statistics Card
Menampilkan statistik di header:
- Total applications
- Pending applications
- Accepted applications

## Database Schema

```sql
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid NOT NULL REFERENCES job_list(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(50) NOT NULL DEFAULT 'pending',
  application_data jsonb NULL,
  notes text NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT job_applications_unique_user_job UNIQUE (job_id, user_id)
);
```

### Indexes
- `idx_job_applications_job_id` - Index pada job_id
- `idx_job_applications_user_id` - Index pada user_id
- `idx_job_applications_status` - Index pada status

### Constraints
- **UNIQUE**: Satu user hanya bisa apply sekali per job
- **CASCADE**: Jika job atau user dihapus, aplikasi otomatis terhapus

### Row Level Security (RLS)
Policy yang aktif:
1. User dapat melihat aplikasi mereka sendiri
2. Company dapat melihat aplikasi ke job mereka
3. User dapat membuat aplikasi baru
4. Company dapat update aplikasi di job mereka
5. User dapat update aplikasi mereka sendiri (withdraw)
6. User dapat delete aplikasi mereka sendiri
7. Company dapat delete aplikasi di job mereka

## Hooks yang Digunakan

### useApplicationsByJobId
Fetch semua aplikasi untuk job tertentu:
```javascript
const { data: applications, isLoading } = useApplicationsByJobId(jobId);
```

Response includes:
- Application data
- Applicant details (full_name, email, phone_number, linkedin_link, photo_profile)

### useUpdateApplicationStatus
Update status aplikasi:
```javascript
const updateStatusMutation = useUpdateApplicationStatus();

await updateStatusMutation.mutateAsync({
  id: applicationId,
  status: 'accepted',
  notes: 'Optional notes'
});
```

### useCreateJobApplication
Create aplikasi baru (untuk kandidat):
```javascript
const createApplicationMutation = useCreateJobApplication();

await createApplicationMutation.mutateAsync({
  job_id: jobId,
  user_id: userId,
  status: 'pending',
  application_data: { /* data from application form */ }
});
```

### useCheckUserApplication
Cek apakah user sudah apply:
```javascript
const { data: existingApplication } = useCheckUserApplication(jobId, userId);
```

## Struktur Data

### application_data (JSONB)
Data form aplikasi yang disubmit kandidat, sesuai dengan konfigurasi dari `job_configuration`:

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+62812345678",
  "linkedin_link": "https://linkedin.com/in/johndoe",
  "gender": "Male",
  "domicile": "Jakarta",
  "date_of_birth": "1990-01-01",
  "cover_letter": "I am interested in this position...",
  "portfolio_url": "https://johndoe.com"
}
```

## Flow User

### Company/Admin Flow:
1. Login sebagai company/admin
2. Buka halaman Jobs (`/workspaces/jobs`)
3. Klik tombol "Manage" pada job card
4. Melihat table kandidat yang apply
5. Filter berdasarkan status (optional)
6. Klik dropdown status untuk update
7. Klik "View Details" untuk melihat detail kandidat
8. Kembali ke jobs page dengan tombol "Back to Jobs"

### Kandidat Flow (untuk future implementation):
1. Login sebagai user/kandidat
2. Browse job listings
3. Klik "Apply" pada job
4. Isi application form sesuai konfigurasi job
5. Submit aplikasi
6. Lihat status aplikasi di "My Applications"

## Files yang Terlibat

### 1. `useJobApplications.js`
Hook untuk manage aplikasi (CRUD operations)

### 2. `JobApplicationsManage.jsx`
Page untuk menampilkan dan manage kandidat

### 3. `jobs.jsx`
Ditambahkan tombol "Manage" dan handler

### 4. `workspaces.jsx` (routes)
Ditambahkan route untuk `/jobs/:jobId/applications`

### 5. `DATABASE_SCHEMA.sql`
SQL script untuk membuat tabel dan setup RLS policies

## Empty State

Jika belum ada kandidat yang apply, akan muncul Empty component dengan pesan:
> "There are no candidates applying yet"

## Notes

- Satu user hanya bisa apply sekali per job (enforced by UNIQUE constraint)
- Status otomatis set ke 'pending' saat create aplikasi
- Aplikasi otomatis terhapus jika job atau user dihapus (CASCADE)
- Company hanya bisa melihat aplikasi di job mereka sendiri (RLS)
- User hanya bisa melihat aplikasi mereka sendiri (RLS)
- Updated_at otomatis terupdate menggunakan trigger

## Future Enhancements

1. ✨ Email notification saat status berubah
2. ✨ Bulk actions (accept/reject multiple)
3. ✨ Advanced filtering (by date range, skills, etc)
4. ✨ Export aplikasi ke CSV/Excel
5. ✨ Interview scheduling integration
6. ✨ Resume/CV upload dan viewer
7. ✨ Rating dan notes untuk kandidat
8. ✨ Application form builder (dynamic)

