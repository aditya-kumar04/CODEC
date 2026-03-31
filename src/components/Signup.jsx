import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Signup = ({ onSignup }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password validation states
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  // Check password conditions
  const checkPasswordConditions = (password) => {
    setPasswordConditions({
      length: password.length >= 8,
      uppercase: (password.match(/[A-Z]/g) || []).length >= 2,
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordConditions(newPassword);
  };

  const handleGoogleClick = () => {
    // Simple Google OAuth using popup approach
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setErrors({ google: 'Google Client ID not configured' });
      return;
    }

    // Open Google OAuth in popup
    const authUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=token&scope=email profile`;

    try {
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');

      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // For demo, simulate successful Google login
          setTimeout(() => {
            onSignup({
              email: 'user@gmail.com',
              name: 'Google User',
              picture: '',
              role: 'user',
              provider: 'google'
            });
          }, 500);
        }
      }, 1000);

      // Auto-close after 2 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
      }, 120000);

    } catch (error) {
      setErrors({ google: 'Failed to open Google sign-in popup' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push('at least 8 characters');
      if ((password.match(/[A-Z]/g) || []).length < 2) passwordErrors.push('at least 2 uppercase letters');
      if (!password.match(/[0-9]/)) passwordErrors.push('at least 1 number');
      if (!password.match(/[!@#$%^&*(),.?":{}|<>]/)) passwordErrors.push('at least 1 special character');

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch('http://localhost:5050/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ general: data?.message || 'Registration failed' });
        return;
      }
      localStorage.setItem('codec_token', data.token);
      localStorage.setItem('codec_user', JSON.stringify(data.user));
      if (onSignup) onSignup(data.user);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="animate-fade-in-down">
            <h1 className="text-5xl font-bold mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-lg">
              CODEC
            </h1>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-gray-400">
              Create your account to get started
            </p>
          </div>
        </div>

        <div className="animate-fade-in animation-delay-400">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`
                    w-full pl-10 pr-3 py-3 rounded-lg border backdrop-blur-md transition-all duration-300
                    bg-white/5 border-white/10 text-white placeholder-gray-500
                    focus:outline-none focus:ring-0 focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                    hover:bg-white/10
                    ${errors.name ? 'border-red-400/50 focus:border-red-400/50 focus:shadow-[0_0_15px_rgba(248,113,113,0.1)]' : ''}
                  `}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full pl-10 pr-3 py-3 rounded-lg border backdrop-blur-md transition-all duration-300
                    bg-white/5 border-white/10 text-white placeholder-gray-500
                    focus:outline-none focus:ring-0 focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                    hover:bg-white/10
                    ${errors.email ? 'border-red-400/50 focus:border-red-400/50 focus:shadow-[0_0_15px_rgba(248,113,113,0.1)]' : ''}
                  `}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className={`
                    w-full pl-10 pr-10 py-3 rounded-lg border backdrop-blur-md transition-all duration-300
                    bg-white/5 border-white/10 text-white placeholder-gray-500
                    focus:outline-none focus:ring-0 focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                    hover:bg-white/10
                    ${errors.password ? 'border-red-400/50 focus:border-red-400/50 focus:shadow-[0_0_15px_rgba(248,113,113,0.1)]' : ''}
                  `}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.password}</p>
              )}

              {/* Password Conditions */}
              {password && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordConditions.length
                      ? 'bg-green-400/20 border border-green-400'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      {passwordConditions.length && (
                        <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${passwordConditions.length ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordConditions.uppercase
                      ? 'bg-green-400/20 border border-green-400'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      {passwordConditions.uppercase && (
                        <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${passwordConditions.uppercase ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      At least 2 uppercase letters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordConditions.number
                      ? 'bg-green-400/20 border border-green-400'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      {passwordConditions.number && (
                        <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${passwordConditions.number ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      At least 1 number
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${passwordConditions.special
                      ? 'bg-green-400/20 border border-green-400'
                      : 'bg-white/5 border border-white/10'
                      }`}>
                      {passwordConditions.special && (
                        <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${passwordConditions.special ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      At least 1 special character
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`
                    w-full pl-10 pr-10 py-3 rounded-lg border backdrop-blur-md transition-all duration-200
                    bg-white/5 border-white/10 text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
                    hover:bg-white/10
                    ${errors.confirmPassword ? 'border-red-400/50 focus:ring-red-400/50' : ''}
                  `}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-400 focus:ring-blue-400/50 focus:outline-none mt-1"
                  disabled={isLoading}
                  required
                />
                <span className="ml-2 text-sm text-gray-400">
                  I agree to the{' '}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-400/30">
                <p className="text-sm text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-500 font-medium">{errors.general}</p>
              </div>
            )}

            {/* Google Sign-in Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                bg-white/5 border border-white/10 text-white
                hover:bg-white/10 hover:border-white/20
                focus:outline-none focus:ring-2 focus:ring-blue-400/50
                disabled:opacity-50 disabled:cursor-not-allowed
                transform hover:scale-[1.02] active:scale-[0.98]
                flex items-center justify-center gap-3
              `}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            {errors.google && (
              <p className="text-sm text-red-400 animate-fade-in text-center">{errors.google}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-gray-200 to-gray-400 hover:from-white hover:to-gray-300 text-black font-semibold shadow-lg shadow-white/10 hover:shadow-white/20 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 font-medium hover:from-gray-400 hover:to-gray-600 transition-all"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
