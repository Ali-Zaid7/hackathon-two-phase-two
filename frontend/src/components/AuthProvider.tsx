'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';

// Auth context type
interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  refreshSession: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setUser(session.data.user);
        // Check for token in localStorage (set during login)
        const storedToken = localStorage.getItem('jwt_token');
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwt_token');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authClient.signIn.email({
        email,
        password,
      });

      console.log('[AUTH DEBUG] Login response:', response);
      console.log('[AUTH DEBUG] User object:', response?.data?.user);
      console.log('[AUTH DEBUG] User ID:', response?.data?.user?.id);
      console.log('[AUTH DEBUG] Token:', response?.data?.token);

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);
        // Token is returned directly in the response
        const sessionToken = response.data.token;
        setToken(sessionToken);
        if (sessionToken) {
          localStorage.setItem('jwt_token', sessionToken);
          console.log('[AUTH DEBUG] Token stored in localStorage');
        } else {
          console.warn('[AUTH DEBUG] No token in response!');
        }
        console.log('[AUTH DEBUG] Login successful, user:', userObj);
        return { success: true };
      }
      console.error('[AUTH DEBUG] No user in response');
      return { success: false, error: 'Invalid credentials' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      console.log('[AUTH DEBUG] Register response:', response);
      console.log('[AUTH DEBUG] User object:', response?.data?.user);
      console.log('[AUTH DEBUG] User ID:', response?.data?.user?.id);
      console.log('[AUTH DEBUG] Token:', response?.data?.token);

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);
        // Token is returned directly in the response
        const sessionToken = response.data.token;
        setToken(sessionToken || null);
        if (sessionToken) {
          localStorage.setItem('jwt_token', sessionToken);
          console.log('[AUTH DEBUG] Token stored in localStorage');
        } else {
          console.warn('[AUTH DEBUG] No token in response!');
        }
        console.log('[AUTH DEBUG] Registration successful, user:', userObj);
        return { success: true };
      }
      console.error('[AUTH DEBUG] No user in response');
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isLoggedIn: !!user,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
