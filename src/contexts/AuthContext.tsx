import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { mockUsers } from '../data/mockData';

// Export User interface so it can be imported in other files
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'staff';
  department?: string;
}

interface LoginCredentials {
  identifier: string; // This can be either username or email
  password: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  currentUser: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(user => 
          (user.username === credentials.identifier || user.email === credentials.identifier) && 
          user.password === credentials.password &&
          user.role === credentials.role
        );
        
        if (user) {
          setCurrentUser(user as User);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
