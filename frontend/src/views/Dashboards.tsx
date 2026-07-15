import React, { useState, useEffect } from 'react';
import { User, TelemetryData, NavNode, FoodStand, AuditLogItem } from '../types';
import { StadiumMap } from '../components/StadiumMap';
import { API_BASE } from '../config';
import { 
  ShieldAlert, Shield, Activity, Truck, Lightbulb, Droplets, 
  MapPin, Coffee, Volume2, Users, CheckCircle2,
  FileText, Sparkles, Navigation, RefreshCw
} from 'lucide-react';

interface DashboardsProps {
  user: User;
  telemetry: TelemetryData | null;
  nodes: NavNode[];
  onTriggerEmergency: (type: string, location: string, severity: string, desc: string) => Promise<any>;
  onResolveEmergency: (eid: number) => Promise<any>;
  language: string;
  accessibility: {
    highContrast: boolean;
    largeFont: boolean;
    screenReader: boolean;
  };
  theme: 'light' | 'dark';
  activePage: 'dashboard' | 'food' | 'sustainability';
  onPageChange: (page: 'dashboard' | 'food' | 'sustainability') => void;
}

// Multi-language dictionary for key UI headings and labels
const translations: Record<string, Record<string, string>> = {
  English: {
    stadiumPass: "FIFA STADIUM PASS",
    identity: "FIFA ONE IDENTITY",
    gateEntrance: "Seat Gate Entrance",
    languageLabel: "Preferred Language",
    emergencySOS: "Emergency SOS Button",
    sosDesc: "Press for immediate medical or security dispatch to your seat.",
    liveMatchStats: "Live Match Stats",
    wayfinding: "Smart Wayfinding Navigator",
    calculateRoute: "Plot Route",
    stands: "Arena Food Concessions",
    cartTitle: "Mobile Express Ordering",
    startPoint: "Start Point",
    destination: "Destination",
    wheelchairOption: "Wheelchair accessible route",
    voiceCues: "Voice Guidance Cues",
    dailyTasks: "Daily Tasks",
    advisoryAlerts: "System Advisory Alerts",
    sustainabilityLabel: "Stadium Sustainability Indices",
    electricity: "Electricity Usage",
    water: "Water Flow Speed",
    waste: "Solid Waste Level",
  },
  Spanish: {
    stadiumPass: "PASE DE ESTADIO FIFA",
    identity: "IDENTIDAD FIFA ONE",
    gateEntrance: "Entrada de Puerta",
    languageLabel: "Idioma Preferido",
    emergencySOS: "Botón de Emergencia SOS",
    sosDesc: "Presione para despacho médico o de seguridad inmediato a su asiento.",
    liveMatchStats: "Estadísticas en Vivo",
    wayfinding: "Navegador de Caminos Inteligente",
    calculateRoute: "Trazar Ruta",
    stands: "Concesiones de Comida",
    cartTitle: "Pedido Express Móvil",
    startPoint: "Punto de Inicio",
    destination: "Destino",
    wheelchairOption: "Ruta accesible para sillas de ruedas",
    voiceCues: "Instrucciones de Voz",
    dailyTasks: "Tareas Diarias",
    advisoryAlerts: "Alertas del Sistema",
    sustainabilityLabel: "Índice de Sostenibilidad",
    electricity: "Electricidad Consumida",
    water: "Flujo de Agua",
    waste: "Desechos Sólidos",
  },
  French: {
    stadiumPass: "ACCÈS STADE FIFA",
    identity: "IDENTITÉ FIFA ONE",
    gateEntrance: "Porte d'Entrée du Siège",
    languageLabel: "Langue Préférée",
    emergencySOS: "Bouton d'Urgence SOS",
    sosDesc: "Appuyez pour un déploiement médical ou de sécurité immédiat.",
    liveMatchStats: "Stats du Match en Direct",
    wayfinding: "Navigateur Intelligent",
    calculateRoute: "Calculer l'Itinéraire",
    stands: "Concessions Alimentaires",
    cartTitle: "Commande Express Mobile",
    startPoint: "Point de Départ",
    destination: "Destination",
    wheelchairOption: "Itinéraire adapté aux fauteuils",
    voiceCues: "Guidage Vocal Cues",
    dailyTasks: "Tâches Quotidiennes",
    advisoryAlerts: "Alertes Système",
    sustainabilityLabel: "Indices de Durabilité",
    electricity: "Électricité Consommée",
    water: "Flux d'Eau",
    waste: "Déchets Solides",
  },
  Arabic: {
    stadiumPass: "تذكرة دخول ملعب فيفا",
    identity: "هوية فيفا الموحدة",
    gateEntrance: "بوابة دخول المقعد",
    languageLabel: "اللغة المفضلة",
    emergencySOS: "زر الطوارئ SOS",
    sosDesc: "اضغط للإرسال الفوري لفرق الإنقاذ الطبي أو الأمني إلى مقعدك.",
    liveMatchStats: "إحصائيات المباراة المباشرة",
    wayfinding: "نظام التوجيه الذكي",
    calculateRoute: "تخطيط مسار",
    stands: "منافذ الأطعمة والمشروبات",
    cartTitle: "الطلب السريع عبر الهاتف",
    startPoint: "نقطة البداية",
    destination: "الوجهة",
    wheelchairOption: "مسار مناسب للكراسي المتحركة",
    voiceCues: "توجيهات صوتية",
    dailyTasks: "المهام اليومية",
    advisoryAlerts: "تنبيهات النظام الاستشارية",
    sustainabilityLabel: "مؤشرات الاستدامة للملعب",
    electricity: "استهلاك الكهرباء",
    water: "سرعة تدفق المياه",
    waste: "مستوى النفايات الصلبة",
  }
};

const t = (key: string, lang: string) => {
  const dictionary = translations[lang] || translations['English'];
  return dictionary[key] || translations['English'][key] || key;
};

