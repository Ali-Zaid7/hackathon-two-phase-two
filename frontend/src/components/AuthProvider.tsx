'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authClient } from '@/lib/auth-client';

// Auth context type
interface AuthContextType {
  user: any | null;
  token: string | null;
  loading: boolean;
  authChecked: boolean; // Stable flag: true once initial auth check completes
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
  const [authChecked, setAuthChecked] = useState(false); // Prevents redirect loop
  const checkInProgress = useRef(false); // Prevent concurrent checks

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    // Prevent concurrent session checks
    if (checkInProgress.current) {
      console.log('[AUTH] Session check already in progress, skipping');
      return;
    }

    checkInProgress.current = true;
    console.log('[AUTH] Starting session check...');

    try {
      const session = await authClient.getSession();
      console.log('[AUTH] Session response:', session);

      if (session?.data?.user) {
        setUser(session.data.user);
        // Check for token in localStorage (set during login)
        const storedToken = localStorage.getItem('jwt_token');
        setToken(storedToken);
        console.log('[AUTH] User found in session:', session.data.user.email);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwt_token');
        console.log('[AUTH] No user in session');
      }
    } catch (error) {
      console.error('[AUTH] Error checking session:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    } finally {
      setLoading(false);
      setAuthChecked(true); // Mark auth as checked regardless of result
      checkInProgress.current = false;
      console.log('[AUTH] Session check complete, authChecked=true');
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

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);

        // Request JWT token using Better Auth JWT client method
        try {
          // @ts-ignore - JWT client plugin adds getToken method
          const jwtResponse = await authClient.getToken();
          console.log('[AUTH DEBUG] JWT response:', jwtResponse);

          if (jwtResponse?.data?.token) {
            const jwtToken = jwtResponse.data.token;
            setToken(jwtToken);
            localStorage.setItem('jwt_token', jwtToken);
            console.log('[AUTH DEBUG] JWT token stored in localStorage');
          } else {
            console.warn('[AUTH DEBUG] No JWT token in response');
          }
        } catch (jwtError) {
          console.error('[AUTH DEBUG] Error fetching JWT token:', jwtError);
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

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);

        // Request JWT token using Better Auth JWT client method
        try {
          // @ts-ignore - JWT client plugin adds getToken method
          const jwtResponse = await authClient.getToken();
          console.log('[AUTH DEBUG] JWT response:', jwtResponse);

          if (jwtResponse?.data?.token) {
            const jwtToken = jwtResponse.data.token;
            setToken(jwtToken);
            localStorage.setItem('jwt_token', jwtToken);
            console.log('[AUTH DEBUG] JWT token stored in localStorage');
          } else {
            console.warn('[AUTH DEBUG] No JWT token in response');
          }
        } catch (jwtError) {
          console.error('[AUTH DEBUG] Error fetching JWT token:', jwtError);
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
    authChecked,
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
