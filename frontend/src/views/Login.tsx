import React, { useState } from 'react';
import { Sparkles, Smile, Phone, Mail, Lock, User as UserIcon } from 'lucide-react';
import { API_BASE } from '../config';

interface LoginProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Fan'); // Default Fan
  const [accessibility, setAccessibility] = useState('None');
  
  // Face ID mock states
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const roles = [
    "Fan", "Volunteer", "Organizer", "Venue Staff", 
    "Security Officer", "Medical Staff", "Transport Staff", 
    "Food Vendor", "Cleaning Staff", "Media", "Admin"
  ];

  const extractErrorMessage = (data: any): string => {
    if (!data || !data.detail) {
      return 'Authentication failed. Please verify credentials.';
    }
    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail)) {
      return data.detail.map((err: any) => {
        const field = err.loc ? err.loc.join('.') : 'field';
        return `${field}: ${err.msg}`;
      }).join(' | ');
    }
    return JSON.stringify(data.detail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = isRegister ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;
    const payload = isRegister 
      ? { name, email, phone, password, role, accessibility_requirement: accessibility }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.status === 502 || res.status === 504 || res.status === 503) {
        throw new Error('Backend server is offline. Please close active terminals and run ./run.bat again.');
      }
      
      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        throw new Error('Connection refused. Please ensure the backend is running and you restarted run.bat.');
      }

      if (data && (data.error || (typeof data.error === 'string' && data.error.includes('ECONNREFUSED')))) {
        throw new Error('Backend server is offline. Please close active terminals and run ./run.bat again.');
      }
      
      if (!res.ok) {
        const msg = extractErrorMessage(data);
        throw new Error(msg);
      }

      if (isRegister) {
        setIsRegister(false);
        setScanStatus('Registration successful! Please sign in using your credentials.');
      } else {
        onLoginSuccess(data.access_token, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Server connection failure.');
    } finally {
      setLoading(false);
    }
  };

  // Face ID simulation
  const handleFaceIDScan = () => {
    setScanning(true);
    setScanStatus('Positioning camera... Align face inside indicator');
    
    setTimeout(() => {
      setScanStatus('Analyzing facial structure (Neural Engine Core v1.4)...');
      setTimeout(async () => {
        setScanning(false);
        setScanStatus('Biometric Match Verified: 100%');
        
        setLoading(true);
        try {
          const targetEmail = `${role.toLowerCase().replace(' ', '')}@fifa.one`;
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail, password: 'password123' })
          });
          
          if (res.status === 502 || res.status === 504 || res.status === 503) {
            throw new Error('Backend server is offline. Please close active terminals and run ./run.bat again.');
          }

          let data: any = {};
          try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
          } catch (jsonErr) {
            throw new Error('Biometric gateway connection lost. Verify backend is running.');
          }

          if (data && (data.error || (typeof data.error === 'string' && data.error.includes('ECONNREFUSED')))) {
            throw new Error('Backend server is offline. Please close active terminals and run ./run.bat again.');
          }

          if (res.ok) {
            onLoginSuccess(data.access_token, data.user);
          } else {
            const msg = extractErrorMessage(data);
            setError(msg);
          }
        } catch (err: any) {
          setError(err.message || 'Biometric authentication pipeline failure');
        } finally {
          setLoading(false);
        }
      }, 1500);
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert("PASSWORD RECOVERY: Pre-seeded accounts use default password 'password123'. If you registered a new user, please re-register or use manual credentials.");
  };

  return (
    <div className="min-h-[82vh] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
      
      {/* LEFT COLUMN: Animated Vector Soccer Ball & Telemetry Orbits */}
      <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 px-4 md:px-8">
        
        {/* Animated Soccer ball & Player wrapper */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mx-auto lg:mx-0">
          <svg viewBox="0 0 100 100" className="w-full h-full select-none animate-float-ball">
            {/* Concentric Orbits (AI Flow Streams) */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0, 102, 204, 0.15)" strokeWidth="0.6" strokeDasharray="6,4" className="animate-rotate-ball" />
            <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(0, 102, 204, 0.25)" strokeWidth="0.8" strokeDasharray="18,6" className="animate-rotate-ball" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
            
            {/* Spinning Soccer Ball asset */}
            <g className="animate-rotate-ball" style={{ transformOrigin: '50px 50px', animationDuration: '25s' }}>
              {/* White leather background sphere */}
              <circle cx="50" cy="50" r="28" fill="#ffffff" stroke="#1d1d1f" strokeWidth="1.2" />
              
              {/* Pentagons & Stitching geometry */}
              <polygon points="50,42 58,48 55,58 45,58 42,48" fill="#1d1d1f" />
              
              <polygon points="50,22 54,26 46,26" fill="#1d1d1f" />
              <line x1="50" y1="22" x2="50" y2="42" stroke="#1d1d1f" strokeWidth="0.8" />
              
              <polygon points="69,63 65,66 68,71" fill="#1d1d1f" />
              <line x1="69" y1="63" x2="55" y2="58" stroke="#1d1d1f" strokeWidth="0.8" />
              
              <polygon points="31,63 35,66 32,71" fill="#1d1d1f" />
              <line x1="31" y1="63" x2="45" y2="58" stroke="#1d1d1f" strokeWidth="0.8" />
              
              <polygon points="76,38 73,42 77,46" fill="#1d1d1f" />
              <line x1="76" y1="38" x2="58" y2="48" stroke="#1d1d1f" strokeWidth="0.8" />
              
              <polygon points="24,38 27,42 23,46" fill="#1d1d1f" />
              <line x1="24" y1="38" x2="42" y2="48" stroke="#1d1d1f" strokeWidth="0.8" />
              
              <line x1="54" y1="26" x2="58" y2="48" stroke="#1d1d1f" strokeWidth="0.8" />
              <line x1="46" y1="26" x2="42" y2="48" stroke="#1d1d1f" strokeWidth="0.8" />
              <line x1="73" y1="42" x2="69" y2="63" stroke="#1d1d1f" strokeWidth="0.8" />
              <line x1="27" y1="42" x2="31" y2="63" stroke="#1d1d1f" strokeWidth="0.8" />
              <line x1="65" y1="66" x2="55" y2="78" stroke="#1d1d1f" strokeWidth="0.8" />
              <line x1="35" y1="66" x2="45" y2="78" stroke="#1d1d1f" strokeWidth="0.8" />
              <polygon points="50,78 46,75 54,75" fill="#1d1d1f" />
              <line x1="50" y1="78" x2="50" y2="58" stroke="#1d1d1f" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Text descriptions matching Apple marketing */}
        <div className="space-y-4 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-sans">
            FIFA ONE AI
          </h1>
          <p className="text-lg font-medium text-blue-400 leading-tight">
            One Identity. One Stadium. One AI.
          </p>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
            Welcome to the smart stadium operating system for the FIFA World Cup 2026. Securely authenticate your stadium pass to experience real-time wayfinding, instant AI translations, accessibility routing, and live operations command.
          </p>
        </div>


      </div>

      {/* RIGHT COLUMN: Frosted White Apple Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-4">
        
        <div className="w-full max-w-md bg-white border border-[#d2d2d7] rounded-3xl p-8 shadow-[0_24px_50px_rgba(0,0,0,0.06)] relative overflow-hidden">
          
          {/* Biometrics Light Scanner Overlay */}
          {scanning && (
            <div className="absolute inset-0 bg-[#f5f5f7]/95 backdrop-blur-md rounded-3xl z-50 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="w-40 h-40 rounded-full border-4 border-dashed border-[#0066cc]/40 animate-spin flex items-center justify-center relative">
                <Smile className="w-16 h-16 text-[#0066cc] animate-pulse" />
                <div className="absolute inset-0 border border-[#0066cc]/10 rounded-full scale-105" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f] mt-8">FaceID Identification</h3>
              <p className="text-xs text-[#0066cc] mt-2 font-mono">{scanStatus}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Sign In</h3>
            <p className="text-xs text-[#86868b] mt-1">Access your personalized stadium operational command</p>
          </div>

          {/* Segmented Controller Tab Selector */}
          <div className="flex bg-[#e8e8ed] p-1 rounded-full mb-6">
            <button 
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${!isRegister ? 'bg-white text-black shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${isRegister ? 'bg-white text-black shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
            >
              Register Pass
            </button>
          </div>

          {/* Alert logs */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl mb-4 leading-relaxed font-semibold">
              {error}
            </div>
          )}
          {scanStatus && !scanning && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-2xl mb-4 leading-relaxed font-semibold">
              {scanStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    id="register-fullname"
                    aria-label="Full Name"
                    placeholder="Full Name" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-sm px-10 py-3 rounded-2xl text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:border-[#86868b] focus:bg-white transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    id="register-phone"
                    aria-label="Phone Number"
                    placeholder="Phone Number" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-sm px-10 py-3 rounded-2xl text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:border-[#86868b] focus:bg-white transition-all"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                id="login-email"
                aria-label="Email Address"
                placeholder="Email Address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-sm px-10 py-3 rounded-2xl text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:border-[#86868b] focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="password" 
                id="login-password"
                aria-label="Password"
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-sm px-10 py-3 rounded-2xl text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:border-[#86868b] focus:bg-white transition-all"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="login-role-select" className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target Portal</label>
                <select 
                  id="login-role-select"
                  aria-label="Target Portal Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-2xl text-xs text-[#1d1d1f] p-3 focus:outline-none focus:border-[#86868b] focus:bg-white"
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <div>
                <label htmlFor="login-access-select" className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Accessibility</label>
                <select 
                  id="login-access-select"
                  aria-label="Accessibility Requirements"
                  value={accessibility}
                  onChange={(e) => setAccessibility(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-2xl text-xs text-[#1d1d1f] p-3 focus:outline-none focus:border-[#86868b] focus:bg-white"
                >
                  <option value="None">None (Standard)</option>
                  <option value="Wheelchair">Wheelchair / Ramp</option>
                  <option value="Visual">Visual Assist</option>
                  <option value="Hearing">Hearing / Caption</option>
                </select>
              </div>
            </div>

            {/* Apple Primary Solid Black Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#000000] hover:bg-[#1d1d1f] text-white text-sm font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying pass authentication...' : (isRegister ? 'Initialize Pass' : 'Enter Stadium OS')}
            </button>
          </form>

          {/* Apple Secondary Biometrics Button */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col space-y-3">
            <button
              type="button"
              onClick={handleFaceIDScan}
              className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] border border-[#d2d2d7]/50 text-xs text-[#0066cc] hover:text-[#0044aa] font-semibold py-3 rounded-2xl flex items-center justify-center space-x-2 transition-all"
            >
              <Smile className="w-4 h-4 text-[#0066cc]" />
              <span>Sign in with Simulated FaceID</span>
            </button>

            {!isRegister && (
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[10px] text-gray-500 hover:text-black transition-colors mx-auto"
              >
                Forgot/Reset Password?
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
