import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';

// Query keys
const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), filters],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), id],
  slug: (slug) => [...jobKeys.all, 'slug', slug],
  search: (term) => [...jobKeys.all, 'search', term],
  paginated: (page, limit, filters) => [
    ...jobKeys.all,
    'paginated',
    page,
    limit,
    filters,
  ],
};

/**
 * Helper function untuk menerapkan filter Supabase secara dinamis
 * @param {object} query - Supabase query builder
 * @param {object} filters - Object berisi filter dengan format: { column: { operator: value } }
 * @returns {object} Modified query
 *
 * Contoh penggunaan:
 * const filters = {
 *   status: { eq: 'active' },
 *   salary: { gte: 5000000, lte: 10000000 },
 *   title: { ilike: '%engineer%' },
 *   tags: { contains: ['remote', 'fulltime'] },
 *   location: { in: ['Jakarta', 'Bandung', 'Surabaya'] },
 *   verified: { is: true },
 *   company: { neq: 'ABC Corp' },
 *   or: 'status.eq.active,type.eq.fulltime'
 * }
 */
const applyFilters = (query, filters = {}) => {
  // Iterasi setiap filter
  for (const column of Object.keys(filters)) {
    const filterValue = filters[column];

    // Handle logical OR operator secara khusus
    if (column === 'or' && typeof filterValue === 'string') {
      query = query.or(filterValue);
      continue;
    }

    // Handle NOT operator secara khusus
    if (column === 'not' && typeof filterValue === 'object') {
      const { column: notColumn, operator, value } = filterValue;
      if (notColumn && operator && value !== undefined) {
        query = query.not(notColumn, operator, value);
      }
      continue;
    }

    // Jika filterValue adalah object dengan operator
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
          // Comparison operators
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

          // Pattern matching
          case 'like':
            query = query.like(column, value);
            break;
          case 'ilike':
            query = query.ilike(column, value);
            break;

          // Null check
          case 'is':
            query = query.is(column, value);
            break;

          // Array operators
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
const jobApi = {
  // Fetch all jobs
  fetchJobs: async (filters = {}) => {
    let query = supabase
      .from('job_list')
      .select('*, user:company_id(id, email, full_name, company_name, role)');

    // Terapkan filter menggunakan helper function
    query = applyFilters(query, filters);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Map company name untuk kemudahan akses
    return data?.map((job) => ({
      ...job,
      company_name: job.user
        ? job.user.company_name || job.user.full_name || job.user.email
        : null,
    }));
  },

  // Fetch single job by ID
  fetchJobById: async (id) => {
    const { data, error } = await supabase
      .from('job_list')
      .select('*, user:company_id(id, email, full_name, company_name, role)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      ...data,
      company_name: data.user
        ? data.user.company_name || data.user.full_name || data.user.email
        : null,
    };
  },

  // Fetch job by slug
  fetchJobBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('job_list')
      .select('*, user:company_id(id, email, full_name, company_name, role)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return {
      ...data,
      company_name: data.user
        ? data.user.company_name || data.user.full_name || data.user.email
        : null,
    };
  },

  // Create job
  createJob: async (jobData) => {
    const { data, error } = await supabase
      .from('job_list')
      .insert([jobData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update job
  updateJob: async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('job_list')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete job
  deleteJob: async (id) => {
    const { error } = await supabase.from('job_list').delete().eq('id', id);

    if (error) throw error;
    return id;
  },

  // Search jobs
  searchJobs: async (searchTerm) => {
    const { data, error } = await supabase
      .from('job_list')
      .select('*, user:company_id(id, email, full_name, company_name, role)')
      .ilike('title', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map((job) => ({
      ...job,
      company_name: job.user
        ? job.user.company_name || job.user.full_name || job.user.email
        : null,
    }));
  },

  // Fetch with pagination
  fetchJobsPaginated: async ({ page = 1, limit = 10, filters = {} }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('job_list')
      .select('*, user:company_id(id, email, full_name, company_name, role)', {
        count: 'exact',
      });

    // Terapkan filter menggunakan helper function
    query = applyFilters(query, filters);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data?.map((job) => ({
        ...job,
        company_name: job.user
          ? job.user.company_name || job.user.full_name || job.user.email
          : null,
      })),
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  },
};

// Custom hooks
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobApi.fetchJobs(filters),
  });
};

export const useJob = (id) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobApi.fetchJobById(id),
    enabled: !!id,
  });
};

