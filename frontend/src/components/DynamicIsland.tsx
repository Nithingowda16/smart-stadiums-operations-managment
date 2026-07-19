import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Info, X } from 'lucide-react';
import { AlertInfo } from '../types';

interface DynamicIslandProps {
  alerts: AlertInfo[];
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ alerts }) => {
  const [activeAlert, setActiveAlert] = useState<AlertInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Monitor incoming alerts and assign active severity
  useEffect(() => {
    const emergencies = alerts.filter(a => a.type === 'emergency');
    const warnings = alerts.filter(a => a.type === 'warning');
    const infos = alerts.filter(a => a.type === 'info');

    if (emergencies.length > 0) {
      setActiveAlert(emergencies[0]);
    } else if (warnings.length > 0) {
      setActiveAlert(warnings[0]);
    } else if (infos.length > 0) {
      setActiveAlert(infos[0]);
    } else {
      setActiveAlert(null);
    }
  }, [alerts]);

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'emergency':
        return {
          icon: <Shield className="w-3.5 h-3.5 text-red-500 animate-pulse" />,
          dotColor: 'bg-red-500',
          textColor: 'text-red-400',
          titleColor: 'text-red-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-400',
          titleColor: 'text-amber-500'
        };
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-sky-500" />,
          dotColor: 'bg-sky-500',
          textColor: 'text-sky-400',
          titleColor: 'text-sky-500'
        };
    }
  };

  // --- CASE 1: IDLE / SYSTEM ACTIVE STATE ---
  if (!activeAlert) {
    if (!isExpanded) {
      return (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out">
          <button 
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 bg-black hover:scale-105 hover:bg-neutral-900 text-white px-5 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-300 focus:outline-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-gray-300 font-sans">FIFA ONE AI</span>
          </button>
        </div>
      );
    }

    return (
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs px-4 transition-all duration-500 ease-out">
        <div 
          onClick={() => setIsExpanded(false)}
          className="bg-black border border-white/10 shadow-2xl rounded-3xl p-5 flex flex-col space-y-3 cursor-pointer hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-widest text-[#86868b] uppercase">SYSTEM PARAMETERS</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">ONLINE</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight">FIFA World Cup 2026</h4>
            <p className="text-[10px] text-gray-400">Core Telemetry Hub active at 127.0.0.1:8000</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500">
            <span>TAP TO COLLAPSE</span>
            <span>SECURE LINK v1.2</span>
          </div>
        </div>
      </div>
    );
  }

  // --- CASE 2: ACTIVE CRITICAL INCIDENT / ALERT STATE ---
  const alertStyle = getAlertStyles(activeAlert.type);

  if (!isExpanded) {
    return (
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out">
        <button 
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 bg-black hover:scale-105 hover:bg-neutral-900 text-white px-4 py-2 rounded-full border border-red-500/20 shadow-2xl backdrop-blur-md transition-all duration-300 w-60 justify-between focus:outline-none"
        >
          <div className="flex items-center space-x-2 overflow-hidden flex-grow">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${alertStyle.dotColor} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${alertStyle.dotColor}`} />
            </span>
            <span className="text-[10px] font-bold tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
              {activeAlert.title}
            </span>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-1 rounded-full text-xs">
            {alertStyle.icon}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4 md:max-w-md transition-all duration-500 ease-out animate-fadeIn"
    >
      <div 
        onClick={() => setIsExpanded(false)}
        className="bg-black border border-white/15 shadow-2xl rounded-3xl p-5 flex flex-col space-y-4 cursor-pointer hover:scale-[1.01] transition-all"
      >

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-full bg-white/10 text-white">
              {alertStyle.icon}
            </div>
            <div>
              <p className="text-[9px] tracking-widest text-[#86868b] font-bold uppercase">Dynamic Island Notification</p>
              <h4 className="text-sm font-bold text-white mt-0.5 tracking-tight">{activeAlert.title}</h4>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border
            ${activeAlert.type === 'emergency' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}
          >
            {activeAlert.type}
          </span>
        </div>

        <div className="pt-3 border-t border-white/5 space-y-3">
          <p className={`text-xs ${alertStyle.textColor} leading-relaxed`}>
            {activeAlert.message}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
            <span>FIFA WORLD CUP SECURITY COMMAND</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveAlert(null);
                setIsExpanded(false);
              }}
              className="hover:text-white flex items-center space-x-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all"
            >
              <X className="w-3 h-3" />
              <span className="font-bold">Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
