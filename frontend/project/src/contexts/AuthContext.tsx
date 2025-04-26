import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  tokens: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  tokens: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateTokens: (newTokens: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    // Check for existing token and tokens on mount
    const savedToken = localStorage.getItem('token');
    const savedTokens = localStorage.getItem('tokens');

    if (savedTokens) {
      setTokens(parseInt(savedTokens, 10));
    }

    if (savedToken) {
      setToken(savedToken);
      // Fetch user data with token
      fetchUserData(savedToken);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        // Create a user object without overwriting locally stored tokens
        const userWithLocalTokens = {
          ...userData,
          tokens: tokens // Keep the tokens from local state instead of API
        };
        setUser(userWithLocalTokens);
        // Don't update tokens from API response
        // setTokens(userData.tokens || 0); - removed to prevent overwriting local tokens
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      await fetchUserData(data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      await fetchUserData(data.token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setTokens(0);
    localStorage.removeItem('token');
    localStorage.removeItem('tokens'); // Also clear tokens from localStorage on signout
  };

  const updateTokens = (newTokens: number) => {
    setTokens(newTokens);
    localStorage.setItem('tokens', newTokens.toString());
    if (user) {
      setUser({ ...user, tokens: newTokens });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      tokens,
      signIn,
      signUp,
      signOut,
      updateTokens
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}