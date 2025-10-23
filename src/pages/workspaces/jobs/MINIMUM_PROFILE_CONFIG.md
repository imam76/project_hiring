# Minimum Profile Information Required

## Deskripsi
Fitur ini memungkinkan employer untuk mengkonfigurasi field-field profil mana saja yang wajib (mandatory), opsional (optional), atau tidak diperlukan (off) saat kandidat melamar pekerjaan.

## Struktur Data

Data disimpan di tabel `job_configuration` dengan field `application_form` (jsonb):

```json
{
  "application_form": {
    "sections": [
      {
        "title": "Minimum Profile Information Required",
        "fields": [
          { "key": "full_name", "validation": { "required": true } },
          { "key": "photo_profile", "validation": { "required": true } },
          { "key": "gender", "validation": { "required": true } },
          { "key": "domicile", "validation": { "required": false } },
          { "key": "email", "validation": { "required": true } },
          { "key": "phone_number", "validation": { "required": true } },
          { "key": "linkedin_link", "validation": { "required": true } },
          { "key": "date_of_birth", "validation": { "required": false } }
        ]
      }
    ]
  }
}
```

## Field Options

Setiap field memiliki 3 opsi:
- **Mandatory** (`required: true`): Field wajib diisi oleh kandidat
- **Optional** (`required: false`): Field bersifat opsional
- **Off** (tidak disertakan): Field tidak ditampilkan di form aplikasi

## Available Fields

1. **Full name** - Nama lengkap kandidat
2. **Photo Profile** - Foto profil kandidat
3. **Gender** - Jenis kelamin
4. **Domicile** - Domisili/tempat tinggal
5. **Email** - Alamat email
6. **Phone number** - Nomor telepon
7. **Linkedin link** - Link profil LinkedIn
8. **Date of birth** - Tanggal lahir

## Komponen

### MinimumProfileConfig.jsx
Komponen untuk mengelola konfigurasi field profil dengan UI toggle button (Mandatory/Optional/Off).

**Props:**
- `value`: Object configuration yang sudah ada
- `onChange`: Callback function yang dipanggil saat ada perubahan

### JobForm.jsx
Form untuk create/edit job yang sudah diintegrasikan dengan MinimumProfileConfig.

## Hooks yang Digunakan

### useJobConfigurationByJobId
Fetch job configuration berdasarkan job_id:
```javascript
const { data: jobConfig } = useJobConfigurationByJobId(jobId);
```

### useUpsertJobConfiguration
Insert atau update job configuration:
```javascript
const upsertConfigMutation = useUpsertJobConfiguration();

await upsertConfigMutation.mutateAsync({
  job_id: jobId,
  application_form: profileConfig,
});
```

## Flow

1. User membuka form create/edit job
2. Jika edit, sistem fetch existing configuration menggunakan `useJobConfigurationByJobId`
3. User mengatur field-field sesuai kebutuhan (Mandatory/Optional/Off)
4. Saat submit, sistem menyimpan job terlebih dahulu
5. Setelah job tersimpan, sistem menyimpan configuration menggunakan `useUpsertJobConfiguration`
6. Configuration disimpan dengan `onConflict: 'job_id'` untuk handle update jika sudah ada

## Database Schema

```sql
create table public.job_configuration (
  id uuid not null default extensions.uuid_generate_v4 (),
  job_id uuid null,
  application_form jsonb not null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint job_configuration_pkey primary key (id),
  constraint job_configuration_job_id_fkey foreign KEY (job_id) references job_list (id) on delete CASCADE
)
```

## Notes

- Configuration otomatis tersimpan saat create/update job
- Jika job dihapus, configuration juga otomatis terhapus (CASCADE)
- Default state untuk semua field adalah "Mandatory" jika belum ada configuration

