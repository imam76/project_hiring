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

export const isAuthenticated = async () => {
  const session = await getCurrentSession();
  return !!session;
};

export const getAccessToken = async () => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};

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

export const subscribeToTable = (table, callback, filter = {}) => {
  let channel = supabase.channel(`${table}_changes`);

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

export const subscribeToRow = (table, id, callback) => {
  return subscribeToTable(table, callback, {
    filter: `id=eq.${id}`,
  });
};

export default supabase;
