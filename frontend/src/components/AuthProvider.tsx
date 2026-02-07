'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const justAuthenticated = useRef(false); // Prevent checkSession from overwriting fresh login state
  const router = useRouter(); // Add router for consistent navigation

  // Check for existing session on mount
  const checkSession = useCallback(async () => {
    // Prevent concurrent session checks
    // Also skip if we just authenticated (login/register) to avoid race condition
    if (justAuthenticated.current) {
      justAuthenticated.current = false;
      setLoading(false);
      setAuthChecked(true);
      return;
    }
    if (checkInProgress.current) {
      return;
    }

    checkInProgress.current = true;

    try {
      const session = await authClient.getSession();

      if (session?.data?.user) {
        setUser(session.data.user);
        
        // Check for token in localStorage (set during login)
        let storedToken = localStorage.getItem('jwt_token');
        
        // If no stored token but we have a user, try to get a fresh token
        if (!storedToken) {
          try {
            const jwtResponse = await authClient.token();
            if (jwtResponse?.data?.token) {
              storedToken = jwtResponse.data.token;
              setToken(storedToken);
              localStorage.setItem('jwt_token', storedToken);
            }
          } catch (tokenError) {
            console.warn('[AUTH] Could not refresh JWT token:', tokenError);
            // Continue without token - let pages handle the missing token
          }
        } else {
          setToken(storedToken);
        }
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

        // Request JWT token - MANDATORY for API access
        // Better Auth JWT plugin exposes token() method on client
        const jwtResponse = await authClient.token();

        if (!jwtResponse?.data?.token) {
          // JWT token acquisition failed - login cannot proceed
          console.error('[AUTH] JWT token acquisition failed after successful sign-in');
          await authClient.signOut(); // Clean up the session
          return { success: false, error: 'Authentication failed: Could not obtain API token. Please try again.' };
        }

        const jwtToken = jwtResponse.data.token;

        // Set justAuthenticated to prevent checkSession from overwriting our fresh state
        justAuthenticated.current = true;

        setToken(jwtToken);
        localStorage.setItem('jwt_token', jwtToken);
        setUser(userObj);
        setAuthChecked(true); // Mark auth as checked immediately after login

        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      // Clean up any partial state
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
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

        // Request JWT token - MANDATORY for API access
        // Better Auth JWT plugin exposes token() method on client
        const jwtResponse = await authClient.token();

        if (!jwtResponse?.data?.token) {
          // JWT token acquisition failed - registration cannot proceed
          console.error('[AUTH] JWT token acquisition failed after successful registration');
          await authClient.signOut(); // Clean up the session
          return { success: false, error: 'Registration failed: Could not obtain API token. Please try again.' };
        }

        const jwtToken = jwtResponse.data.token;

        // Set justAuthenticated to prevent checkSession from overwriting our fresh state
        justAuthenticated.current = true;

        setToken(jwtToken);
        localStorage.setItem('jwt_token', jwtToken);
        setUser(userObj);
        setAuthChecked(true); // Mark auth as checked immediately after registration

        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      // Clean up any partial state
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
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

    // Validate token structure before parsing
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('[AUTH] Invalid token format - skipping expiry check');
      return;
    }

    try {
      // Parse token expiration from JWT payload
      const payload = JSON.parse(atob(tokenParts[1]));

      // Validate exp field exists and is valid
      if (!payload.exp || typeof payload.exp !== 'number') {
        console.warn('[AUTH] Token missing valid exp field - skipping expiry check');
        return;
      }

      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      // Refresh token 5 minutes (300000ms) before expiration
      const refreshTime = timeUntilExpiry - 300000;

      if (refreshTime > 0) {
        const timerId = setTimeout(async () => {
          try {
            // Better Auth JWT plugin exposes token() method
            const jwtResponse = await authClient.token();
            if (jwtResponse?.data?.token) {
              const newToken = jwtResponse.data.token;
              setToken(newToken);
              localStorage.setItem('jwt_token', newToken);
            } else {
              // Token refresh failed, clear token but let pages handle redirect
              console.warn('[AUTH] Token refresh returned no token');
              localStorage.removeItem('jwt_token');
              setToken(null);
            }
          } catch (error) {
            // Token refresh failed, clear token but let pages handle redirect
            console.warn('[AUTH] Token refresh failed:', error);
            localStorage.removeItem('jwt_token');
            setToken(null);
          }
        }, refreshTime);

        return () => clearTimeout(timerId);
      } else if (timeUntilExpiry < 0) {
        // Token is already expired, attempt immediate refresh
        console.warn('[AUTH] Token expired, attempting refresh');
        (async () => {
          try {
            // Better Auth JWT plugin exposes token() method
            const jwtResponse = await authClient.token();
            if (jwtResponse?.data?.token) {
              const newToken = jwtResponse.data.token;
              setToken(newToken);
              localStorage.setItem('jwt_token', newToken);
            } else {
              // Refresh failed, clear token but let pages handle redirect
              localStorage.removeItem('jwt_token');
              setToken(null);
            }
          } catch {
            // Refresh failed, clear token but let pages handle redirect
            localStorage.removeItem('jwt_token');
            setToken(null);
          }
        })();
      } else {
        // Token expiring soon (within 5 minutes), schedule immediate refresh
        console.warn('[AUTH] Token expiring soon, refreshing now');
        (async () => {
          try {
            // Better Auth JWT plugin exposes token() method
            const jwtResponse = await authClient.token();
            if (jwtResponse?.data?.token) {
              const newToken = jwtResponse.data.token;
              setToken(newToken);
              localStorage.setItem('jwt_token', newToken);
            } else {
              // Refresh failed, clear token but let pages handle redirect
              localStorage.removeItem('jwt_token');
              setToken(null);
            }
          } catch {
            // Refresh failed, clear token but let pages handle redirect
            localStorage.removeItem('jwt_token');
            setToken(null);
          }
        })();
      }
    } catch (error) {
      // Error parsing token - log but don't redirect
      // Let pages handle redirect based on auth state
      console.warn('[AUTH] Error parsing token:', error);
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