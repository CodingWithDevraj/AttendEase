import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Loading overlay component
function LoginLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
      <span className="login-card-loading mb-6"></span>
      <span className="text-white text-lg font-semibold tracking-wide drop-shadow-lg">Loading AttendEase...</span>
    </div>
  );
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call login with an object matching LoginCredentials
      await login({
        identifier: username,
        password,
        role: username.toLowerCase() === 'admin' ? 'admin' : 'staff',
      });

      // If login succeeded (no error), navigate based on role
      if (username.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      {isLoading && <LoginLoadingOverlay />}
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AttendEase</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <UserRound size={20} />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="input pl-10"
              required
              disabled={isLoading}
              autoComplete="username"
              aria-label="Username"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              required
              disabled={isLoading}
              autoComplete="current-password"
              aria-label="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`btn btn-primary w-full flex justify-center items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-90 cursor-not-allowed' : ''
              }`}
            aria-busy={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p className="mt-1">Admin: admin | Password: admin2580</p>
          <p>Staff: dhananjay | Password: dhananjay2580</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
