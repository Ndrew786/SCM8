
import React, { useState, useEffect } from 'react';

interface LoginPageProps {
  onLogin: (username: string, pass: string) => Promise<void>; // onLogin is now async
  autoLogoutMessage?: string | null;
}

export default function LoginPage({ onLogin, autoLogoutMessage }: LoginPageProps): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentAutoLogoutMessage, setCurrentAutoLogoutMessage] = useState(autoLogoutMessage);
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  useEffect(() => {
    setCurrentAutoLogoutMessage(autoLogoutMessage);
  }, [autoLogoutMessage]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (currentAutoLogoutMessage) setCurrentAutoLogoutMessage(null); 
    if (error) setError(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAutoLogoutMessage) setCurrentAutoLogoutMessage(null); 

    if (username.trim() === '' || password.trim() === '') {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setIsLoggingIn(true);
    try {
      await onLogin(username, password);
      // Success will be handled by App.tsx navigating away or setting currentUser
    } catch (loginErr: any) {
      // Error is set by App.tsx via onLogin if it throws.
      // Set local error for display within the form.
      setError(loginErr.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4">
      <div className="bg-white p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02] duration-300 ease-in-out">
        <div className="text-center mb-10">
          <svg className="mx-auto h-16 w-auto text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25zM12 12.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
          </svg>
          <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Order<span className="text-sky-500">Flow</span>
          </h2>
          <p className="mt-2 text-md text-slate-700">Securely access your order management system.</p>
        </div>
        
        {currentAutoLogoutMessage && (
            <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-700 px-3 py-2.5 rounded-md text-sm flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>{currentAutoLogoutMessage}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-800 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => handleInputChange(setUsername, e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., user"
              disabled={isLoggingIn}
            />
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-semibold text-slate-800 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="e.g., password"
              disabled={isLoggingIn}
            />
          </div>

          {error && !currentAutoLogoutMessage && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2.5 rounded-md text-sm flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
         <p className="mt-8 text-center text-sm text-slate-600">
            For demo purposes, use <strong className="text-slate-800">user</strong> / <strong className="text-slate-800">password</strong> if no other users are set up in the backend.
          </p>
      </div>
    </div>
  );
}
