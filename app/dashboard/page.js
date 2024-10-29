'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import { FiUser, FiBook, FiCalendar, FiLogOut, FiUsers, FiMail, FiInfo, FiMessageSquare, FiSearch, FiFilter, FiSun, FiMoon } from 'react-icons/fi';

import Link from 'next/link';

import { useTheme } from '../context/ThemeContext';

import Navbar from '@/app/components/Navbar';



export default function Dashboard() {

  const router = useRouter();

  const [user, setUser] = useState(null);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [filterInterest, setFilterInterest] = useState('');

  const [unreadCounts, setUnreadCounts] = useState({});

  const { theme, toggleTheme } = useTheme();





  useEffect(() => {

    const token = localStorage.getItem('token');

    if (!token) {

      router.push('/login');

      return;

    }



    // Get user data from token

    const userData = JSON.parse(localStorage.getItem('user'));

    setUser(userData);

    // Fetch users list

    fetchUsers(token);

    fetchUnreadCounts(token);



    // Set up interval to periodically check for new messages

    const interval = setInterval(() => {

      fetchUnreadCounts(token);

    }, 5000); // Check every 5 seconds



    return () => clearInterval(interval);

  }, [router]);



  const fetchUsers = async (token) => {

    try {

      const response = await fetch('/api/users/list', {

        headers: {

          'Authorization': `Bearer ${token}`,

        },

      });

      if (!response.ok) {

        throw new Error('Failed to fetch users');

      }

      const data = await response.json();

      setUsers(data.users);

    } catch (err) {

      setError('Failed to load users');

      console.error(err);

    } finally {

      setLoading(false);

    }

  };



  const fetchUnreadCounts = async (token) => {

    try {

      const response = await fetch('/api/messages/unread', {

        headers: {

          'Authorization': `Bearer ${token}`,

        },

      });

      if (!response.ok) {

        throw new Error('Failed to fetch unread counts');

      }

      const data = await response.json();

      setUnreadCounts(data.unreadCounts || {});

    } catch (err) {

      console.error('Failed to load unread counts:', err);

    }

  };



  const handleLogout = () => {

    // Clear localStorage

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    // Redirect to home page

    router.push('/');

  };



  const filteredUsers = users.filter(u => {

    const matchesSearch = (

      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||

      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||

      (u.studyInterests && u.studyInterests.toLowerCase().includes(searchTerm.toLowerCase()))

    );

    

    const matchesInterest = !filterInterest || 

      (u.studyInterests && u.studyInterests.toLowerCase().includes(filterInterest.toLowerCase()));

    

    return matchesSearch && matchesInterest;

  });



  // Get unique study interests for filter dropdown

  const allInterests = users

    .map(u => u.studyInterests)

    .filter(Boolean)

    .flatMap(interests => interests.split(',').map(i => i.trim()))

    .filter((value, index, self) => self.indexOf(value) === index);



  if (!user) return null;



  return (

    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Cool Background Pattern */}

      <div className="absolute inset-0 z-0">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>

        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-700"></div>

        <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px] dark:bg-indigo-700"></div>

        <div className="absolute bottom-0 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px] dark:bg-purple-700"></div>

      </div>



      {/* Replace the existing nav with shared Navbar */}

      <Navbar user={user} />



      {/* Dashboard Content */}

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-[calc(100vh-180px)]">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5 }}

        >

          {/* Search and Filter Section */}

          <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20">

            <div className="flex flex-col md:flex-row gap-4">

              <div className="flex-1 relative">

                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input

                  type="text"

                  placeholder="Search by name or interests..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"

                />

              </div>

              <div className="relative">

                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <select

                  value={filterInterest}

                  onChange={(e) => setFilterInterest(e.target.value)}

                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white/80 backdrop-blur-sm"

                >

                  <option value="">All Interests</option>

                  {allInterests.map((interest, index) => (

                    <option key={index} value={interest}>{interest}</option>

                  ))}

                </select>

              </div>

            </div>

          </div>



          {/* Users Grid */}

          {loading ? (

            <div className="text-center py-8">

              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

            </div>

          ) : error ? (

            <div className="text-center text-red-600 py-8">{error}</div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredUsers.map((user) => (

                <motion.div

                  key={user.id}

                  initial={{ opacity: 0, scale: 0.9 }}

                  animate={{ opacity: 1, scale: 1 }}

                  transition={{ duration: 0.3 }}

                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"

                >

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <Link 

                        href={`/dashboard/user/${user.id}`}

                        className="text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"

                      >

                        {user.firstName} {user.lastName}

                      </Link>

                      {user.studyInterests && (

                        <div className="mt-2 flex flex-wrap gap-2">

                          {user.studyInterests.split(',').map((interest, index) => (

                            <span

                              key={index}

                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-sm rounded-full"

                            >

                              {interest.trim()}

                            </span>

                          ))}

                        </div>

                      )}

                    </div>

                  </div>

                  

                  {user.bio && (

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">

                      {user.bio}

                    </p>

                  )}



                  <div className="flex gap-2">

                    <Link

                      href={`/dashboard/user/${user.id}`}

                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"

                    >

                      <FiUser />

                      Profile

                    </Link>

                    <Link

                      href={`/dashboard/chat/${user.id}`}

                      className="flex-1 relative flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"

                    >

                      <FiMessageSquare />

                      Chat

                      {unreadCounts[user.id] > 0 && (

                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">

                          {unreadCounts[user.id]}

                        </span>

                      )}

                    </Link>

                  </div>

                </motion.div>

              ))}

            </div>

          )}



          {filteredUsers.length === 0 && !loading && (

            <div className="text-center py-8 text-gray-600">

              No users found matching your search criteria.

            </div>

          )}

        </motion.div>

      </main>



      {/* Cool Footer */}

      <footer className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">

        <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="space-y-4">

              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">

                Mate Finder

              </h3>

              <p className="text-gray-600">

                Connect with students who share your academic goals and interests. Find your perfect study partner today!

              </p>

            </div>



            <div className="space-y-4">

              <h4 className="text-lg font-semibold text-gray-800">Quick Links</h4>

              <ul className="space-y-2">

                <li>

                  <Link href="/dashboard/profile" className="text-gray-600 hover:text-blue-600 transition-colors">

                    Profile Settings

                  </Link>

                </li>

                <li>

                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">

                    Find Study Mates

                  </Link>

                </li>

                <li>

                  <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors">

                    Help Center

                  </Link>

                </li>

              </ul>

            </div>



            <div className="space-y-4">

              <h4 className="text-lg font-semibold text-gray-800">Contact</h4>

              <div className="space-y-2">

                <p className="text-gray-600">

                  <span className="font-medium">Email:</span> support@matefinder.com

                </p>

                <p className="text-gray-600">

                  <span className="font-medium">Hours:</span> Mon-Fri 9:00-17:00

                </p>

              </div>

            </div>

          </div>



          <div className="mt-8 pt-8 border-t border-gray-200">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">

              <p className="text-gray-600 text-sm">

                © {new Date().getFullYear()} Mate Finder. All rights reserved.

              </p>

              <div className="flex gap-6">

                <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">

                  Privacy Policy

                </Link>

                <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">

                  Terms of Service

                </Link>

                <Link href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">

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


