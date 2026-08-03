import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, Phone, MoreVertical, User, Check, CheckCheck, Paperclip } from 'lucide-react';
import axios from 'axios';

const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
  query: { 
    deviceId: localStorage.getItem('deviceId') || 'web-' + Date.now(),
    deviceName: 'Web Browser'
  }
});

const dummyUsers = {
  1: { id: 1, name: 'John Doe', avatar: 'JD', status: 'online' },
  2: { id: 2, name: 'Jane Smith', avatar: 'JS', status: 'online' },
  3: { id: 3, name: 'Mike Johnson', avatar: 'MJ', status: 'offline' },
  4: { id: 4, name: 'Sarah Wilson', avatar: 'SW', status: 'online' },
  5: { id: 5, name: 'David Brown', avatar: 'DB', status: 'offline' },
};

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUser = localStorage.getItem('phone') || 'Guest';
  const isDark = localStorage.getItem('theme') === 'dark';

  useEffect(() => {
    const userData = dummyUsers[userId];
    if (userData) setUser(userData);

    socket.emit('userOnline', currentUser);

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing', ({ from }) => {
      if (from === userId) setIsTyping(true);
    });

    socket.on('stopTyping', ({ from }) => {
      if (from === userId) setIsTyping(false);
    });

    socket.on('messageDelivered', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, delivered: true } : msg
      ));
    });

    socket.on('messageRead', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('messageDelivered');
      socket.off('messageRead');
    };
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (e.target.value.length > 0) {
      socket.emit('typing', { receiverId: userId });
      clearTimeout(typingTimeout);
      setTypingTimeout(setTimeout(() => {
        socket.emit('stopTyping', { receiverId: userId });
      }, 1000));
    } else {
      socket.emit('stopTyping', { receiverId: userId });
    }
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const newMsg = {
        id: Date.now().toString(),
        sender: currentUser,
        receiver: userId,
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        delivered: false,
        read: false
      };
      setMessages((prev) => [...prev, newMsg]);
      socket.emit('sendMessage', newMsg);
      socket.emit('stopTyping', { receiverId: userId });
      setInput('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileMsg = {
        id: Date.now().toString(),
        sender: currentUser,
        receiver: userId,
        text: `📎 ${res.data.fileName}`,
        fileUrl: res.data.fileUrl,
        fileType: res.data.fileType,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        delivered: false,
        read: false
      };
      
      setMessages(prev => [...prev, fileMsg]);
      socket.emit('sendMessage', fileMsg);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className={isDark ? 'text-slate-400' : 'text-gray-500'}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} flex flex-col`}>
      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} backdrop-blur-xl px-4 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'} flex items-center justify-between sticky top-0 z-10`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className={`p-1 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
          </button>
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center ${isDark ? 'text-white' : 'text-gray-800'} font-semibold text-sm`}>
              {user.avatar || getInitials(user.name)}
            </div>
            {user.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
            )}
          </div>
          <div>
            <h2 className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>{user.name}</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {isTyping ? '🟢 Typing...' : (user.status === 'online' ? '🟢 Online' : 'Offline')}
            </p>
          </div>
        </div>
        <button className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition`}>
          <MoreVertical className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        {messages.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <User className={`w-12 h-12 ${isDark ? 'text-slate-600' : 'text-gray-400'} mb-2`} />
            <p>No messages yet</p>
            <p className="text-sm">Say hello to {user.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                msg.sender === currentUser
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : isDark ? 'bg-slate-700/70 text-white rounded-bl-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.fileUrl ? (
                  <div>
                    {msg.fileType?.startsWith('image/') ? (
                      <img src={msg.fileUrl} alt="file" className="max-w-full rounded-lg max-h-60" />
                    ) : msg.fileType?.startsWith('video/') ? (
                      <video controls className="max-w-full rounded-lg max-h-60">
                        <source src={msg.fileUrl} type={msg.fileType} />
                      </video>
                    ) : (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">
                        📎 {msg.text}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm break-words">{msg.text}</p>
                )}
                <div className={`flex items-center gap-1 mt-1 ${msg.sender === currentUser ? 'text-blue-200' : isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                  <span className="text-[10px]">{msg.time}</span>
                  {msg.sender === currentUser && (
                    msg.read ? <CheckCheck className="w-3 h-3 text-blue-300" /> :
                    msg.delivered ? <CheckCheck className="w-3 h-3 text-slate-400" /> :
                    <Check className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`${isDark ? 'bg-slate-800/80' : 'bg-white'} backdrop-blur-xl border-t ${isDark ? 'border-slate-700/50' : 'border-gray-200'} p-3 flex items-center gap-2`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,application/pdf"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} rounded-full transition ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2.5 ${isDark ? 'bg-slate-700/50 text-white' : 'bg-gray-100 text-gray-800'} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

export default Chat;