// Generates styling utilities based on active theme & accessibility parameters
const getThemeClasses = (theme: 'light' | 'dark', highContrast: boolean) => {
  return {
    card: highContrast
      ? "bg-black text-white border-4 border-white p-6 rounded-none shadow-none"
      : (theme === 'light'
          ? "bg-white text-[#1d1d1f] border border-[#e8e8ed] rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-300"
          : "bg-[#1c1c1e]/75 text-white border border-white/[0.08] backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300"),
    input: highContrast
      ? "w-full bg-black text-white border-2 border-white p-2 rounded-none focus:outline-none"
      : (theme === 'light'
          ? "w-full bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] placeholder-gray-400 p-2.5 rounded-xl focus:outline-none focus:bg-white focus:border-[#86868b] transition-all"
          : "w-full bg-black/40 border border-white/10 text-white placeholder-gray-500 p-2.5 rounded-xl focus:outline-none focus:border-white/20 focus:bg-black/60 transition-all"),
    select: highContrast
      ? "w-full bg-black text-white border-2 border-white p-2 rounded-none focus:outline-none"
      : (theme === 'light'
          ? "w-full bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] p-2.5 rounded-xl focus:outline-none focus:border-[#86868b]"
          : "w-full bg-[#0d0f17] border border-white/10 text-white p-2.5 rounded-xl focus:outline-none focus:border-white/20"),
    btn: highContrast
      ? "w-full bg-white text-black font-black border-2 border-white py-3 rounded-none"
      : (theme === 'light'
          ? "w-full bg-black hover:bg-[#1d1d1f] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          : "w-full bg-white hover:bg-[#e8e8ed] text-black text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm active:scale-95"),
    subCard: theme === 'light' ? 'bg-[#f5f5f7] border border-[#e8e8ed]' : 'bg-white/5 border border-white/5',
    subText: theme === 'light' ? 'text-[#86868b]' : 'text-gray-400',
    titleText: theme === 'light' ? 'text-black' : 'text-white'
  };
};

export const Dashboards: React.FC<DashboardsProps> = ({
  user,
  telemetry,
  nodes,
  onTriggerEmergency,
  onResolveEmergency,
  language,
  accessibility,
  theme,
  activePage,
  onPageChange
}) => {
  if (!telemetry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin" />
        <p className="text-sm text-gray-400 font-mono">Synchronizing Stadium Core Telemetry...</p>
      </div>
    );
  }

  // Render dashboard based on role
  switch (user.role) {
    case 'Fan':
      return <FanDashboard user={user} telemetry={telemetry} nodes={nodes} onTriggerEmergency={onTriggerEmergency} language={language} accessibility={accessibility} theme={theme} activePage={activePage} onPageChange={onPageChange} />;
    case 'Volunteer':
      return <VolunteerDashboard user={user} telemetry={telemetry} onTriggerEmergency={onTriggerEmergency} language={language} accessibility={accessibility} theme={theme} />;
    case 'Organizer':
      return <OrganizerDashboard telemetry={telemetry} nodes={nodes} onResolveEmergency={onResolveEmergency} language={language} accessibility={accessibility} theme={theme} />;
    case 'Security Officer':
      return <SecurityDashboard telemetry={telemetry} nodes={nodes} onResolveEmergency={onResolveEmergency} language={language} accessibility={accessibility} theme={theme} />;
    case 'Medical Staff':
      return <MedicalDashboard telemetry={telemetry} nodes={nodes} onResolveEmergency={onResolveEmergency} language={language} accessibility={accessibility} theme={theme} />;
    case 'Transport Staff':
      return <TransportDashboard telemetry={telemetry} language={language} accessibility={accessibility} theme={theme} />;
    case 'Admin':
      return <AdminDashboard telemetry={telemetry} language={language} accessibility={accessibility} theme={theme} />;
    default:
      return <GenericStaffDashboard user={user} telemetry={telemetry} onTriggerEmergency={onTriggerEmergency} language={language} accessibility={accessibility} theme={theme} />;
  }
};

// ==========================================
// 1. FAN PORTAL
// ==========================================
interface SubDashboardProps {
  user: User;
  telemetry: TelemetryData;
  nodes: NavNode[];
  onTriggerEmergency: any;
  language: string;
  accessibility: any;
  theme: 'light' | 'dark';
  activePage: 'dashboard' | 'food' | 'sustainability';
  onPageChange: (page: 'dashboard' | 'food' | 'sustainability') => void;
}

const FanDashboard: React.FC<SubDashboardProps> = ({
  user,
  telemetry,
  nodes,
  onTriggerEmergency,
  language,
  accessibility,
  theme,
  activePage,
  onPageChange
}) => {
  const [startNode, setStartNode] = useState('gate_a');
  const [endNode, setEndNode] = useState('vip_box');
  const [accessible, setAccessible] = useState(false);
  const [route, setRoute] = useState<any[] | null>(null);
  const [directions, setDirections] = useState<string[]>([]);
  const [stands, setStands] = useState<FoodStand[]>([]);
  const [cartStatus, setCartStatus] = useState('');

  // Sub-pages state
  const fanTab = activePage;

  // Food Menu and Active order tracking states
  const [selectedStand, setSelectedStand] = useState<string>('Stadium Burgers & Brew');
  const [activeOrder, setActiveOrder] = useState<{
    stand: string;
    item: string;
    status: 'ordered' | 'preparing' | 'ready';
    progress: number;
  } | null>(null);

  // Fluctuating real-time solar generation tracker
  const [solarGeneration, setSolarGeneration] = useState(245.5);

  const styles = getThemeClasses(theme, accessibility.highContrast);

  useEffect(() => {
    fetch(`${API_BASE}/api/food`)
      .then(res => res.json())
      .then(data => setStands(data))
      .catch(() => {});
  }, []);

  // Update real-time solar generation index
  useEffect(() => {
    if (fanTab !== 'sustainability') return;
    const interval = setInterval(() => {
      setSolarGeneration(prev => Math.min(Math.max(prev + (Math.random() - 0.5) * 5, 220), 280));
    }, 2000);
    return () => clearInterval(interval);
  }, [fanTab]);

  // Simulated order progress tracking
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.progress >= 100) return;

    const interval = setInterval(() => {
      setActiveOrder(prev => {
        if (!prev) return null;
        const nextProgress = prev.progress + 25;
        let nextStatus: 'ordered' | 'preparing' | 'ready' = prev.status;
        if (nextProgress >= 100) {
          nextStatus = 'ready';
        } else if (nextProgress >= 50) {
          nextStatus = 'preparing';
        }
        return {
          ...prev,
          progress: Math.min(nextProgress, 100),
          status: nextStatus
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  const foodMenus: Record<string, Array<{ name: string; price: number; desc: string; icon: string }>> = {
    'Stadium Burgers & Brew': [
      { name: "Double Cheddar Stadium Burger", price: 12.00, desc: "Prime flame-grilled beef, cheddar, signature stadium spread, brioche bun.", icon: "🍔" },
      { name: "Crispy Golden Fries", price: 5.00, desc: "Hand-cut sea salt fries served with truffle mayo dipping cup.", icon: "🍟" },
      { name: "Cold Draft Premium Beer", price: 8.00, desc: "Crisp local Pilsner brewed fresh for match day.", icon: "🍺" },
    ],
    'Tacos Campeón': [
      { name: "Tres Tacos Carne Asada", price: 10.00, desc: "Three flame-charred steak tacos with cilantro, onions, lime.", icon: "🌮" },
      { name: "Fresh Tortilla Chips & Guac", price: 6.00, desc: "Freshly smashed avocado dip with house corn chips.", icon: "🥑" },
      { name: "Match Day Horchata", price: 4.00, desc: "Classic sweet rice milk spiced with cinnamon.", icon: "🥛" },
    ],
    'Pizza Express FIFA': [
      { name: "Prosciutto & Arugula Flatbread", price: 14.00, desc: "Slices of premium prosciutto, fresh baby arugula, shaved parmesan.", icon: "🍕" },
      { name: "Classic Italian Pepperoni Slice", price: 9.00, desc: "A double-sized woodfired slice with spiced pepperoni.", icon: "🍕" },
      { name: "Match Fountain Soda", price: 3.00, desc: "Chilled soda in a collectible FIFA souvenir cup.", icon: "🥤" }
    ]
  };

  const handleCalculateRoute = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/navigation/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_node: startNode, end_node: endNode, accessible_only: accessible })
      });
      const data = await res.json();
      setRoute(data.coordinate_path);
      setDirections(data.voice_instructions);
      
      if (accessibility.screenReader && data.voice_instructions.length > 0 && window.speechSynthesis) {
        const textToSpeak = data.voice_instructions.join('. ');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerMedicalPan = () => {
    onTriggerEmergency("Medical", user.seat || "Section 101", "High", "Emergency beacon fired from Fan Seat Wallet");
    alert("Emergency SOS sent! Medics and nearest stewards are routed to your seat.");
  };

  const triggerExpressOrder = (itemName: string) => {
    setActiveOrder({
      stand: selectedStand,
      item: itemName,
      status: 'ordered',
      progress: 0
    });
  };

  // Determine if the currently selected stand has crowd-related order delay
  const getSelectedStandDelay = () => {
    const standObj = stands.find(s => s.name === selectedStand);
    if (!standObj) return 0;
    // Base wait time + calculated crowd delay from telemetry
    const crowdFactor = telemetry.crowd.find(c => standObj.nearest_gate.toLowerCase().includes(c.sector.toLowerCase()) || c.sector.toLowerCase().includes(standObj.nearest_gate.toLowerCase()));
    if (crowdFactor && crowdFactor.density > 80) return 8; // 8 minutes extra delay warning
    return 0;
  };

  const menuDelay = getSelectedStandDelay();

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Wide horizontal digital Stadium Pass */}
      <div className={`relative overflow-hidden rounded-3xl p-6 shadow-md transition-all border
        ${accessibility.highContrast 
          ? 'bg-black border-4 border-white text-white rounded-none' 
          : (theme === 'light'
              ? 'bg-white border-[#e8e8ed] text-[#1d1d1f] shadow-sm'
              : 'bg-gradient-to-br from-[#1c1c1e] to-[#000000] border-white/10 text-white')}`}
      >
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b 
          ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-white/10'}`}
        >
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t("stadiumPass", language)}</p>
            <h4 className={`text-md font-bold mt-0.5 tracking-tight ${styles.titleText}`}>{t("identity", language)}</h4>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`text-[9px] border px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold
              ${theme === 'light' ? 'bg-neutral-100 border-[#d2d2d7] text-[#1d1d1f]' : 'bg-white/10 border-white/20 text-white'}`}
            >
              {user.role}
            </span>
            <span className="text-[9px] bg-blue-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
              PLATINUM PASS
            </span>
          </div>
        </div>

        <div className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-grow">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">{t("gateEntrance", language)}</p>
              <p className={`text-base font-bold mt-0.5 ${styles.titleText}`}>{user.seat || "Gate B entrance"}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">PARKING AREA</p>
              <p className="text-base font-bold mt-0.5 text-blue-500">{user.parking || "Parking Lot B"}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">FIFA WALLET ID</p>
              <p className={`text-sm font-mono mt-0.5 ${theme === 'light' ? 'text-neutral-700' : 'text-gray-300'}`}>{user.fifa_id}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest">{t("languageLabel", language)}</p>
              <p className={`text-sm font-semibold mt-0.5 ${theme === 'light' ? 'text-neutral-700' : 'text-gray-300'}`}>{language}</p>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 self-center md:self-auto">
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center font-mono text-[9px] text-gray-800 text-center select-all border border-gray-300">
              {user.qr_code || "MOCK_PASS"}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile/Tablet tab selector - hidden on large screens (desktop) */}
      <div className={`lg:hidden p-1 flex rounded-full border transition-all duration-300 max-w-sm ${
        theme === 'light' ? 'bg-[#e3e3e9]/60 border-neutral-300/40' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <button 
          onClick={() => onPageChange('dashboard')}
          className={`flex-grow text-center py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
            ${activePage === 'dashboard'
              ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
              : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
        >
          OS Hub
        </button>
        <button 
          onClick={() => onPageChange('food')}
          className={`flex-grow text-center py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
            ${activePage === 'food'
              ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
              : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
        >
          Express Dining
        </button>
        <button 
          onClick={() => onPageChange('sustainability')}
          className={`flex-grow text-center py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300
            ${activePage === 'sustainability'
              ? (theme === 'light' ? 'bg-white text-black shadow-sm' : 'bg-[#1c1c1e] text-white border border-white/5 shadow-md')
              : (theme === 'light' ? 'text-neutral-600 hover:text-black' : 'text-gray-400 hover:text-white')}`}
        >
          Green Index
        </button>
      </div>

      {/* Render selected sub-page from Navbar selection */}

      {/* PAGE 1: OS MAIN TELEMETRY HUB */}
      {fanTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: SOS Beacon & Live Match Telemetry */}
          <div className="space-y-6">
            <button 
              onClick={triggerMedicalPan}
              className={`w-full text-left transition-all group flex items-center justify-between shadow-md rounded-3xl p-6 border
                ${accessibility.highContrast 
                  ? 'bg-black border-4 border-white text-white rounded-none' 
                  : 'bg-red-500/10 hover:bg-red-500/15 border-red-500/20'}`}
            >
              <div>
                <h4 className="text-red-500 font-bold text-md flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>{t("emergencySOS", language)}</span>
                </h4>
                <p className={`text-xs mt-1 ${theme === 'light' ? 'text-red-700/80' : 'text-red-200/80'}`}>{t("sosDesc", language)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center transition-colors">
                <span className="text-red-500 font-bold text-lg">&gt;</span>
              </div>
            </button>

            <div className={styles.card}>
              <div className={`flex justify-between items-center pb-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-200/10'}`}>
                <span className={`text-xs font-bold uppercase ${styles.subText}`}>{t("liveMatchStats", language)}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="text-center py-4">
                <h3 className={`text-3xl font-extrabold text-display ${styles.titleText}`}>{telemetry.match.score}</h3>
                <p className={`text-xs font-bold mt-1.5 uppercase tracking-wider ${styles.titleText}`}>{telemetry.match.teams}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{telemetry.match.phase} • {telemetry.match.time_elapsed}' mins</p>
              </div>
            </div>
          </div>

          {/* Column 2: Smart Stadium Map & Route Planner */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <StadiumMap 
                  nodes={nodes} 
                  crowdDensities={telemetry.crowd} 
                  activeRoute={route} 
                  emergencies={telemetry.emergencies}
                  onSelectNode={(nid) => {
                    if (startNode === nid) return;
                    setEndNode(nid);
                  }}
                  theme={theme}
                  accessibility={accessibility}
                  userLocation={startNode}
                  destinationNode={endNode}
                />
              </div>

              <div className={`${styles.card} flex flex-col justify-between`}>
                <div className="space-y-4">
                  <h4 className={`text-sm font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>{t("wayfinding", language)}</span>
                  </h4>
                  
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{t("startPoint", language)}</label>
                    <select 
                      value={startNode} 
                      onChange={(e) => setStartNode(e.target.value)}
                      className={styles.select}
                    >
                      {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">{t("destination", language)}</label>
                    <select 
                      value={endNode} 
                      onChange={(e) => setEndNode(e.target.value)}
                      className={styles.select}
                    >
                      {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>

                  <label className="flex items-center space-x-2 text-[10px] cursor-pointer pt-2">
                    <input 
                      type="checkbox"
                      checked={accessible}
                      onChange={(e) => setAccessible(e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className={styles.subText}>{t("wheelchairOption", language)}</span>
                  </label>
                </div>

                <button 
                  onClick={handleCalculateRoute}
                  className={`${styles.btn} mt-6`}
                >
                  {t("calculateRoute", language)}
                </button>
              </div>
            </div>

            {directions.length > 0 && (
              <div className={`${styles.card} animate-fadeIn`}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3 flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>{t("voiceCues", language)} ({language})</span>
                </h4>
                <ul className={`space-y-2 text-xs list-disc list-inside ${styles.subText}`}>
                  {directions.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGE 2: FOOD CONCESSIONS & TRACKING */}
      {fanTab === 'food' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Menu Selection (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className={styles.card}>
              <h3 className={`text-md font-bold text-display mb-4 flex items-center space-x-2 ${styles.titleText}`}>
                <Coffee className="w-5 h-5 text-pink-400" />
                <span>Select Food Concession Stand</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stands.map(stand => (
                  <button
                    key={stand.id}
                    onClick={() => setSelectedStand(stand.name)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-28
                      ${selectedStand === stand.name
                        ? 'border-pink-500 bg-pink-500/10'
                        : styles.subCard}`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${styles.titleText}`}>{stand.name}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{stand.nearest_gate} • {stand.rating} ★</p>
                    </div>
                    <span className="text-[10px] font-bold text-pink-500">{stand.queue_time}m wait time</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu details */}
            <div className={styles.card}>
              <h3 className={`text-md font-bold text-display mb-4 ${styles.titleText}`}>
                {selectedStand} - Exclusive Arena Menu
              </h3>
              
              <div className="space-y-4">
                {(foodMenus[selectedStand] || []).map(item => (
                  <div key={item.name} className={`p-4 rounded-2xl border flex justify-between items-center ${styles.subCard}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${styles.titleText}`}>{item.name}</p>
                        <p className={`text-[10px] mt-0.5 ${styles.subText}`}>{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs font-bold font-mono ${styles.titleText}`}>${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => triggerExpressOrder(item.name)}
                        className="bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors shadow-sm"
                      >
                        Express Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Right Column: Active Order Tracking & Delay Monitor */}
        <div className="space-y-6">
          <div className={styles.card}>
            <h3 className={`text-md font-bold text-display mb-4 ${styles.titleText}`}>Live Order Tracker</h3>

            {activeOrder ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${styles.subCard} text-center space-y-2`}>
                  <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">Active Express Pass</p>
                  <p className={`text-xs font-bold ${styles.titleText}`}>{activeOrder.item}</p>
                  <p className="text-[10px] text-gray-500">{activeOrder.stand}</p>
                </div>

                {/* Delay alert banner */}
                {menuDelay > 0 && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl text-[10px] leading-relaxed flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>DELIVERY DELAY ALERT:</strong> High corridor density detected at closest gate sector. Food pickup prep lines are delayed by +{menuDelay} minutes.
                    </span>
                  </div>
                )}

                {/* Progress Tracker bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-pink-500 capitalize">Status: {activeOrder.status}</span>
                    <span className={styles.titleText}>{activeOrder.progress}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-neutral-200' : 'bg-white/10'}`}>
                    <div 
                      className="h-full rounded-full bg-pink-500 transition-all duration-1000" 
                      style={{ width: `${activeOrder.progress}%` }} 
                    />
                  </div>
                </div>

                <div className={`space-y-2 text-[10px] ${theme === 'light' ? 'text-neutral-500' : 'text-gray-400'}`}>
                  <div className="flex justify-between">
                    <span>Express Code:</span>
                    <span className={`font-mono ${theme === 'light' ? 'text-black font-semibold' : 'text-gray-200'}`}>#FIFA-EXP-{Math.floor(Math.random() * 9000 + 1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pickup Counter:</span>
                    <span className={`font-bold ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}>Counter 3</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`py-12 text-center text-xs ${styles.subText} font-mono border-2 border-dashed ${theme === 'light' ? 'border-neutral-200' : 'border-white/5'} rounded-2xl`}>
                No active orders.<br />Select a stand and place an order on the left menu.
              </div>
            )}
          </div>

          {/* Sustainability link note */}
          <div className={`p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 leading-relaxed space-y-2`}>
            <h4 className="font-bold flex items-center space-x-1">
              <span>🌱 Sustainable Arena Packing</span>
            </h4>
            <p>All concessions packaging is 100% compostable bamboo. Placed compost bins automatically update stadium sustainability indices in the next portal tab.</p>
          </div>
        </div>
      </div>
      )}

      {/* PAGE 3: SUSTAINABILITY INDEX DIAGNOSTICS */}
      {fanTab === 'sustainability' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main indices counters (Col-span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className={styles.card}>
              <h3 className={`text-md font-bold text-display mb-4 flex items-center space-x-2 ${styles.titleText}`}>
                <Droplets className="w-5 h-5 text-emerald-400 animate-bounce" />
                <span>Real-Time Arena Resource Generation</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${styles.subCard} text-center space-y-2`}>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Live Solar Output</p>
                  <h3 className="text-xl font-black font-mono text-emerald-500">{solarGeneration.toFixed(1)} kW</h3>
                  <p className="text-[9px] text-gray-400">Fluctuates with matching light telemetry</p>
                </div>
                <div className={`p-4 rounded-2xl border ${styles.subCard} text-center space-y-2`}>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Rainwater Captured</p>
                  <h3 className="text-xl font-black font-mono text-blue-400">12,840 Liters</h3>
                  <p className="text-[9px] text-gray-400">Redirected to washroom cisterns</p>
                </div>
                <div className={`p-4 rounded-2xl border ${styles.subCard} text-center space-y-2`}>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Compost Diversion</p>
                  <h3 className="text-xl font-black font-mono text-amber-500">92.8%</h3>
                  <p className="text-[9px] text-gray-400">Total dining compost recycle rate</p>
                </div>
              </div>
            </div>

            {/* CSS Power diversion bar charts */}
            <div className={styles.card}>
              <h3 className={`text-sm font-bold text-display mb-4 ${styles.titleText}`}>
                Energy Diversion Ratio - Solar Grid vs Traditional Power Grid
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-emerald-500">Solar Grid Power Generation (Clean Energy)</span>
                    <span className="text-emerald-500">76% of total consumption</span>
                  </div>
                  <div className={`w-full h-4 rounded-full overflow-hidden ${theme === 'light' ? 'bg-neutral-200' : 'bg-white/10'}`}>
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '76%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-neutral-400">Municipal Coal-Fired Grid (Reserve Power)</span>
                    <span className={styles.titleText}>24% of total consumption</span>
                  </div>
                  <div className={`w-full h-4 rounded-full overflow-hidden ${theme === 'light' ? 'bg-neutral-200' : 'bg-white/10'}`}>
                    <div className="h-full rounded-full bg-neutral-500" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transit Offset & Sustainability advisory */}
          <div className="space-y-6">
            <div className={styles.card}>
              <h3 className={`text-md font-bold text-display mb-3 ${styles.titleText}`}>Carbon Offset Calculator</h3>
              <p className={`text-xs ${styles.subText} mb-4`}>Based on your chosen routing and ticket pass logistics, here is your personal offset index:</p>
              
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${styles.subCard}`}>
                  <div>
                    <p className={`font-bold ${styles.titleText}`}>Transit: Electric Shuttle</p>
                    <p className="text-[9px] text-gray-400">Lot B transport dispatch</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 font-mono">+14.5 kg CO2</span>
                </div>

                <div className={`p-3 rounded-xl border flex justify-between items-center text-xs ${styles.subCard}`}>
                  <div>
                    <p className={`font-bold ${styles.titleText}`}>Dining: Reusable Bamboo</p>
                    <p className="text-[9px] text-gray-400">Concession plate offset</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 font-mono">+3.2 kg CO2</span>
                </div>
              </div>
            </div>

            {/* Green Match Advisory */}
            <div className={styles.card}>
              <h4 className={`text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 flex items-center space-x-1`}>
                <Lightbulb className="w-4 h-4" />
                <span>Stadium Advisory Tips</span>
              </h4>
              <p className={`text-xs leading-relaxed ${styles.subText}`}>
                Taking **Transit Line A** for leaving the arena is carbon-neutral tonight, as metro lines are driven by wind farm offset tokens. Select Transit Line A in your wayfinder exit routing.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ==========================================
// 2. VOLUNTEER PORTAL
// ==========================================
function VolunteerDashboard({
  user,
  telemetry,
  onTriggerEmergency,
  language,
  accessibility,
  theme
}: {
  user: User;
  telemetry: TelemetryData;
  onTriggerEmergency: any;
  language: string;
  accessibility: any;
  theme: 'light' | 'dark';
}) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Direct wheelchair crowd at Gate A entrance", status: "pending", priority: "High" },
    { id: 2, text: "Translate announcements for Spanish VIP fans", status: "pending", priority: "Medium" },
    { id: 3, text: "Verify medical shuttle lane block status", status: "completed", priority: "Low" }
  ]);

  const styles = getThemeClasses(theme, accessibility.highContrast);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Task management */}
      <div className={`${styles.card} lg:col-span-2 space-y-4`}>
        <h3 className={`text-md font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{t("dailyTasks", language)} ({user.role})</span>
        </h3>
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t.id} className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all ${styles.subCard}`}>
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  checked={t.status === 'completed'}
                  onChange={() => toggleTask(t.id)}
                  className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
                />
                <span className={`text-xs ${t.status === 'completed' ? 'line-through text-gray-500' : styles.titleText}`}>
                  {t.text}
                </span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                ${t.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}
              >
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory alerts */}
      <div className={styles.card}>
        <h3 className={`text-md font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>{t("advisoryAlerts", language)}</span>
        </h3>
        <div className="space-y-3 mt-4 overflow-y-auto max-h-[300px]">
          {telemetry.alerts.map(a => (
            <div key={a.id} className={`p-3.5 rounded-2xl border ${styles.subCard} text-xs space-y-1`}>
              <p className={`font-bold ${styles.titleText}`}>{a.title}</p>
              <p className={styles.subText}>{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. ORGANIZER DASHBOARD
// ==========================================
const OrganizerDashboard: React.FC<{ telemetry: TelemetryData; nodes: NavNode[]; onResolveEmergency: any; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  telemetry,
  onResolveEmergency,
  language,
  accessibility,
  theme
}) => {
  const styles = getThemeClasses(theme, accessibility.highContrast);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active Occupancy</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>{telemetry.stadium.attendance}</h2>
          <p className="text-[9px] text-[#0066cc] font-medium mt-1">Capacity: {telemetry.stadium.capacity}</p>
        </div>
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Incident Response Speed</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>{telemetry.incident_response_speed_min} min</h2>
          <p className="text-[9px] text-emerald-500 font-medium mt-1">Steward dispatch time: sub 1m</p>
        </div>
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Clean Energy Generation</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>{(telemetry.sustainability.electricity_kwh / 1000).toFixed(1)} MWh</h2>
          <p className="text-[9px] text-emerald-500 font-medium mt-1">94% from solar grids</p>
        </div>
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Concession Revenue</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>${(telemetry.stands_revenue / 1000).toFixed(1)}k</h2>
          <p className="text-[9px] text-pink-500 font-medium mt-1">Ordered via Express Pass</p>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Monitor */}
        <div className={`${styles.card} lg:col-span-2 space-y-4`}>
          <h3 className={`text-sm font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
            <Shield className="w-5 h-5 text-indigo-500" />
            <span>Operational Active Emergencies</span>
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {telemetry.emergencies.length === 0 ? (
              <div className={`p-4 rounded-2xl text-xs font-mono text-center ${styles.subCard}`}>
                No unresolved emergencies. All systems operational.
              </div>
            ) : (
              telemetry.emergencies.map(e => (
                <div key={e.id} className={`flex justify-between items-center p-3.5 rounded-2xl border ${styles.subCard}`}>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider bg-red-500/10 text-red-500 font-bold border border-red-500/20 px-2 py-0.5 rounded-md">
                      {e.type} • {e.severity}
                    </span>
                    <p className={`text-xs font-bold mt-2 ${styles.titleText}`}>{e.description}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Location: {e.location} • Status: {e.status}</p>
                  </div>
                  <button 
                    onClick={() => onResolveEmergency(e.id)}
                    className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-50 hover:text-white px-3 py-1.5 rounded-xl transition-all font-bold"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI disperse Dispersal advice */}
        <div className={`${styles.card} space-y-4`}>
          <h3 className={`text-sm font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>AI Dispatch Advice</span>
          </h3>
          <div className={`p-4 rounded-2xl border space-y-3 ${styles.subCard}`}>
            <p className={`text-xs font-bold ${styles.titleText}`}>Crowd Risk: {telemetry.ai_insights.crowd_risk_assessment}</p>
            <p className={`text-xs ${styles.subText}`}>Optimal exit plan: {telemetry.ai_insights.best_exit_mode}</p>
            <div className="text-[10px] text-gray-400 space-y-1 pt-2 border-t border-neutral-200/10">
              <p>• Recommend dispatching support to Gate A.</p>
              <p>• High density detected at East Stand Corridor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SECURITY PORTAL
// ==========================================
const SecurityDashboard: React.FC<{ telemetry: TelemetryData; nodes: NavNode[]; onResolveEmergency: any; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  telemetry,
  onResolveEmergency,
  language,
  accessibility,
  theme
}) => {
  const styles = getThemeClasses(theme, accessibility.highContrast);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Crowd Density Alert</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>
            {(telemetry.crowd.reduce((acc, c) => acc + c.density, 0) / telemetry.crowd.length).toFixed(1)}%
          </h2>
          <span className="text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
            Average risk index
          </span>
        </div>
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CCTV Streams</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>148 Cameras</h2>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
            Neural anomaly analyzer active
          </span>
        </div>
        <div className={styles.card}>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Incidents Logged</p>
          <h2 className={`text-2xl font-black mt-1 font-mono ${styles.titleText}`}>{telemetry.emergencies.length} Active</h2>
          <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold animate-pulse">
            SOS Beacon scan rate: 100ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident dispatcher */}
        <div className={`${styles.card} lg:col-span-2 space-y-4`}>
          <h3 className={`text-sm font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Emergency SOS Dispatch Monitor</span>
          </h3>
          
          <div className="space-y-3">
            {telemetry.emergencies.map(e => (
              <div key={e.id} className={`flex justify-between items-center p-3.5 rounded-2xl border ${styles.subCard}`}>
                <div>
                  <span className="text-[9px] uppercase tracking-wider bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-md">
                    {e.type} • {e.severity}
                  </span>
                  <p className={`text-xs font-bold mt-2 ${styles.titleText}`}>{e.description}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Seat/Location: {e.location} • Status: {e.status}</p>
                </div>
                <button 
                  onClick={() => onResolveEmergency(e.id)}
                  className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-50 hover:text-white px-3 py-1.5 rounded-xl transition-all font-bold"
                >
                  Resolve
                </button>
              </div>
            ))}
            {telemetry.emergencies.length === 0 && (
              <div className={`p-4 rounded-2xl text-xs font-mono text-center ${styles.subCard}`}>
                All stadium camera streams clean. No incidents.
              </div>
            )}
          </div>
        </div>

        {/* Threat dispersal card */}
        <div className={`${styles.card} space-y-4`}>
          <h3 className={`text-sm font-bold text-display ${styles.titleText}`}>CCTV AI Dispersal Index</h3>
          <div className="space-y-3">
            {telemetry.crowd.map(c => {
              const risk = c.density > 80 ? 'CRITICAL' : (c.density > 50 ? 'MEDIUM' : 'LOW');
              return (
                <div key={c.sector_id} className={`p-3 rounded-2xl border ${styles.subCard} flex justify-between items-center text-xs`}>
                  <div>
                    <p className={`font-bold ${styles.titleText}`}>{c.sector_id}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Capacity: {c.density}%</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                    ${risk === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                  >
                    {risk}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// 5. MEDICAL PORTAL
// ==========================================
const MedicalDashboard: React.FC<{ telemetry: TelemetryData; nodes: NavNode[]; onResolveEmergency: any; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  telemetry,
  onResolveEmergency,
  language,
  accessibility,
  theme
}) => {
  const styles = getThemeClasses(theme, accessibility.highContrast);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Medical dispatcher */}
      <div className={`${styles.card} lg:col-span-2 space-y-4`}>
        <h3 className={`text-sm font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
          <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          <span>Active MedicalSOS Alerts</span>
        </h3>
        
        <div className="space-y-3">
          {telemetry.emergencies.filter(e => e.type === 'Medical').map(e => (
            <div key={e.id} className={`flex justify-between items-center p-3.5 rounded-2xl border ${styles.subCard}`}>
              <div>
                <span className="text-[9px] uppercase tracking-wider bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-md">
                  {e.severity} • Incident #{e.id}
                </span>
                <p className={`text-xs font-bold mt-2 ${styles.titleText}`}>{e.description}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Seat/Location: {e.location} • Status: {e.status}</p>
              </div>
              <button 
                onClick={() => onResolveEmergency(e.id)}
                className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-50 hover:text-white px-3 py-1.5 rounded-xl transition-all font-bold"
              >
                Resolve
              </button>
            </div>
          ))}
          {telemetry.emergencies.filter(e => e.type === 'Medical').length === 0 && (
            <div className={`p-4 rounded-2xl text-xs font-mono text-center ${styles.subCard}`}>
              No medical dispatch requests currently active.
            </div>
          )}
        </div>
      </div>

      {/* Advisory alerts */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-sm font-bold text-display ${styles.titleText}`}>Steward Responder Log</h3>
        <div className="space-y-3">
          <div className={`p-3.5 rounded-2xl border ${styles.subCard} text-xs`}>
            <p className={`font-bold ${styles.titleText}`}>Steward Sector A</p>
            <p className={styles.subText}>Status: Standby • Response speed: sub 30s</p>
          </div>
          <div className={`p-3.5 rounded-2xl border ${styles.subCard} text-xs`}>
            <p className={`font-bold ${styles.titleText}`}>Medic Station 2</p>
            <p className={styles.subText}>Status: Standby • Responders: 6 medics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. TRANSPORT STATIONS PORTAL
// ==========================================
const TransportDashboard: React.FC<{ telemetry: TelemetryData; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  telemetry,
  language,
  accessibility,
  theme
}) => {
  const styles = getThemeClasses(theme, accessibility.highContrast);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Parking Spaces */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
          <Truck className="w-5 h-5 text-blue-500" />
          <span>Parking Lots Occupancy</span>
        </h3>
        <div className="space-y-3">
          {telemetry.parking.map((p, idx) => {
            const pct = (p.occupied_spaces / p.total_spaces) * 100;
            return (
              <div key={idx} className={`p-4 rounded-2xl border ${styles.subCard} space-y-2`}>
                <div className="flex justify-between text-xs font-bold">
                  <span className={styles.titleText}>{p.lot_id}</span>
                  <span className={pct > 90 ? 'text-red-500' : 'text-blue-500'}>{p.occupied_spaces}/{p.total_spaces} spaces</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-neutral-200' : 'bg-white/10'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transit line queue times */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
          <Users className="w-5 h-5 text-indigo-500" />
          <span>Transit Line Queues</span>
        </h3>
        <div className="space-y-3">
          {telemetry.transportation.map((t, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border flex justify-between items-center ${styles.subCard}`}>
              <div>
                <p className={`text-xs font-bold ${styles.titleText}`}>{t.line_name}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Type: {t.type} • Status: {t.status}</p>
              </div>
              <span className={`text-xs font-bold ${t.estimated_wait > 15 ? 'text-red-500 animate-pulse' : 'text-sky-500'}`}>
                {t.estimated_wait}m wait
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI disperse insights */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display ${styles.titleText}`}>AI Dispersal Advice</h3>
        <div className="space-y-3 text-xs leading-relaxed">
          <p className={`p-3.5 rounded-2xl border font-semibold ${styles.subCard}`}>
            Optimal Exit Corridor: {telemetry.ai_insights.best_exit_mode}
          </p>
          <div className={`space-y-2 ${styles.subText}`}>
            <p>• Recommend bus frequency increase at Exit B by 25%.</p>
            <p>• Parking gate barriers in Lot A set to automatic-open state.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. ADMIN / AUDIT LOG PORTAL
// ==========================================
const AdminDashboard: React.FC<{ telemetry: TelemetryData; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  telemetry,
  language,
  accessibility,
  theme
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [refresh, setRefresh] = useState(0);

  const styles = getThemeClasses(theme, accessibility.highContrast);

  useEffect(() => {
    fetch(`${API_BASE}/api/audit-logs`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(() => {});
  }, [refresh]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* DB Statistics */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display ${styles.titleText}`}>Database Core Diagnostics</h3>
        <div className="space-y-3.5 text-xs">
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>Database Engine:</span>
            <span className={`font-bold font-mono ${styles.titleText}`}>SQLite (Local Core)</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>Schema Engine:</span>
            <span className={`font-bold font-mono ${styles.titleText}`}>SQLAlchemy v2.0</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>WebSocket Connection:</span>
            <span className="font-bold text-emerald-500 font-mono">Active broadcast</span>
          </div>
        </div>
      </div>

      {/* Audit logs trail */}
      <div className={`lg:col-span-2 ${styles.card} space-y-4`}>
        <div className="flex justify-between items-center">
          <h3 className={`text-md font-bold text-display flex items-center space-x-2 ${styles.titleText}`}>
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>Audit Trail Log</span>
          </h3>
          <button 
            onClick={() => setRefresh(prev => prev + 1)}
            className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-neutral-100 text-[#1d1d1f]' : 'hover:bg-white/10 text-gray-300'}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {logs.map((l) => (
            <div key={l.id} className={`p-3 rounded-2xl border text-[10px] font-mono leading-relaxed ${styles.subCard}`}>
              <div className="flex justify-between mb-1">
                <span className="text-blue-500 font-bold">{l.action}</span>
                <span className="text-gray-500">{new Date(l.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className={styles.subText}>User: {l.user_id || 'System Engine'} • Details: {l.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. GENERIC STAFF WIDGETS DASHBOARD
// ==========================================
const GenericStaffDashboard: React.FC<{ user: User; telemetry: TelemetryData; onTriggerEmergency: any; language: string; accessibility: any; theme: 'light' | 'dark' }> = ({
  user,
  telemetry,
  onTriggerEmergency,
  language,
  accessibility,
  theme
}) => {
  const [tasks] = useState([
    { id: 1, title: 'Clean trash bins in Section 102', role: 'Cleaning Staff' },
    { id: 2, title: 'Check water valve pressure in East stand restrooms', role: 'Cleaning Staff' },
    { id: 3, title: 'Prepare pre-match interview audio check', role: 'Media' },
    { id: 4, title: 'Setup hamburger stand menu tags', role: 'Food Vendor' },
    { id: 5, title: 'Verify gate validation sensor alignment', role: 'Venue Staff' }
  ]);

  const styles = getThemeClasses(theme, accessibility.highContrast);
  const filteredTasks = tasks.filter(t => t.role === user.role);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Daily tasks */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display ${styles.titleText}`}>{t("dailyTasks", language)} - {user.role}</h3>
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className={`p-4 rounded-2xl text-xs font-mono ${styles.subCard}`}>
              Tasks complete! Please monitor live telemetry warnings.
            </div>
          ) : (
            filteredTasks.map(t => (
              <div key={t.id} className={`p-3.5 rounded-2xl border text-xs ${styles.subCard}`}>
                {t.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Advisory warnings */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display ${styles.titleText}`}>{t("advisoryAlerts", language)}</h3>
        <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
          {telemetry.alerts.map((a) => (
            <div key={a.id} className={`p-3 rounded-xl border text-[11px] leading-relaxed ${styles.subCard}`}>
              <p className={`font-bold ${styles.titleText}`}>{a.title}</p>
              <p className={`mt-0.5 ${styles.subText}`}>{a.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability indicators */}
      <div className={`${styles.card} space-y-4`}>
        <h3 className={`text-md font-bold text-display ${styles.titleText}`}>{t("sustainabilityLabel", language)}</h3>
        <div className="space-y-3.5 text-xs">
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>{t("electricity", language)}:</span>
            <span className={`font-bold ${styles.titleText}`}>{telemetry.sustainability.electricity_kwh.toFixed(0)} kWh</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>{t("water", language)}:</span>
            <span className={`font-bold ${styles.titleText}`}>{telemetry.sustainability.water_liters.toFixed(0)} L/s</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-[#e8e8ed]' : 'border-neutral-800'}`}>
            <span className={styles.subText}>{t("waste", language)}:</span>
            <span className={`font-bold ${styles.titleText}`}>{telemetry.sustainability.waste_kg.toFixed(0)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
