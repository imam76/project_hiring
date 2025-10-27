import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '../supabase';

// Query keys
const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
  email: (email) => [...userKeys.all, 'email', email],
  role: (role) => [...userKeys.all, 'role', role],
  search: (term) => [...userKeys.all, 'search', term],
  paginated: (page, limit, filters) => [
    ...userKeys.all,
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
 *   role: { eq: 'admin' },
 *   full_name: { ilike: '%john%' },
 *   created_at: { gte: '2024-01-01', lte: '2024-12-31' },
 *   email: { in: ['user1@mail.com', 'user2@mail.com'] },
 *   company_name: { neq: 'ABC Corp' },
 *   or: 'role.eq.admin,role.eq.recruiter'
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
export const userApi = {
  // Fetch all users
  fetchUsers: async (filters = {}) => {
    let query = supabase.from('users').select('*');

    // Terapkan filter menggunakan helper function
    query = applyFilters(query, filters);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch single user by ID
  fetchUserById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch user by email
  fetchUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch users by role
  fetchUsersByRole: async (role) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create user
  createUser: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  updateUser: async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user
  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) throw error;
    return id;
  },

  // Search users by name or email
  searchUsers: async (searchTerm) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch with pagination
  fetchUsersPaginated: async ({ page = 1, limit = 10, filters = {} }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('users').select('*', { count: 'exact' });

    // Terapkan filter menggunakan helper function
    query = applyFilters(query, filters);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  },
};

// Custom hooks
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.fetchUsers(filters),
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.fetchUserById(id),
    enabled: !!id,
  });
};

export const useUserByEmail = (email) => {
  return useQuery({
    queryKey: userKeys.email(email),
    queryFn: () => userApi.fetchUserByEmail(email),
    enabled: !!email,
  });
};

export const useUsersByRole = (role) => {
  return useQuery({
    queryKey: userKeys.role(role),
    queryFn: () => userApi.fetchUsersByRole(role),
    enabled: !!role,
  });
};

export const useSearchUsers = (searchTerm) => {
  return useQuery({
    queryKey: userKeys.search(searchTerm),
    queryFn: () => userApi.searchUsers(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 0,
  });
};

export const useUsersPaginated = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: userKeys.paginated(page, limit, filters),
    queryFn: () => userApi.fetchUsersPaginated({ page, limit, filters }),
    keepPreviousData: true,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.email(data.email) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
