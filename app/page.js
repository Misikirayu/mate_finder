'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaUserFriends, FaBookReader, FaChartLine } from 'react-icons/fa';
import { FiLogIn, FiUserPlus, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from './context/ThemeContext';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex-grow relative">
        {/* Cool Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-700"></div>
          <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px] dark:bg-indigo-700"></div>
          <div className="absolute bottom-0 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px] dark:bg-purple-700"></div>
        </div>

        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-gray-700/20"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <FiSun className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>

        <div className="container py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Find Your Perfect Study Mate
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Connect with students who share your academic goals and interests
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                href="/login"
                className="inline-flex justify-center items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiLogIn className="mr-2" />
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center items-center px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-lg border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiUserPlus className="mr-2" />
                Sign Up
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 dark:border-gray-700/20"
              >
                <div className="flex items-center mb-4">
                  <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white ml-3">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Cool Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mate Finder
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with students who share your academic goals and interests. Find your perfect study partner today!
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contact</h4>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Email:</span> support@matefinder.com
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Hours:</span> Mon-Fri 9:00-17:00
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © {new Date().getFullYear()} Mate Finder. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <FaUserFriends className="w-6 h-6" />,
    title: "Find Study Partners",
    description: "Connect with students in your field and form study groups easily."
  },
  {
    icon: <FaBookReader className="w-6 h-6" />,
    title: "Share Resources",
    description: "Exchange study materials and collaborate on projects efficiently."
  },
  {
    icon: <FaChartLine className="w-6 h-6" />,
    title: "Track Progress",
    description: "Monitor your study sessions and academic achievements together."
  }
];
