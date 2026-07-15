import React, { useState, useEffect } from 'react';
import { User, TelemetryData, NavNode } from './types';
import { Navbar } from './components/Navbar';
import { DynamicIsland } from './components/DynamicIsland';
import { Login } from './views/Login';
import { Dashboards } from './views/Dashboards';
import { Sparkles, X, Send } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [nodes, setNodes] = useState<NavNode[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  // Theme & Language states
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState('English');
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeFont: false,
    screenReader: false
  });

  // Active page state for Fan role
  const [activePage, setActivePage] = useState<'dashboard' | 'food' | 'sustainability'>('dashboard');

  // Global Chatbot Drawer states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Welcome to FIFA ONE AI Support. Ask me anything about seat access, concessions, transport, or stadium operations." }
  ]);

  // Sync token from localStorage on boot
  useEffect(() => {
    const savedToken = localStorage.getItem('fifa_one_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    }
    fetchNodes();
  }, []);

  // Sync WebSocket Telemetry or Fallback Polling
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    const connectWebSocket = () => {
      const loc = window.location;
      const wsUrl = loc.protocol === 'https:' 
        ? `wss://${loc.host}/ws` 
        : `ws://${loc.hostname === 'localhost' ? '127.0.0.1' : loc.hostname}:8000/ws`;
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
        console.log("FIFA ONE AI: Telemetry WebSocket link opened.");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTelemetry(data);
      };

      ws.onerror = (e) => {
        console.error("FIFA ONE AI: WebSocket error:", e);
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.warn("FIFA ONE AI: WebSocket closed. Falling back to REST polling.");
        startFallbackPolling();
      };
    };

    const startFallbackPolling = () => {
      fetchTelemetry();
      fallbackInterval = setInterval(fetchTelemetry, 5000);
    };

    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry');
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch (e) {
        console.error("FIFA ONE AI: Failed to poll telemetry:", e);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const fetchProfile = async (jwtToken: string) => {
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.language) setLanguage(data.language);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  };

  const fetchNodes = async () => {
    try {
      const res = await fetch('/api/navigation/nodes');
      if (res.ok) {
        const data = await res.json();
        setNodes(data);
      }
    } catch (e) {
      console.error("Could not fetch navigation nodes:", e);
    }
  };

  const handleLoginSuccess = (accessToken: string, userData: any) => {
    localStorage.setItem('fifa_one_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    if (userData.language) setLanguage(userData.language);
    fetchNodes();
  };

  const handleLogout = () => {
    localStorage.removeItem('fifa_one_token');
    setToken(null);
    setUser(null);
    setIsChatOpen(false);
    setActivePage('dashboard');
  };

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Chat query submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userText = chatQuery;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setChatQuery('');

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, language: language })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.reply }]);

      // Speak AI response if Screen Reader accessibility is active
      if (accessibility.screenReader && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.reply);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Support pipeline busy. Re-state question." }]);
    }
  };

  const handleSendSuggestion = (text: string) => {
    setChatQuery(text);
    setTimeout(() => {
      const btn = document.getElementById('chat-submit-btn');
      if (btn) btn.click();
    }, 100);
  };

  // API triggers
  const triggerEmergency = async (type: string, location: string, severity: string, description: string) => {
    try {
      const res = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ type, location, severity, description })
      });
      return await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  const resolveEmergency = async (eid: number) => {
    try {
      const res = await fetch(`/api/emergency/resolve/${eid}`, {
        method: 'POST',
        headers: { 
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      return await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`min-h-screen pb-16 flex flex-col font-sans transition-all duration-500 relative overflow-hidden
      ${!user 
        ? 'bg-[#f5f5f7] text-[#1d1d1f]' 
        : (accessibility.highContrast 
            ? 'bg-black text-white' 
            : (theme === 'light' ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'bg-[#000000] text-gray-100'))}
      ${accessibility.largeFont ? 'text-lg font-bold' : 'text-sm'}`}
    >
      {/* visionOS background blobs - dark mode only */}
      {user && theme === 'dark' && !accessibility.highContrast && (
        <>
          <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] animate-orb-1 pointer-events-none z-0" />
          <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] animate-orb-2 pointer-events-none z-0" />
        </>
      )}

      {/* Dynamic Island - only visible when logged in */}
      {user && <DynamicIsland alerts={telemetry?.alerts || []} />}

      {user && (
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          language={language}
          onLanguageChange={setLanguage}
          accessibilitySettings={accessibility}
          onAccessibilityChange={setAccessibility}
          connected={wsConnected}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          activePage={activePage}
          onPageChange={setActivePage}
        />
      )}

      <main className="max-w-7xl w-full mx-auto px-6 mt-28 flex-grow relative z-10">
        {user ? (
          <Dashboards 
            user={user} 
            telemetry={telemetry} 
            nodes={nodes}
            onTriggerEmergency={triggerEmergency}
            onResolveEmergency={resolveEmergency}
            language={language}
            accessibility={accessibility}
            theme={theme}
            activePage={activePage}
            onPageChange={setActivePage}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Siri-style Floating AI Assistant Trigger */}
      {user && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 active:scale-95 group border
            ${theme === 'light' 
              ? 'bg-white hover:bg-neutral-50 text-black border-[#d2d2d7]' 
              : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-800'}`}
        >
          <Sparkles className="w-6 h-6 text-blue-400 group-hover:text-blue-300 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white animate-ping" />
        </button>
      )}

      {/* Chatbot Side Drawer Drawer */}
      {isChatOpen && user && (
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] shadow-2xl z-50 flex flex-col transition-all duration-300 border-l backdrop-blur-2xl
          ${theme === 'light' 
            ? 'bg-white/95 border-[#d2d2d7] text-[#1d1d1f]' 
            : 'bg-[#1c1c1e]/95 border-neutral-800 text-white'}`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-sm tracking-tight">FIFA ONE AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-neutral-100' : 'hover:bg-white/10'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialog Log */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : (theme === 'light' ? 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e8e8ed]' : 'bg-[#2c2c2e] text-white')
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Quick Queries */}
          <div className={`px-4 py-3 flex flex-wrap gap-2 border-t ${theme === 'light' ? 'border-[#e8e8ed] bg-[#f5f5f7]/50' : 'border-neutral-800 bg-black/20'}`}>
            {[
              "Where is my seat?", 
              "Request wheelchair route", 
              "Find nearest washroom",
              "Live matches update"
            ].map(suggest => (
              <button
                key={suggest}
                onClick={() => handleSendSuggestion(suggest)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  theme === 'light' 
                    ? 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-100' 
                    : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {suggest}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendChat} className={`p-4 border-t flex items-center space-x-2 ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <input 
              type="text"
              placeholder={`Ask AI in ${language}...`}
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              className={`flex-grow p-2.5 text-xs rounded-xl focus:outline-none transition-all ${
                theme === 'light' 
                  ? 'bg-[#f5f5f7] text-[#1d1d1f] border border-neutral-200 focus:bg-white focus:border-neutral-400' 
                  : 'bg-black/30 text-white border border-neutral-800 focus:border-neutral-700'
              }`}
            />
            <button 
              id="chat-submit-btn"
              type="submit" 
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
