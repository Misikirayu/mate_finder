'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';

import { FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';

import { useState } from 'react';
import { useRouter } from 'next/navigation';





export default function Signup() {

  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically log in the user
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (

    <main className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Cool Background Pattern */}

      <div className="absolute inset-0 z-0">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>

        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-700"></div>

        <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px] dark:bg-indigo-700"></div>

        <div className="absolute bottom-0 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-400 opacity-20 blur-[100px] dark:bg-purple-700"></div>

      </div>



      <div className="flex items-center justify-center min-h-screen relative z-10">

        <motion.div

          initial={{ opacity: 0, y: 20 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5 }}

          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-md w-full mx-4 border border-white/20 dark:border-gray-700/20"

        >

          <Link 

            href="/" 

            className="inline-flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:text-blue-700 dark:hover:text-blue-300"

          >

            <FiArrowLeft className="mr-2" />

            Back to Home

          </Link>



          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">

            Create Account

          </h1>

          

          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (

              <div className="text-red-500 dark:text-red-400 text-center text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">

                {error}

              </div>

            )}



            <div className="grid grid-cols-2 gap-4">

              <div>

                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">

                  First Name

                </label>

                <div className="relative">

                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  <input

                    type="text"

                    id="firstName"

                    onChange={handleChange}

                    value={formData.firstName}

                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:text-white"

                    placeholder="First name"

                  />

                </div>

              </div>



              <div>

                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">

                  Last Name

                </label>

                <div className="relative">

                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  <input

                    type="text"

                    id="lastName"

                    onChange={handleChange}

                    value={formData.lastName}

                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:text-white"

                    placeholder="Last name"

                  />

                </div>

              </div>

            </div>



            <div>

              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">

                Email

              </label>

              <div className="relative">

                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input

                  type="email"

                  id="email"

                  onChange={handleChange}

                  value={formData.email}

                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:text-white"

                  placeholder="Enter your email"

                />

              </div>

            </div>



            <div>

              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">

                Password

              </label>

              <div className="relative">

                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input

                  type="password"

                  id="password"

                  onChange={handleChange}

                  value={formData.password}

                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:text-white"

                  placeholder="Create a password"

                />

              </div>

            </div>



            <button

              type="submit"

              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"

            >

              Sign Up

            </button>

          </form>



          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">

            Already have an account?{' '}

            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">

              Login

            </Link>

          </p>

        </motion.div>

      </div>

    </main>

  );

}


