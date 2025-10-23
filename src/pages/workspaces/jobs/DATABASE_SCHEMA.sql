-- Schema untuk job applications
-- Tabel untuk menyimpan data aplikasi kandidat ke job

CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  job_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending',
  application_data jsonb NULL,
  notes text NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) 
    REFERENCES job_list (id) ON DELETE CASCADE,
  CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT job_applications_unique_user_job UNIQUE (job_id, user_id)
) TABLESPACE pg_default;

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id 
  ON public.job_applications(job_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id 
  ON public.job_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_status 
  ON public.job_applications(status);

-- Comments
COMMENT ON TABLE public.job_applications IS 'Tabel untuk menyimpan aplikasi kandidat ke job';
COMMENT ON COLUMN public.job_applications.status IS 'Status aplikasi: pending, reviewing, shortlisted, interview, accepted, rejected, withdrawn';
COMMENT ON COLUMN public.job_applications.application_data IS 'Data form aplikasi dari kandidat (jsonb)';
COMMENT ON COLUMN public.job_applications.notes IS 'Catatan internal dari recruiter';

-- Function untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto update updated_at
CREATE TRIGGER update_job_applications_updated_at 
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy untuk user bisa melihat aplikasi mereka sendiri
CREATE POLICY "Users can view their own applications"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy untuk company/admin bisa melihat aplikasi ke job mereka
CREATE POLICY "Companies can view applications to their jobs"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_list 
      WHERE job_list.id = job_applications.job_id 
      AND job_list.company_id = auth.uid()
    )
  );

-- Policy untuk user bisa membuat aplikasi
CREATE POLICY "Users can create applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk company/admin bisa update status aplikasi
CREATE POLICY "Companies can update applications to their jobs"
  ON public.job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_list 
      WHERE job_list.id = job_applications.job_id 
      AND job_list.company_id = auth.uid()
    )
  );

-- Policy untuk user bisa update aplikasi mereka sendiri (misal: withdraw)
CREATE POLICY "Users can update their own applications"
  ON public.job_applications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy untuk user bisa delete aplikasi mereka sendiri
CREATE POLICY "Users can delete their own applications"
  ON public.job_applications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy untuk company bisa delete aplikasi di job mereka
CREATE POLICY "Companies can delete applications to their jobs"
  ON public.job_applications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM job_list 
      WHERE job_list.id = job_applications.job_id 
      AND job_list.company_id = auth.uid()
    )
  );