export const useJobBySlug = (slug) => {
  return useQuery({
    queryKey: jobKeys.slug(slug),
    queryFn: () => jobApi.fetchJobBySlug(slug),
    enabled: !!slug,
  });
};

export const useSearchJobs = (searchTerm) => {
  return useQuery({
    queryKey: jobKeys.search(searchTerm),
    queryFn: () => jobApi.searchJobs(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 0,
  });
};

export const useJobsPaginated = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: jobKeys.paginated(page, limit, filters),
    queryFn: () => jobApi.fetchJobsPaginated({ page, limit, filters }),
    keepPreviousData: true,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApi.updateJob,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.slug(data.slug) });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApi.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
};

/**
 * ========================================
 * DOKUMENTASI PENGGUNAAN FILTER
 * ========================================
 *
 * Hook ini sekarang mendukung semua operator filter Supabase.
 *
 * Format filter: { column: { operator: value } }
 *
 * CONTOH PENGGUNAAN:
 *
 * 1. COMPARISON OPERATORS (Perbandingan)
 * --------------------------------------
 * const { data } = useJobs({
 *   status: { eq: 'active' },                    // Equal to
 *   salary: { gt: 5000000 },                     // Greater than
 *   experience_years: { gte: 3 },                // Greater than or equal to
 *   age: { lt: 40 },                            // Less than
 *   rating: { lte: 4.5 },                       // Less than or equal to
 *   company: { neq: 'ABC Corp' }                 // Not equal to
 * });
 *
 * 2. PATTERN MATCHING (Pencarian)
 * --------------------------------
 * const { data } = useJobs({
 *   title: { like: '%Engineer%' },               // Case sensitive
 *   description: { ilike: '%remote%' }           // Case insensitive
 * });
 *
 * 3. NULL CHECK
 * -------------
 * const { data } = useJobs({
 *   deleted_at: { is: null }                     // Check if null
 * });
 *
 * 4. ARRAY OPERATORS
 * ------------------
 * const { data } = useJobs({
 *   location: { in: ['Jakarta', 'Bandung', 'Surabaya'] },  // IN array
 *   tags: { contains: ['remote', 'fulltime'] },            // Array contains
 *   skills: { containedBy: ['JavaScript', 'Python'] }      // Array contained by
 * });
 *
 * 5. MULTIPLE FILTERS (Kombinasi)
 * --------------------------------
 * const { data } = useJobs({
 *   status: { eq: 'active' },
 *   salary: { gte: 5000000, lte: 15000000 },     // Range: 5jt - 15jt
 *   title: { ilike: '%engineer%' },
 *   location: { in: ['Jakarta', 'Bandung'] }
 * });
 *
 * 6. LOGICAL OR OPERATOR
 * ----------------------
 * const { data } = useJobs({
 *   or: 'status.eq.active,type.eq.fulltime'      // status = active OR type = fulltime
 * });
 *
 * 7. NOT OPERATOR (Negasi)
 * ------------------------
 * const { data } = useJobs({
 *   not: { column: 'status', operator: 'eq', value: 'closed' }  // NOT status = closed
 * });
 *
 * 8. PAGINATION DENGAN FILTER
 * ----------------------------
 * const { data } = useJobsPaginated(1, 20, {
 *   status: { eq: 'active' },
 *   salary: { gte: 8000000 },
 *   title: { ilike: '%senior%' }
 * });
 *
 */
