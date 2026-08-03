import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, LogOut } from 'lucide-react';
import axios from 'axios';

function Admin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalMessages: 0, onlineUsers: 0 });
  const [users, setUsers] = useState([]);
  const isDark = localStorage.getItem('theme') === 'dark';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
        
        const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersRes.data.users);
      } catch (error) {
        console.error('Admin fetch error:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} px-4 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex items-center gap-3`}>
        <button onClick={() => navigate('/')} className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full`}>
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
        </button>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin Panel</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Users</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.totalUsers}</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Messages</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.totalMessages}</p>
          </div>
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Online</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats.onlineUsers}</p>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Users</h2>
          {users.length === 0 ? <p className={`text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No users yet</p> : 
            users.map((user, i) => (
              <div key={i} className={`flex items-center justify-between p-2 ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-gray-100'} rounded-lg`}>
                <span className={isDark ? 'text-white' : 'text-gray-800'}>{user.name || user.phone}</span>
                <span className={`text-sm ${user.status === 'online' ? 'text-green-400' : 'text-slate-400'}`}>{user.status || 'offline'}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default Admin;
