export interface User {
  fifa_id: string;
  name: string;
  email: string;
  role: string;
  seat: string | null;
  parking: string | null;
  language: string;
  accessibility_requirement: string;
  qr_code: string | null;
  digital_stadium_pass: string | null;
}

export interface MatchInfo {
  teams: string;
  score: string;
  phase: string;
  time_elapsed: number;
}

export interface WeatherInfo {
  temperature_c: number;
  condition: string;
  wind_kph: number;
}

export interface SustainabilityMetrics {
  electricity_kwh: number;
  water_liters: number;
  waste_kg: number;
  plastic_bottles: number;
  carbon_g: number;
  food_waste_kg: number;
}

export interface CrowdSector {
  sector: string;
  density: number;
  queue_time: number;
}

export interface ParkingInfo {
  lot_id: string;
  total_spaces: number;
  occupied_spaces: number;
}

export interface TransportationInfo {
  type: string;
  line_name: string;
  status: string;
  estimated_wait: number;
}

export interface EmergencyInfo {
  id: number;
  type: string;
  location: string;
  severity: string;
  description: string;
  status: string;
  resolver_id?: string;
}

export interface AlertInfo {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency';
  timestamp: string;
}

export interface AIInsights {
  status: string;
  stadium_risk_score: number;
  stadium_risk_level: string;
  average_crowd_density: number;
  best_exit_mode: string;
  eco_rating: string;
  co2_saved_kg: number;
  recommendations: string[];
}

export interface TelemetryData {
  timestamp: string;
  match: MatchInfo;
  weather: WeatherInfo;
  sustainability: SustainabilityMetrics;
  crowd: CrowdSector[];
  parking: ParkingInfo[];
  transportation: TransportationInfo[];
  emergencies: EmergencyInfo[];
  alerts: AlertInfo[];
  ai_insights: AIInsights;
}

export interface NavNode {
  id: string;
  label: string;
  x: number;
  y: number;
  node_type: 'gate' | 'food' | 'medical' | 'washroom' | 'parking' | 'seat' | 'normal';
}

export interface FoodStand {
  id: string;
  name: string;
  queue_time: number;
  rating: number;
  is_veg: boolean;
  is_halal: boolean;
  is_vegan: boolean;
  price_level: string;
  nearest_gate: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user_id: string;
  action: string;
  details: string;
}
