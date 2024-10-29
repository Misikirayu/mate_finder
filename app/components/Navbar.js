'use client';
import Link from 'next/link';
import { FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ user }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <nav className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mate Finder
            </h2>
          </Link>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <FiSun className="w-5 h-5 text-gray-300" />
              )}
            </button>
            <Link 
              href="/dashboard/profile"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <FiUser className="w-5 h-5" />
              <span className="font-medium">{user?.firstName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 