'use client';

import { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { db } from '@/lib/db';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    const user = sessionStorage.getItem('currentUser');
    if (loggedIn === 'true' && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      setError('');
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    setUsername('');
    setPassword('');
  };

  if (isLoggedIn) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">المفتش</h1>
          <p className="text-gray-600">نظام إدارة التفتيش والمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="أدخل اسم المستخدم"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>للتجربة استخدم:</p>
          <p className="font-mono mt-1">admin / admin123</p>
        </div>
      </div>
    </div>
  );
}
