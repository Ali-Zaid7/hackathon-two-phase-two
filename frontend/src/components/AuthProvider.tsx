'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authClient } from '@/lib/auth-client';

// Better Auth user type
interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Auth response types
interface AuthResponse {
  success: boolean;
  error?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  authChecked: boolean; // Stable flag: true once initial auth check completes
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, name: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  refreshSession: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Prevents redirect loop
  const checkInProgress = useRef(false); // Prevent concurrent checks

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    // Prevent concurrent session checks
    if (checkInProgress.current) {
      return;
    }

    checkInProgress.current = true;

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
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    } finally {
      setLoading(false);
      setAuthChecked(true); // Mark auth as checked regardless of result
      checkInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);

        // Request JWT token using Better Auth JWT client method
        try {
          // @ts-expect-error - JWT client plugin adds getToken method
          const jwtResponse = await authClient.getToken();

          if (jwtResponse?.data?.token) {
            const jwtToken = jwtResponse.data.token;
            setToken(jwtToken);
            localStorage.setItem('jwt_token', jwtToken);
          }
        } catch (jwtError) {
          // JWT token fetch failed, but login succeeded
        }

        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (response?.data?.user) {
        const userObj = response.data.user;
        setUser(userObj);

        // Request JWT token using Better Auth JWT client method
        try {
          // @ts-expect-error - JWT client plugin adds getToken method
          const jwtResponse = await authClient.getToken();

          if (jwtResponse?.data?.token) {
            const jwtToken = jwtResponse.data.token;
            setToken(jwtToken);
            localStorage.setItem('jwt_token', jwtToken);
          }
        } catch (jwtError) {
          // JWT token fetch failed, but registration succeeded
        }

        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      // Logout error - continue with local cleanup
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  // Proactive JWT token refresh (Task 5.6)
  useEffect(() => {
    if (!token || !user) return;

    try {
      // Parse token expiration from JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh token 5 minutes (300000ms) before expiration
      const refreshTime = timeUntilExpiry - 300000;

      if (refreshTime > 0) {
        const timerId = setTimeout(async () => {
          try {
            // @ts-expect-error - JWT client plugin adds getToken method
            const jwtResponse = await authClient.getToken();
            if (jwtResponse?.data?.token) {
              const newToken = jwtResponse.data.token;
              setToken(newToken);
              localStorage.setItem('jwt_token', newToken);
            }
          } catch (error) {
            // Token refresh failed, redirect to login
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
          }
        }, refreshTime);

        return () => clearTimeout(timerId);
      } else {
        // Token already expired or expiring soon, redirect to login
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
      }
    } catch (error) {
      // Error parsing token, likely invalid format
    }
  }, [token, user]);

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
