'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend, FiUser, FiMessageSquare, FiSmile } from 'react-icons/fi';
import Link from 'next/link';
import io from 'socket.io-client';
import Navbar from '@/app/components/Navbar';

let socket;

const REACTIONS = ['👍', '❤️', '😊', '😂', '😮', '😢', '🙏', '🎉'];

export default function Chat({ params }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [showReactions, setShowReactions] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      router.push('/login');
      return;
    }

    setCurrentUser(userData);
    const token = localStorage.getItem('token');
    
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3000', {
        transports: ['websocket'],
        upgrade: false
      });
      socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('join-chat', userData.id);
      });

      socket.on('receive-message', (message) => {
        console.log('Received message:', message);
        if (
          (message.sender_id === parseInt(params.userId) && message.receiver_id === userData.id) ||
          (message.sender_id === userData.id && message.receiver_id === parseInt(params.userId))
        ) {
          setMessages(prevMessages => {
            const messageExists = prevMessages.some(m => 
              m.id === message.id || 
              (m.content === message.content && 
               m.sender_id === message.sender_id && 
               m.created_at === message.created_at)
            );
            
            if (!messageExists) {
              return [...prevMessages, message];
            }
            return prevMessages;
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socket.on('message-reaction', ({ messageId, reaction }) => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, reaction } : msg
          )
        );
      });
    }

    fetchOtherUser(token, params.userId);
    fetchMessages(token, params.userId);

    // Set up interval to periodically fetch new messages
    const interval = setInterval(() => {
      fetchMessages(token, params.userId);
    }, 3000); // Check every 3 seconds

    // Cleanup function
    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.off('receive-message');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('message-reaction');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [params.userId, router]);

  useEffect(() => {
    const markMessagesAsSeen = async () => {
      if (!currentUser || !params.userId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages/seen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: params.userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark messages as seen');
        }

        const data = await response.json();
        
        // Update the unread counts in the parent component
        setUnreadCounts(data.unreadCounts || {});

        // Emit socket event to notify the sender
        if (socketRef.current) {
          socketRef.current.emit('messages-seen', {
            senderId: params.userId,
            receiverId: currentUser.id
          });
        }
      } catch (error) {
        console.error('Error marking messages as seen:', error);
      }
    };

    // Call markMessagesAsSeen when the component mounts or when messages change
    markMessagesAsSeen();

    // Set up an interval to periodically mark messages as seen
    const interval = setInterval(markMessagesAsSeen, 5000);

    return () => clearInterval(interval);
  }, [currentUser, params.userId, messages]);

  const fetchOtherUser = async (token, userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();
      setOtherUser(data.user);
    } catch (err) {
      setError('Failed to load user information');
    }
  };

  const fetchMessages = async (token, userId) => {
    try {
      const response = await fetch(`/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      setMessages(data.messages);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: parseInt(params.userId),
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add message to local state immediately
      setMessages(prevMessages => [...prevMessages, data.data]);
      
      // Emit through socket
      if (socketRef.current) {
        socketRef.current.emit('send-message', data.data);
      }
      
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending reaction:', { messageId, emoji });

      const response = await fetch('/api/messages/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messageId: messageId,
          reaction: emoji,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      const data = await response.json();
      console.log('Reaction response:', data);

      // Update local message state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, reaction: emoji } : msg
        )
      );

      // Emit socket event for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('message-reaction', { messageId, reaction: emoji });
      }

      // Close reaction picker
      setShowReactions(null);

    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Cool Loading Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-full h-full border-8 border-blue-200 dark:border-blue-900 rounded-full animate-ping"></div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-full h-full border-8 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FiMessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-gray-600 dark:text-gray-300 text-lg font-medium"
          >
            Loading chat...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2"
          >
            Connecting with your study mate
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden">
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  className="flex items-center text-white hover:text-blue-100 transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Back
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">
                      {otherUser?.firstName} {otherUser?.lastName}
                    </h2>
                    <p className="text-sm text-blue-100">
                      {otherUser?.studyInterests?.split(',')[0] || 'Study Mate'}
                    </p>
                  </div>
                </div>
                <div className="w-6" /> {/* Spacer for alignment */}
              </div>
            </div>

            {/* Messages Container */}
            <div className="h-[70vh] overflow-y-auto scrollbar-hide p-6 bg-gradient-to-b from-white/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-900/50 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                  } w-full`}
                >
                  {message.sender_id !== currentUser.id && (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-2">
                      <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="relative group">
                    <div
                      className={`max-w-[800px] rounded-2xl p-4 ${
                        message.sender_id === currentUser.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <p className={`text-xs ${
                          message.sender_id === currentUser.id
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </p>
                        {message.sender_id === currentUser.id && (
                          <span className={`text-xs ${
                            message.seen 
                              ? 'text-blue-100' 
                              : 'text-blue-200/60'
                          }`}>
                            {message.seen ? '• Seen' : '• Sent'}
                          </span>
                        )}
                      </div>
                      {message.reaction && (
                        <div className="absolute -bottom-6 right-0 text-lg">
                          {message.reaction}
                        </div>
                      )}
                    </div>
                    
                    {/* Reaction Button */}
                    <button
                      onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer z-10"
                    >
                      <FiSmile className="w-5 h-5 text-gray-500 hover:text-blue-500" />
                    </button>

                    {/* Reaction Picker */}
                    {showReactions === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -right-24 -top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2 z-50"
                      >
                        {REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  {message.sender_id === currentUser.id && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center ml-2">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white/90 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-8 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:text-white dark:placeholder-gray-400"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 shadow-md hover:shadow-lg"
                >
                  <FiSend className="w-5 h-5" />
                  <span className="hidden md:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
