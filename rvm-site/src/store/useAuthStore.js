import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  loading: true,

  login: (user, token, keepLoggedIn = true) => {
    if (keepLoggedIn) {
      localStorage.setItem('rvm_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('rvm_token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isLoggedIn: true, loading: false });
  },

  logout: () => {
    localStorage.removeItem('rvm_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('rvm_token');
    sessionStorage.removeItem('user');
    set({ user: null, token: null, isLoggedIn: false, loading: false });
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  },

  initFromStorage: async () => {
    const localToken = localStorage.getItem('rvm_token');
    const sessionToken = sessionStorage.getItem('rvm_token');
    const token = localToken || sessionToken;

    const localUserStr = localStorage.getItem('user');
    const sessionUserStr = sessionStorage.getItem('user');
    const userStr = localUserStr || sessionUserStr;

    if (!token && !userStr) {
      set({ loading: false });
      return;
    }

    if (userStr && (!token || token === 'google_oauth_token')) {
      set({ user: JSON.parse(userStr), token: token || 'google_oauth_token', isLoggedIn: true, loading: false });
      return;
    }

    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (res.data.success) {
        set({ user: res.data.data.user, token, isLoggedIn: true, loading: false });
      } else {
        localStorage.removeItem('rvm_token');
        sessionStorage.removeItem('rvm_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        set({ loading: false });
      }
    } catch (err) {
      localStorage.removeItem('rvm_token');
      sessionStorage.removeItem('rvm_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      set({ loading: false });
    }
  },
}));

export default useAuthStore;
