import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import DeviceManagement from './pages/DeviceManagement';
import Admin from './pages/Admin';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const theme = localStorage.getItem('theme') || 'dark';

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/chat/:userId" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/devices" element={token ? <DeviceManagement /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
