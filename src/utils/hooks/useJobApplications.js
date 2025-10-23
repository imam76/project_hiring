import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';

// Query keys
const jobApplicationKeys = {
  all: ['jobApplications'],
  lists: () => [...jobApplicationKeys.all, 'list'],
  list: (filters) => [...jobApplicationKeys.lists(), filters],
  details: () => [...jobApplicationKeys.all, 'detail'],
  detail: (id) => [...jobApplicationKeys.details(), id],
  byJobId: (jobId) => [...jobApplicationKeys.all, 'byJobId', jobId],
  byUserId: (userId) => [...jobApplicationKeys.all, 'byUserId', userId],
};

/**
 * Helper function untuk menerapkan filter Supabase secara dinamis
 */
const applyFilters = (query, filters = {}) => {
  for (const column of Object.keys(filters)) {
    const filterValue = filters[column];

    if (column === 'or' && typeof filterValue === 'string') {
      query = query.or(filterValue);
      continue;
    }

    if (column === 'not' && typeof filterValue === 'object') {
      const { column: notColumn, operator, value } = filterValue;
      if (notColumn && operator && value !== undefined) {
        query = query.not(notColumn, operator, value);
      }
      continue;
    }

    if (
      typeof filterValue === 'object' &&
      !Array.isArray(filterValue) &&
      filterValue !== null
    ) {
      for (const operator of Object.keys(filterValue)) {
        const value = filterValue[operator];

        if (value === undefined || (value === null && operator !== 'is'))
          continue;

        switch (operator) {
          case 'eq':
            query = query.eq(column, value);
            break;
          case 'neq':
            query = query.neq(column, value);
            break;
          case 'gt':
            query = query.gt(column, value);
            break;
          case 'gte':
            query = query.gte(column, value);
            break;
          case 'lt':
            query = query.lt(column, value);
            break;
          case 'lte':
            query = query.lte(column, value);
            break;
          case 'like':
            query = query.like(column, value);
            break;
          case 'ilike':
            query = query.ilike(column, value);
            break;
          case 'is':
            query = query.is(column, value);
            break;
          case 'in':
            if (Array.isArray(value)) {
              query = query.in(column, value);
            }
            break;
          case 'contains':
            if (Array.isArray(value)) {
              query = query.contains(column, value);
            }
            break;
          case 'containedBy':
            if (Array.isArray(value)) {
              query = query.containedBy(column, value);
            }
            break;
          default:
            console.warn(
              `Operator '${operator}' tidak dikenali untuk column '${column}'`,
            );
        }
      }
    }
  }

  return query;
};

// API functions
const jobApplicationApi = {
  // Fetch all job applications
  fetchJobApplications: async (filters = {}) => {
    let query = supabase.from('job_applications').select(`
        *,
        job:job_list(id, title, company_name),
        applicant:users(id, full_name, email, phone_number)
      `);

    query = applyFilters(query, filters);
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch applications by job_id
  fetchApplicationsByJobId: async (jobId) => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        applicant:users(id, full_name, email, phone_number)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch applications by user_id (applicant)
  fetchApplicationsByUserId: async (userId) => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_list(id, title, company_name, salary_min, salary_max, currency, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch single application by ID
  fetchApplicationById: async (id) => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_list(*),
        applicant:users(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create job application
  createJobApplication: async (applicationData) => {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update job application
  updateJobApplication: async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update application status
  updateApplicationStatus: async ({ id, status, notes }) => {
    const updates = { status };
    if (notes !== undefined) {
      updates.notes = notes;
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete job application
  deleteJobApplication: async (id) => {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },

  // Check if user already applied
  checkUserApplication: async (jobId, userId) => {
    const { data, error } = await supabase
      .from('job_applications')
      .select('id, status')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// Custom hooks
export const useJobApplications = (filters = {}) => {
  return useQuery({
    queryKey: jobApplicationKeys.list(filters),
    queryFn: () => jobApplicationApi.fetchJobApplications(filters),
  });
};

export const useApplicationsByJobId = (jobId) => {
  return useQuery({
    queryKey: jobApplicationKeys.byJobId(jobId),
    queryFn: () => jobApplicationApi.fetchApplicationsByJobId(jobId),
    enabled: !!jobId,
  });
};

export const useApplicationsByUserId = (userId) => {
  return useQuery({
    queryKey: jobApplicationKeys.byUserId(userId),
    queryFn: () => jobApplicationApi.fetchApplicationsByUserId(userId),
    enabled: !!userId,
  });
};

export const useJobApplication = (id) => {
  return useQuery({
    queryKey: jobApplicationKeys.detail(id),
    queryFn: () => jobApplicationApi.fetchApplicationById(id),
    enabled: !!id,
  });
};

export const useCreateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationApi.createJobApplication,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.byJobId(data.job_id),
      });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.byUserId(data.user_id),
      });
    },
  });
};

export const useUpdateJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationApi.updateJobApplication,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.byJobId(data.job_id),
      });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.byUserId(data.user_id),
      });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationApi.updateApplicationStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.byJobId(data.job_id),
      });
    },
  });
};

export const useDeleteJobApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApplicationApi.deleteJobApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobApplicationKeys.lists() });
    },
  });
};

export const useCheckUserApplication = (jobId, userId) => {
  return useQuery({
    queryKey: [...jobApplicationKeys.all, 'check', jobId, userId],
    queryFn: () => jobApplicationApi.checkUserApplication(jobId, userId),
    enabled: !!jobId && !!userId,
  });
};
