import { logger } from '@/config/env';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables');
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
}

// Create Supabase client dengan options
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
});

/**
 * ===========================================
 * HELPER FUNCTIONS
 * ===========================================
 */

/**
 * Get current session from storage
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    logger.error('Failed to get session:', error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    logger.error('Failed to get user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session;
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function yang dipanggil saat auth state berubah
 * @returns {Object} Subscription object dengan unsubscribe method
 */
export const onAuthStateChange = (callback) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    logger.log('Auth state changed:', event);
    if (callback) callback(event, session);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
};

/**
 * Error handler helper untuk Supabase errors
 */
export const handleSupabaseError = (error) => {
  if (!error) return null;

  const errorMessages = {
    'Invalid login credentials': 'Email atau password salah',
    'Email not confirmed': 'Email belum diverifikasi. Silakan cek inbox Anda.',
    'User already registered': 'Email sudah terdaftar',
    'Password should be at least 6 characters': 'Password minimal 6 karakter',
    'Unable to validate email address: invalid format':
      'Format email tidak valid',
  };

  return {
    message: errorMessages[error.message] || error.message,
    status: error.status,
    code: error.code,
  };
};

/**
 * ===========================================
 * REALTIME HELPERS
 * ===========================================
 */

/**
 * Subscribe to table changes
 * @param {string} table - Table name
 * @param {Function} callback - Callback function
 * @param {Object} filter - Optional filter
 */
export const subscribeToTable = (table, callback, filter = {}) => {
  let channel = supabase.channel(`${table}_changes`);

  // Apply filters
  if (filter.event) {
    channel = channel.on(
      'postgres_changes',
      {
        event: filter.event, // 'INSERT', 'UPDATE', 'DELETE', '*'
        schema: 'public',
        table: table,
        ...filter,
      },
      callback,
    );
  } else {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      callback,
    );
  }

  channel.subscribe();

  return {
    unsubscribe: () => channel.unsubscribe(),
  };
};

/**
 * Subscribe to specific row changes
 */
export const subscribeToRow = (table, id, callback) => {
  return subscribeToTable(table, callback, {
    filter: `id=eq.${id}`,
  });
};

export default supabase;

/**
 * ===========================================
 * DOKUMENTASI PENGGUNAAN
 * ===========================================
 *
 * 1. IMPORT SUPABASE CLIENT
 * -------------------------
 * import supabase from '@/utils/supabase';
 *
 * 2. GET CURRENT SESSION
 * ----------------------
 * import { getCurrentSession } from '@/utils/supabase';
 *
 * const session = await getCurrentSession();
 * console.log('Access token:', session?.access_token);
 *
 * 3. GET CURRENT USER
 * -------------------
 * import { getCurrentUser } from '@/utils/supabase';
 *
 * const user = await getCurrentUser();
 * console.log('User:', user);
 *
 * 4. CHECK AUTHENTICATION
 * -----------------------
 * import { isAuthenticated } from '@/utils/supabase';
 *
 * if (await isAuthenticated()) {
 *   console.log('User is logged in');
 * }
 *
 * 5. AUTH STATE LISTENER
 * ----------------------
 * import { onAuthStateChange } from '@/utils/supabase';
 *
 * const subscription = onAuthStateChange((event, session) => {
 *   console.log('Auth event:', event);
 *   console.log('Session:', session);
 * });
 *
 * // Cleanup
 * subscription.unsubscribe();
 *
 * 6. ERROR HANDLING
 * -----------------
 * import { handleSupabaseError } from '@/utils/supabase';
 *
 * try {
 *   await supabase.auth.signIn({ email, password });
 * } catch (error) {
 *   const errorInfo = handleSupabaseError(error);
 *   console.error(errorInfo.message);
 * }
 *
 * 7. REALTIME SUBSCRIPTION
 * ------------------------
 * import { subscribeToTable } from '@/utils/supabase';
 *
 * const subscription = subscribeToTable('users', (payload) => {
 *   console.log('Change received:', payload);
 * }, { event: 'INSERT' });
 *
 * // Cleanup
 * subscription.unsubscribe();
 *
 * 8. ROW SUBSCRIPTION
 * -------------------
 * import { subscribeToRow } from '@/utils/supabase';
 *
 * const subscription = subscribeToRow('users', 'user-id', (payload) => {
 *   console.log('User updated:', payload);
 * });
 *
 * // Cleanup
 * subscription.unsubscribe();
 */
