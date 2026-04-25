import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  cvUrl?: string;
  company?: string;
  bio?: string;
  hourlyRate?: number;
  portfolioUrl?: string;
}

interface ProfileCache {
  [userId: string]: {
    avatarUrl?: string;
    cvUrl?: string;
    company?: string;
    bio?: string;
    hourlyRate?: number;
    portfolioUrl?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  profileCache: ProfileCache;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      profileCache: {},

      login: (incomingUser, token) => {
        // Logout sonrasında user null olur, ama profileCache userId'ye göre kalıcıdır.
        // Login olunca cache'ten avatarUrl ve cvUrl'yi geri yükle.
        const cache = get().profileCache;
        const cachedProfile = cache[incomingUser.id] || {};
        const mergedUser: User = {
          ...incomingUser,
          ...cachedProfile, // avatarUrl ve cvUrl cache'ten gelir
        };
        set({ user: mergedUser, token, isAuthenticated: true });
      },

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        // profileCache intentionally NOT cleared — avatarUrl/cvUrl korunur
      }),

      updateUserProfile: (data) =>
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...data } : null;
          // Aynı zamanda cache'i de güncelle
          const updatedCache = state.user
            ? {
                ...state.profileCache,
                [state.user.id]: {
                  ...state.profileCache[state.user.id],
                  avatarUrl: data.avatarUrl ?? state.profileCache[state.user.id]?.avatarUrl,
                  cvUrl: data.cvUrl ?? state.profileCache[state.user.id]?.cvUrl,
                  company: data.company ?? state.profileCache[state.user.id]?.company,
                  bio: data.bio ?? state.profileCache[state.user.id]?.bio,
                  hourlyRate: data.hourlyRate ?? state.profileCache[state.user.id]?.hourlyRate,
                  portfolioUrl: data.portfolioUrl ?? state.profileCache[state.user.id]?.portfolioUrl,
                },
              }
            : state.profileCache;

          return { user: updatedUser, profileCache: updatedCache };
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
