'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiBook, FiArrowLeft, FiUser, FiInfo, FiBookmark } from 'react-icons/fi';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function UserProfile({ params }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      router.push('/login');
      return;
    }
    setCurrentUser(userData);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile(token, params.id);
  }, [router, params.id]);

  const fetchUserProfile = async (token, userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Cool Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-700"></div>
        <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px] dark:bg-indigo-700"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px] dark:bg-purple-700"></div>
      </div>

      {/* Navbar */}
      <Navbar user={currentUser} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Profile Header */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8 mb-6 border border-white/20 dark:border-gray-700/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                <FiUser className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {user.firstName} {user.lastName}
              </h1>
              <button
                onClick={() => window.location.href = `mailto:${user.email}`}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <FiMail className="w-5 h-5" />
                Contact via Email
              </button>
            </div>
          </div>

          {/* Study Interests Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8 mb-6 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center mb-4">
              <FiBookmark className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Study Interests</h2>
            </div>
            {user.studyInterests ? (
              <div className="flex flex-wrap gap-2">
                {user.studyInterests.split(',').map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No study interests specified</p>
            )}
          </div>

          {/* Bio Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center mb-4">
              <FiInfo className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">About</h2>
            </div>
            {user.bio ? (
              <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap">
                {user.bio}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No bio available</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>
            <Link
              href={`/dashboard/chat/${user.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiMail />
              Start Chat
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
