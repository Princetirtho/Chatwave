import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, User, Settings, LogOut, MoreVertical, Users } from 'lucide-react';

const dummyUsers = [
  { id: 1, name: 'John Doe', status: 'online', avatar: 'JD', lastSeen: 'now' },
  { id: 2, name: 'Jane Smith', status: 'online', avatar: 'JS', lastSeen: 'now' },
  { id: 3, name: 'Mike Johnson', status: 'offline', avatar: 'MJ', lastSeen: '10 min ago' },
  { id: 4, name: 'Sarah Wilson', status: 'online', avatar: 'SW', lastSeen: 'now' },
  { id: 5, name: 'David Brown', status: 'offline', avatar: 'DB', lastSeen: '2 hours ago' },
];

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(dummyUsers);
  const [activeTab, setActiveTab] = useState('chats');
  const navigate = useNavigate();
  const isDark = localStorage.getItem('theme') === 'dark';

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('phone');
    navigate('/login');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} backdrop-blur-xl px-4 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex justify-between items-center sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">CW</span>
          </div>
          <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>ChatWave</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin')} className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} rounded-full transition`}>
            <Users className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
          <button onClick={() => navigate('/settings')} className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} rounded-full transition`}>
            <Settings className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      <div className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-gray-200/50'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-slate-700/50 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'} rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => navigate(`/chat/${user.id}`)}
              className={`flex items-center gap-3 p-3 ${isDark ? 'bg-slate-800/50 hover:bg-slate-700/50 border-slate-700/30' : 'bg-white hover:bg-gray-200/70 border-gray-200'} rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01] border`}
            >
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {user.avatar || getInitials(user.name)}
                </div>
                {user.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.name}</h3>
                  <span className={`text-xs whitespace-nowrap ml-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user.lastSeen}</span>
                </div>
                <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {user.status === 'online' ? '🟢 Online' : 'Offline'}
                </p>
              </div>
              <MoreVertical className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
            </div>
          ))
        ) : (
          <div className={`text-center py-10 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <p>No contacts found</p>
          </div>
        )}
      </div>

      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-xl border-t px-4 py-2 flex justify-around items-center`}>
        <button onClick={() => setActiveTab('chats')} className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${activeTab === 'chats' ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chats</span>
        </button>
        <button onClick={() => navigate('/settings')} className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition ${activeTab === 'settings' ? 'text-blue-500' : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition text-slate-400 hover:text-red-500">
          <LogOut className="w-6 h-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Home;
