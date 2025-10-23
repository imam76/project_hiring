import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';

// Query keys
const jobConfigurationKeys = {
  all: ['jobConfigurations'],
  lists: () => [...jobConfigurationKeys.all, 'list'],
  list: (filters) => [...jobConfigurationKeys.lists(), filters],
  details: () => [...jobConfigurationKeys.all, 'detail'],
  detail: (id) => [...jobConfigurationKeys.details(), id],
  byJobId: (jobId) => [...jobConfigurationKeys.all, 'byJobId', jobId],
};

/**
 * Helper function untuk menerapkan filter Supabase secara dinamis
 * @param {object} query - Supabase query builder
 * @param {object} filters - Object berisi filter dengan format: { column: { operator: value } }
 * @returns {object} Modified query
 *
 * Contoh penggunaan:
 * const filters = {
 *   job_id: { eq: 'uuid-here' },
 *   created_at: { gte: '2024-01-01', lte: '2024-12-31' },
 *   or: 'job_id.eq.uuid1,job_id.eq.uuid2'
 * }
 */
const applyFilters = (query, filters = {}) => {
  // Iterasi setiap filter
  Object.keys(filters).forEach((column) => {
    const filterValue = filters[column];

    // Handle logical OR operator secara khusus
    if (column === 'or' && typeof filterValue === 'string') {
      query = query.or(filterValue);
      return;
    }

    // Handle NOT operator secara khusus
    if (column === 'not' && typeof filterValue === 'object') {
      const { column: notColumn, operator, value } = filterValue;
      if (notColumn && operator && value !== undefined) {
        query = query.not(notColumn, operator, value);
      }
      return;
    }

    // Jika filterValue adalah object dengan operator
    if (
      typeof filterValue === 'object' &&
      !Array.isArray(filterValue) &&
      filterValue !== null
    ) {
      Object.keys(filterValue).forEach((operator) => {
        const value = filterValue[operator];

        if (value === undefined || (value === null && operator !== 'is'))
          return;

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
      });
    }
  });

  return query;
};

// API functions
const jobConfigurationApi = {
  // Fetch all job configurations
  fetchJobConfigurations: async (filters = {}) => {
    let query = supabase.from('job_configuration').select('*');

    // Terapkan filter menggunakan helper function
    query = applyFilters(query, filters);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch single job configuration by ID
  fetchJobConfigurationById: async (id) => {
    const { data, error } = await supabase
      .from('job_configuration')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch job configuration by job_id (melalui job_list)
  fetchJobConfigurationByJobId: async (jobId) => {
    // Ambil job_configuration_id dari job_list dulu
    const { data: jobData, error: jobError } = await supabase
      .from('job_list')
      .select('job_configuration_id')
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;
    if (!jobData?.job_configuration_id) return null;

    // Ambil job_configuration berdasarkan id
    const { data, error } = await supabase
      .from('job_configuration')
      .select('*')
      .eq('id', jobData.job_configuration_id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create job configuration
  createJobConfiguration: async (configData) => {
    const { data, error } = await supabase
      .from('job_configuration')
      .insert([configData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update job configuration
  updateJobConfiguration: async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('job_configuration')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update job configuration by job_id
  updateJobConfigurationByJobId: async ({ jobId, updates }) => {
    // Ambil job_configuration_id dari job_list dulu
    const { data: jobData, error: jobError } = await supabase
      .from('job_list')
      .select('job_configuration_id')
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;
    if (!jobData?.job_configuration_id) {
      throw new Error('Job configuration not found for this job');
    }

    // Update job_configuration berdasarkan id
    const { data, error } = await supabase
      .from('job_configuration')
      .update(updates)
      .eq('id', jobData.job_configuration_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete job configuration
  deleteJobConfiguration: async (id) => {
    const { error } = await supabase
      .from('job_configuration')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },

  // Upsert job configuration (insert or update if exists)
  upsertJobConfiguration: async ({ jobId, configData }) => {
    // Cek apakah job sudah punya job_configuration_id
    const { data: jobData, error: jobError } = await supabase
      .from('job_list')
      .select('job_configuration_id')
      .eq('id', jobId)
      .single();

    if (jobError) throw jobError;

    const configId = jobData.job_configuration_id;

    if (configId) {
      // Update existing configuration
      const { data, error } = await supabase
        .from('job_configuration')
        .update(configData)
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new configuration
      const { data: newConfig, error: createError } = await supabase
        .from('job_configuration')
        .insert([configData])
        .select()
        .single();

      if (createError) throw createError;

      // Update job_list dengan job_configuration_id
      const { error: updateJobError } = await supabase
        .from('job_list')
        .update({ job_configuration_id: newConfig.id })
        .eq('id', jobId);

      if (updateJobError) throw updateJobError;

      return newConfig;
    }
  },
};

// Custom hooks
export const useJobConfigurations = (filters = {}) => {
  return useQuery({
    queryKey: jobConfigurationKeys.list(filters),
    queryFn: () => jobConfigurationApi.fetchJobConfigurations(filters),
  });
};

export const useJobConfiguration = (id) => {
  return useQuery({
    queryKey: jobConfigurationKeys.detail(id),
    queryFn: () => jobConfigurationApi.fetchJobConfigurationById(id),
    enabled: !!id,
  });
};

export const useJobConfigurationByJobId = (jobId) => {
  return useQuery({
    queryKey: jobConfigurationKeys.byJobId(jobId),
    queryFn: () => jobConfigurationApi.fetchJobConfigurationByJobId(jobId),
    enabled: !!jobId,
  });
};

export const useCreateJobConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobConfigurationApi.createJobConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.lists() });
      // Invalidate semua byJobId queries karena tidak tahu jobId mana yang ter-update
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.all });
    },
  });
};

export const useUpdateJobConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobConfigurationApi.updateJobConfiguration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobConfigurationKeys.detail(data.id),
      });
      // Invalidate semua byJobId queries
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.all });
    },
  });
};

export const useUpdateJobConfigurationByJobId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobConfigurationApi.updateJobConfigurationByJobId,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobConfigurationKeys.detail(data.id),
      });
      // Invalidate berdasarkan jobId dari parameter
      if (variables.jobId) {
        queryClient.invalidateQueries({
          queryKey: jobConfigurationKeys.byJobId(variables.jobId),
        });
      }
    },
  });
};

export const useDeleteJobConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobConfigurationApi.deleteJobConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.lists() });
    },
  });
};

export const useUpsertJobConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobConfigurationApi.upsertJobConfiguration,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: jobConfigurationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: jobConfigurationKeys.detail(data.id),
      });
      // Invalidate berdasarkan jobId dari parameter
      if (variables.jobId) {
        queryClient.invalidateQueries({
          queryKey: jobConfigurationKeys.byJobId(variables.jobId),
        });
      }
    },
  });
};
