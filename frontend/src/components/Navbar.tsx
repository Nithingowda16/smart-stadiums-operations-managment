import React, { useState } from 'react';
import { User } from '../types';
import { Globe, Accessibility, LogOut, Radio, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  accessibilitySettings: {
    highContrast: boolean;
    largeFont: boolean;
    screenReader: boolean;
  };
  onAccessibilityChange: (settings: any) => void;
  connected: boolean;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  activePage: 'dashboard' | 'food' | 'sustainability';
  onPageChange: (page: 'dashboard' | 'food' | 'sustainability') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  language,
  onLanguageChange,
  accessibilitySettings,
  onAccessibilityChange,
  connected,
  theme,
  onThemeToggle,
  activePage,
  onPageChange
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  const languages = ["English", "Spanish", "French", "Arabic", "Hindi", "Portuguese", "German", "Italian", "Japanese", "Korean", "Chinese"];

  return (
    <nav className={`w-full px-6 py-4 flex items-center justify-between shadow-md fixed top-0 z-40 border-b rounded-b-2xl transition-all duration-500
      ${accessibilitySettings.highContrast
        ? 'bg-black border-white border-b-4 text-white'
        : (theme === 'light' 
            ? 'bg-white/80 border-[#e8e8ed] text-[#1d1d1f] backdrop-blur-md shadow-[0_1px_10px_rgba(0,0,0,0.02)]' 
            : 'bg-black/60 border-white/10 text-white backdrop-blur-md')}`}
    >
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-md 
          ${theme === 'light' ? 'bg-[#000000] text-white' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'}`}
        >
          ⚽
        </div>
        <div>
          <h1 className={`text-md font-bold tracking-tight text-display flex items-center space-x-1.5 
            ${theme === 'light' ? 'text-black' : 'text-white'}`}
          >
            <span>FIFA ONE AI</span>
            <span className="text-[9px] bg-blue-500/20 text-blue-500 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-bold">2026</span>
          </h1>
          <p className="text-[9px] text-[#86868b] uppercase tracking-widest">One Identity. One Stadium. One AI.</p>
        </div>
      </div>

      {/* Middle Navigation / Status */}
      {user && user.role === 'Fan' ? (
        <div className={`hidden lg:flex p-1 rounded-full border transition-all duration-300
          ${theme === 'light' ? 'bg-[#e3e3e9]/60 border-neutral-300/40' : 'bg-neutral-900/60 border-neutral-800'}`}
        >
          <button 
            onClick={() => onPageChange('dashboard')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
              ${activePage === 'dashboard'
                ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
                : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
          >
            OS Hub
          </button>
          <button 
            onClick={() => onPageChange('food')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
              ${activePage === 'food'
                ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
                : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
          >
            Express Dining
          </button>
          <button 
            onClick={() => onPageChange('sustainability')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
              ${activePage === 'sustainability'
                ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
                : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
          >
            Stadium Green Index
          </button>
        </div>
      ) : (
        <div className={`hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full border
          ${theme === 'light' ? 'bg-neutral-100 border-[#e8e8ed]' : 'bg-black/40 border-white/5'}`}
        >
          <Radio className={`w-3.5 h-3.5 ${connected ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
          <span className={`text-[10px] font-semibold ${theme === 'light' ? 'text-[#1d1d1f]' : 'text-gray-300'}`}>
            {connected ? 'STADIUM LINK ONLINE' : 'DISCONNECTED'}
          </span>
        </div>
      )}

      {/* Right Side Options */}
      <div className="flex items-center space-x-3">
        
        {/* Light/Dark Mode Switcher */}
        {!accessibilitySettings.highContrast && (
          <button 
            onClick={onThemeToggle}
            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-neutral-100 text-neutral-600' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        )}

        {/* Language selector */}
        <div className="relative">
          <button 
            onClick={() => { setLangOpen(!langOpen); setAccessOpen(false); }}
            className={`p-2 rounded-full transition-colors flex items-center space-x-1.5 ${theme === 'light' ? 'hover:bg-neutral-100 text-[#1d1d1f]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
            title="Translate Portal"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">{language}</span>
          </button>
          
          {langOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-2xl z-50 border max-h-64 overflow-y-auto
              ${theme === 'light' ? 'bg-white border-[#d2d2d7] text-black' : 'bg-[#0d0f17]/95 border-white/10 text-white'}`}
            >
              <p className="text-[10px] text-[#86868b] px-3 py-1 font-bold uppercase tracking-wider">Select Language</p>
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => { onLanguageChange(l); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors
                    ${language === l 
                      ? 'text-blue-500 font-bold bg-blue-500/10' 
                      : (theme === 'light' ? 'text-neutral-700 hover:bg-neutral-100' : 'text-gray-300 hover:bg-white/5')}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accessibility controls */}
        <div className="relative">
          <button 
            onClick={() => { setAccessOpen(!accessOpen); setLangOpen(false); }}
            className={`p-2 rounded-full transition-colors flex items-center space-x-1 ${theme === 'light' ? 'hover:bg-neutral-100 text-[#1d1d1f]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
            title="Accessibility Settings"
          >
            <Accessibility className="w-4 h-4" />
          </button>
          
          {accessOpen && (
            <div className={`absolute right-0 mt-2 w-64 rounded-2xl p-4 shadow-2xl z-50 border
              ${theme === 'light' ? 'bg-white border-[#d2d2d7] text-black' : 'bg-[#0d0f17]/95 border-white/10 text-white'}`}
            >
              <h4 className="text-xs font-bold mb-3 uppercase tracking-wider">Accessibility Controls</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>High Contrast Theme</span>
                  <input 
                    type="checkbox"
                    checked={accessibilitySettings.highContrast}
                    onChange={(e) => onAccessibilityChange({ ...accessibilitySettings, highContrast: e.target.checked })}
                    className="accent-blue-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Large Text Magnifier</span>
                  <input 
                    type="checkbox"
                    checked={accessibilitySettings.largeFont}
                    onChange={(e) => onAccessibilityChange({ ...accessibilitySettings, largeFont: e.target.checked })}
                    className="accent-blue-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Screen Reader Audio Cues</span>
                  <input 
                    type="checkbox"
                    checked={accessibilitySettings.screenReader}
                    onChange={(e) => onAccessibilityChange({ ...accessibilitySettings, screenReader: e.target.checked })}
                    className="accent-blue-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Dedicated logout button & Profile card */}
        {user && (
          <div className={`flex items-center space-x-3 pl-3 border-l ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-white/10'}`}>
            <div className="text-right hidden sm:block">
              <p className={`text-xs font-bold leading-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{user.name}</p>
              <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider mt-0.5">{user.role}</p>
            </div>
            
            <button 
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
