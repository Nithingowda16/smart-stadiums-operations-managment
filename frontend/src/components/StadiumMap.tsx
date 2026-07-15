import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { NavNode, CrowdSector, EmergencyInfo } from '../types';

interface StadiumMapProps {
  nodes: NavNode[];
  crowdDensities: CrowdSector[];
  activeRoute: any[] | null;
  emergencies: EmergencyInfo[];
  onSelectNode?: (nodeId: string) => void;
  theme?: 'light' | 'dark';
  accessibility?: {
    highContrast: boolean;
    largeFont: boolean;
    screenReader: boolean;
  };
  userLocation?: string;
  destinationNode?: string;
}

export const StadiumMap: React.FC<StadiumMapProps> = ({
  nodes,
  crowdDensities,
  activeRoute,
  emergencies,
  onSelectNode,
  theme,
  accessibility,
  userLocation,
  destinationNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<NavNode | null>(null);

  // Helper to determine sector density color overlay
  const getSectorColor = (sectorName: string) => {
    const mapped = crowdDensities.find(c => sectorName.toLowerCase().includes(c.sector.toLowerCase()) || c.sector.toLowerCase().includes(sectorName.toLowerCase()));
    if (!mapped) return 'fill-blue-500/10 stroke-blue-500/35';
    
    const density = mapped.density;
    if (density >= 85) return 'fill-red-500/40 stroke-red-500 animate-pulse';
    if (density >= 70) return 'fill-amber-500/30 stroke-amber-500';
    return 'fill-emerald-500/15 stroke-emerald-500/35';
  };

  // Node styles based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'gate': return '#3b82f6';
      case 'food': return '#ec4899';
      case 'medical': return '#ef4444';
      case 'washroom': return '#10b981';
      case 'parking': return '#8b5cf6';
      case 'seat': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const isHC = accessibility?.highContrast;

  // Find user and destination nodes
  const userNode = nodes.find(n => n.id === userLocation);
  const destNode = nodes.find(n => n.id === destinationNode);

  return (
    <div className={isHC
      ? "relative bg-black text-white border-4 border-white p-6 flex flex-col h-full w-full"
      : (theme === 'light'
          ? "relative bg-white text-[#1d1d1f] border border-[#e8e8ed] rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full w-full transition-all duration-300"
          : "relative bg-[#1c1c1e]/75 border border-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl flex flex-col h-full w-full transition-all duration-300")}
    >
      <div className={`flex flex-col md:flex-row md:items-center justify-between pb-4 border-b mb-4
        ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-white/5'}`}
      >
        <div>
          <h3 className={`text-lg font-bold text-display flex items-center space-x-2 
            ${theme === 'light' ? 'text-black' : 'text-white'}`}
          >
            <Compass className="w-5 h-5 text-blue-500" />
            <span>FIFA ONE AI • Interactive Stadium Map</span>
          </h3>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-[#86868b]' : 'text-gray-400'}`}>
            Live telemetry sector heatmaps, facility nodes & paths
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <span className={`flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full border
            ${theme === 'light' 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-red-950/40 text-red-400 border-red-500/20'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>Overcrowd (&gt;85%)</span>
          </span>
          <span className={`flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full border
            ${theme === 'light' 
              ? 'bg-amber-50 text-amber-600 border-amber-100' 
              : 'bg-amber-950/40 text-amber-400 border-amber-500/20'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Warning (&gt;70%)</span>
          </span>
          <span className={`flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full border
            ${theme === 'light' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Normal</span>
          </span>
        </div>
      </div>

      <div className={`relative w-full flex-grow aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border
        ${theme === 'light' ? 'bg-[#f5f5f7] border-[#e8e8ed]' : 'bg-black/40 border-white/5'}`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 select-none">
          <defs>
            <radialGradient id="pitchGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#0a0b10" stopOpacity="0.8"/>
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stadium outer boundary ring */}
          <ellipse cx="50" cy="50" rx="46" ry="42" className={`fill-none ${theme === 'light' ? 'stroke-neutral-300' : 'stroke-white/10'}`} strokeWidth="0.5" />
          <ellipse cx="50" cy="50" rx="42" ry="38" className={`fill-none ${theme === 'light' ? 'stroke-neutral-200' : 'stroke-white/5'}`} strokeWidth="0.5" />

          {/* Seating Sectors Heatmap Shapes */}
          <path d="M 12 35 A 40 36 0 0 1 88 35 L 75 42 A 28 24 0 0 0 25 42 Z" 
                className={`transition-colors duration-500 cursor-pointer ${getSectorColor('Section 102')}`}
                onClick={() => onSelectNode?.('sec_102')} />
          <path d="M 88 35 A 40 36 0 0 1 88 65 L 75 58 A 28 24 0 0 0 75 42 Z" 
                className={`transition-colors duration-500 cursor-pointer ${getSectorColor('Section 101')}`}
                onClick={() => onSelectNode?.('sec_101')} />
          <path d="M 88 65 A 40 36 0 0 1 12 65 L 25 58 A 28 24 0 0 0 75 58 Z" 
                className={`transition-colors duration-500 cursor-pointer ${getSectorColor('Section 104')}`}
                onClick={() => onSelectNode?.('sec_104')} />
          <path d="M 12 65 A 40 36 0 0 1 12 35 L 25 42 A 28 24 0 0 0 25 58 Z" 
                className={`transition-colors duration-500 cursor-pointer ${getSectorColor('Section 103')}`}
                onClick={() => onSelectNode?.('sec_103')} />

          {/* Field / Pitch Center */}
          <rect x="35" y="40" width="30" height="20" rx="2" 
                className={theme === 'light' ? 'fill-emerald-500/10 stroke-emerald-500/35' : 'fill-emerald-950/20 stroke-emerald-500/20'} 
                strokeWidth="0.5" />
          <line x1="50" y1="40" x2="50" y2="60" 
                className={theme === 'light' ? 'stroke-emerald-500/30' : 'stroke-emerald-500/20'} 
                strokeWidth="0.5" />
          <circle cx="50" cy="50" r="4" 
                  className={`fill-none ${theme === 'light' ? 'stroke-emerald-500/30' : 'stroke-emerald-500/20'}`} 
                  strokeWidth="0.5" />

          {/* Executive Suite Overlay */}
          <ellipse cx="50" cy="45" rx="10" ry="5" className={`cursor-pointer ${getSectorColor('VIP Box')}`} onClick={() => onSelectNode?.('vip_box')} />

          {/* Active Route Draw */}
          {activeRoute && activeRoute.length > 1 && (
            <>
              <path
                d={`M ${activeRoute.map(n => `${n.x} ${n.y}`).join(' L ')}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
                opacity="0.8"
              />
              <path
                d={`M ${activeRoute.map(n => `${n.x} ${n.y}`).join(' L ')}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="nav-path-animate"
              />
            </>
          )}

          {/* Emergencies */}
          {emergencies.map((emp) => {
            const matchedNode = nodes.find(n => n.label.toLowerCase().includes(emp.location.toLowerCase()) || emp.location.toLowerCase().includes(n.label.toLowerCase()));
            const ex = matchedNode ? matchedNode.x : 50.0;
            const ey = matchedNode ? matchedNode.y : 50.0;
            return (
              <g key={emp.id}>
                <circle cx={ex} cy={ey} r="4" className="fill-red-500/30 pulse-circle" />
                <circle cx={ex} cy={ey} r="1.5" className="fill-red-600" />
              </g>
            );
          })}

          {/* Nodes - Only render start position, destination position, or nodes on the active path! */}
          {nodes
            .filter((node) => {
              const isUser = node.id === userLocation;
              const isDest = node.id === destinationNode;
              const isOnRoute = activeRoute && activeRoute.some((rn) => rn.id === node.id);
              return isUser || isDest || isOnRoute;
            })
            .map((node) => (
              <g 
                key={node.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode?.(node.id)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="1.3"
                  fill={getNodeColor(node.node_type)}
                  className="transition-all duration-300 hover:r-2"
                  stroke={theme === 'light' ? '#ffffff' : 'rgba(255,255,255,0.4)'}
                  strokeWidth="0.2"
                />
              </g>
            ))}

          {/* Glowing user position flag */}
          {userNode && (
            <g>
              <circle cx={userNode.x} cy={userNode.y} r="5" className="fill-blue-500/20 stroke-blue-500/30 animate-pulse pointer-events-none" />
              <circle cx={userNode.x} cy={userNode.y} r="2" className="fill-blue-500 stroke-white pointer-events-none" strokeWidth="0.4" />
              <g transform={`translate(${userNode.x}, ${userNode.y - 4.5})`}>
                <rect x="-7" y="-4.5" width="14" height="5" rx="1.5" className="fill-blue-600 stroke-white/20 shadow-lg" strokeWidth="0.2" />
                <text x="0" y="-1.2" textAnchor="middle" className="fill-white font-black text-[2.8px] font-sans tracking-tight">YOU</text>
              </g>
            </g>
          )}

          {/* Glowing destination position flag */}
          {destNode && destNode.id !== userLocation && (
            <g>
              <circle cx={destNode.x} cy={destNode.y} r="4.5" className="fill-amber-500/20 stroke-amber-500/30 animate-pulse pointer-events-none" />
              <circle cx={destNode.x} cy={destNode.y} r="2" className="fill-amber-500 stroke-white pointer-events-none" strokeWidth="0.4" />
              <g transform={`translate(${destNode.x}, ${destNode.y - 4.5})`}>
                <rect x="-8" y="-4.5" width="16" height="5" rx="1.5" className="fill-amber-600 stroke-white/20 shadow-lg" strokeWidth="0.2" />
                <text x="0" y="-1.2" textAnchor="middle" className="fill-white font-black text-[2.4px] font-sans tracking-tight uppercase">DEST</text>
              </g>
            </g>
          )}
        </svg>

        {/* Hover Tooltip overlay */}
        {hoveredNode && (
          <div className={`absolute bottom-4 left-4 text-[10px] px-3 py-1.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200
            ${theme === 'light' 
              ? 'bg-white/95 border-neutral-200 text-black' 
              : 'bg-black/95 border-white/10 text-white'}`}
          >
            <p className="font-bold">{hoveredNode.label}</p>
            <p className="capitalize text-gray-400 text-[8px] mt-0.5">{hoveredNode.node_type} facility</p>
            <p className="text-[8px] text-blue-500 font-bold mt-1">Capacity Wait: {getDensityPercentage(hoveredNode.label)}</p>
          </div>
        )}
      </div>
    </div>
  );

  function getDensityPercentage(label: string) {
    const matched = crowdDensities.find(c => label.toLowerCase().includes(c.sector.toLowerCase()) || c.sector.toLowerCase().includes(label.toLowerCase()));
    return matched ? `${matched.density}%` : 'Normal';
  }
};
