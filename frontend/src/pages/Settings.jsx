import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Moon, Sun, Shield, LogOut, ChevronRight, Edit2, Save, X, Smartphone } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [profile, setProfile] = useState({ name: 'John Doe', status: 'Available', avatar: 'JD' });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editStatus, setEditStatus] = useState(profile.status);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacy, setPrivacy] = useState({ lastSeen: 'Everyone', profilePhoto: 'Everyone', onlineStatus: 'Everyone', readReceipts: true });
  const [saveMessage, setSaveMessage] = useState('');

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const saveProfile = () => {
    setProfile({ ...profile, name: editName, status: editStatus });
    setIsEditing(false);
    setSaveMessage('✅ Profile updated!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const savePrivacy = () => {
    setShowPrivacy(false);
    setSaveMessage('✅ Privacy saved!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} px-4 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex items-center gap-3`}>
        <button onClick={() => navigate('/')} className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full`}>
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
        </button>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.avatar}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={`w-full px-3 py-1.5 ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg`} />
                  <input type="text" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={`w-full px-3 py-1.5 ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg`} />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save</button>
                    <button onClick={() => { setIsEditing(false); setEditName(profile.name); setEditStatus(profile.status); }} className="px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{profile.name}</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{profile.status}</p>
                  <button onClick={() => setIsEditing(true)} className="mt-1 text-blue-500 text-sm flex items-center gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">{isDark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}<span className={isDark ? 'text-white' : 'text-gray-800'}>Dark Mode</span></div>
          <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${isDark ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        <div onClick={() => setShowPrivacy(!showPrivacy)} className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'} cursor-pointer flex items-center justify-between`}>
          <div className="flex items-center gap-3"><Shield className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /><span className={isDark ? 'text-white' : 'text-gray-800'}>Privacy</span></div>
          <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
        </div>
        {showPrivacy && (
          <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'} space-y-3`}>
            <div className="flex items-center justify-between"><span className={isDark ? 'text-slate-300' : 'text-gray-600'}>Last Seen</span>
              <select value={privacy.lastSeen} onChange={(e) => setPrivacy({...privacy, lastSeen: e.target.value})} className={`px-3 py-1.5 ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg`}>
                <option>Everyone</option><option>Contacts</option><option>Nobody</option>
              </select>
            </div>
            <button onClick={savePrivacy} className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
          </div>
        )}

        <div onClick={() => navigate('/devices')} className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'} cursor-pointer flex items-center justify-between`}>
          <div className="flex items-center gap-3"><Smartphone className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /><span className={isDark ? 'text-white' : 'text-gray-800'}>Device Management</span></div>
          <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
        </div>

        <button onClick={handleLogout} className="w-full p-4 bg-red-600/20 rounded-2xl border border-red-500/30 flex items-center justify-center gap-2 text-red-500 font-medium">
          <LogOut className="w-5 h-5" /> Logout
        </button>

        {saveMessage && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">{saveMessage}</div>}
      </div>
    </div>
  );
}

export default Settings;
