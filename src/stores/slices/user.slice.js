import { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Initial state
const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

export const createUserSlice = (set) => ({
  ...initialState,
  // Async action contoh (bisa pakai axios/fetch)
  login: async (email, password) => {
    try {
      // Simulasi API call
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const { token, user } = await response.json();

      set((state) => {
        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    set((state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });
  },

  register: async (userData) => {
    // Implementasi registrasi
    console.log('Registering user HOOKS =>', userData);
  },

  updateProfile: (updatedData) => {
    set((state) => {
      if (state.user) {
        state.user = { ...state.user, ...updatedData };
      }
    });
  },
});
