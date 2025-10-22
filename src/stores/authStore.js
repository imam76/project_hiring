import { logger } from '@/config/env';
import Api from '@/utils/axios/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper functions
const selectDefaultWorkspace = (userWorkspace, lastWorkspaceId) => {
  // Priority: if lastWorkspaceId matches user's workspace, use it
  if (
    lastWorkspaceId &&
    userWorkspace &&
    userWorkspace.id === lastWorkspaceId
  ) {
    return userWorkspace;
  }

  // Otherwise, return user's workspace if available
  return userWorkspace || null;
};

const buildUserData = (userData, workspaces, token) => ({
  ...userData,
  workspace: workspaces,
  token,
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isLoading: false,
      isAuthenticated: false,
      currentWorkspace: null,
      lastWorkspaceId: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true });

          const response = await Api().post('/api/v1/auth/login', {
            email,
            password,
          });

          const { data } = response;

          if (!data?.user) {
            set({ isLoading: false });
            return { success: false, error: data?.message || 'Login failed' };
          }

          // Workspace selection logic
          const { lastWorkspaceId } = get();
          const userWorkspace = data.workspace || null;
          const selectedWorkspace = selectDefaultWorkspace(
            userWorkspace,
            lastWorkspaceId,
          );

          // Build user data
          const userData = buildUserData(data.user, data.workspace, data.token);

          // Update state
          set({
            user: userData,
            currentWorkspace: selectedWorkspace,
            isAuthenticated: true,
            isLoading: false,
          });

          // Logging
          logger.log('Login successful =>', data);
          logger.log('Selected workspace =>', selectedWorkspace);

          return { success: true, user: userData };
        } catch (error) {
          set({ isLoading: false });
          logger.error('Login error:', error);

          return {
            success: false,
            error: error.response?.data?.message || 'Login failed',
          };
        }
      },

      register: async (username, email, password) => {
        try {
          set({ isLoading: true });

          const response = await Api().post('/api/v1/auth/register', {
            username,
            email,
            password,
          });

          const { data } = response;

          if (data?.user) {
            set({ isLoading: false });
            logger.log('Registration successful =>', data);
            return {
              success: true,
              message: 'Registration successful! Please login.',
            };
          }

          set({ isLoading: false });
          return {
            success: false,
            error: data?.message || 'Registration failed',
          };
        } catch (error) {
          set({ isLoading: false });
          logger.error('Registration error:', error);

          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      logout: async () => {
        try {
          await Api().post('/api/v1/auth/logout');
        } catch (error) {
          logger.warn('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            currentWorkspace: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuthStatus: async () => {
        const { isLoading, user, lastWorkspaceId } = get();
        console.log('Current workspace before auth check =>', lastWorkspaceId);
        // Prevent race conditions
        if (isLoading) {
          logger.log('Auth check already in progress, skipping...');
          return user;
        }

        try {
          set({ isLoading: true });
          logger.log('Current workspace before auth check =>', lastWorkspaceId);

          const response = await Api().get('/api/v1/auth/me', {
            headers: {
              Authorization: user?.token ? `Bearer ${user.token}` : '',
              'X-Workspace-ID': lastWorkspaceId || '',
            },
          });

          const { data } = response;

          if (!data?.user) {
            throw new Error('Not authenticated');
          }

          // Workspace selection logic
          const availableWorkspaces = data.workspace || null;
          const selectedWorkspace = selectDefaultWorkspace(
            availableWorkspaces,
            lastWorkspaceId,
          );

          // Build user data
          const userData = buildUserData(
            data.user,
            data.workspace,
            user?.token,
          );

          // Update state
          set({
            user: userData,
            currentWorkspace: selectedWorkspace,
            isAuthenticated: true,
            isLoading: false,
          });

          // Logging
          logger.log('Auth check successful =>', data);
          logger.log('Current workspace after auth check =>', lastWorkspaceId);

          return userData;
        } catch (error) {
          logger.log(
            'Auth check failed:',
            error.response?.status || error.message,
          );

          if (error.response?.status === 401) {
            set({
              user: null,
              currentWorkspace: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          throw error;
        }
      },

      clearAuth: () => {
        set({
          user: null,
          currentWorkspace: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Workspace Methods
      switchWorkspace: (workspace) => {
        const { isAuthenticated } = get();

        if (!isAuthenticated || !workspace) {
          logger.warn(
            'Cannot switch workspace: not authenticated or invalid workspace',
          );
          return;
        }

        // Update state and persist lastWorkspaceId
        set({
          currentWorkspace: workspace,
          lastWorkspaceId: workspace.id,
        });

        logger.log('Switched to workspace =>', workspace);
        return workspace;
      },

      getCurrentWorkspace: () => {
        return get().currentWorkspace;
      },

      getAvailableWorkspaces: () => {
        const { user } = get();
        // Return the user's workspace object (not an array)
        return user?.workspace || null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastWorkspaceId: state.lastWorkspaceId,
      }),
    },
  ),
);
