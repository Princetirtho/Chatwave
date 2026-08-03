import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Laptop, Tablet, Monitor, LogOut, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
  query: { deviceId: localStorage.getItem('deviceId') || 'web-' + Date.now() }
});

function DeviceManagement() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const isDark = localStorage.getItem('theme') === 'dark';

  useEffect(() => {
    socket.emit('getDevices');
    socket.on('deviceList', (data) => setDevices(data));
    socket.on('forceLogout', () => { localStorage.removeItem('token'); navigate('/login'); });
    return () => { socket.off('deviceList'); socket.off('forceLogout'); };
  }, []);

  const getDeviceIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone') || lower.includes('iphone') || lower.includes('android')) return <Smartphone className="w-5 h-5" />;
    if (lower.includes('tablet') || lower.includes('ipad')) return <Tablet className="w-5 h-5" />;
    if (lower.includes('laptop') || lower.includes('macbook')) return <Laptop className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} px-4 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex items-center gap-3`}>
        <button onClick={() => navigate('/settings')} className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full`}>
          <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
        </button>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Device Management</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={`${isDark ? 'bg-slate-800/50' : 'bg-white'} rounded-2xl p-4 border ${isDark ? 'border-slate-700/30' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Active Devices</h2>
            <button onClick={() => socket.emit('logoutAllDevices')} className="px-4 py-1.5 bg-red-600/20 text-red-500 rounded-lg text-sm flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Logout All
            </button>
          </div>
          <div className="space-y-3">
            {devices.length === 0 ? <p className={`text-center ${isDark ? 'text-slate-400' : 'text-gray-500'} py-4`}>No active devices</p> : 
              devices.map((device, i) => (
                <div key={i} className={`flex items-center justify-between p-3 ${isDark ? 'bg-slate-700/30' : 'bg-gray-100'} rounded-xl`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${isDark ? 'bg-slate-600' : 'bg-gray-200'} rounded-full`}>{getDeviceIcon(device.deviceName)}</div>
                    <div><p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{device.deviceName}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(device.lastActive).toLocaleString()}</p></div>
                  </div>
                  <button onClick={() => socket.emit('logoutDevice', { deviceId: device.deviceId })} className="p-2 text-red-500 hover:bg-red-500/20 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeviceManagement;
