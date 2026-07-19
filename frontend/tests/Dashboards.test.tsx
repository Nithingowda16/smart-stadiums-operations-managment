import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboards } from '../src/views/Dashboards';
import { User, TelemetryData, NavNode } from '../src/types';

describe('Dashboards Component', () => {
  const mockFanUser: User = {
    fifa_id: 'FIFA-10001',
    name: 'John Fan',
    email: 'fan@fifa.one',
    role: 'Fan',
    seat: 'Sector 101, Row A, Seat 1',
    parking: 'Lot A',
    language: 'English',
    emergency_contact: '911',
    medical_info: 'None',
    accessibility_requirement: 'None',
    qr_code: 'QR-101',
    face_id_placeholder: 'VERIFIED',
    digital_stadium_pass: 'PASS-101'
  };

  const mockAdminUser: User = {
    ...mockFanUser,
    fifa_id: 'FIFA-10010',
    name: 'Admin User',
    role: 'Admin'
  };

  const mockTelemetry: any = {
    match: { teams: 'USA vs Mexico', score: '1-1', phase: 'Quarter Finals', time_elapsed: 55, status: 'Live' },
    crowd: { active_spectators: 65000, gate_a_queue: 12, gate_b_queue: 15, avg_entry_wait_sec: 45, density_warning: false, crowd_sectors: [] },
    sustainability: { electricity_kwh: 12000, water_liters: 8000, waste_kg: 1500, plastic_bottles: 3000, carbon_g: 500, food_waste_kg: 200, solar_kwh: 145.2, rainwater_liters: 8500, waste_recycled_percent: 88, carbon_offset_kg: 340, eco_rating: 'A+' },
    active_incidents: [],
    gate_queues: []
  };

  const mockNodes: NavNode[] = [
    { id: 'n1', label: 'Gate A', x: 10, y: 10, node_type: 'gate' },
    { id: 'n2', label: 'Sector 101', x: 20, y: 20, node_type: 'seat' }
  ];

  const defaultProps = {
    user: mockFanUser,
    telemetry: mockTelemetry,
    nodes: mockNodes,
    onTriggerEmergency: vi.fn().mockResolvedValue({ status: 'ok' }),
    onResolveEmergency: vi.fn().mockResolvedValue({ status: 'ok' }),
    language: 'English',
    accessibility: { highContrast: false, largeFont: false, screenReader: false },
    theme: 'dark' as const,
    activePage: 'dashboard' as const,
    onPageChange: vi.fn()
  };

  it('renders Fan dashboard elements (Stadium Pass, SOS button, Match Stats)', () => {
    render(<Dashboards {...defaultProps} />);
    expect(screen.getByText('FIFA STADIUM PASS')).toBeInTheDocument();
    expect(screen.getByText('FIFA-10001')).toBeInTheDocument();
    expect(screen.getByText('USA vs Mexico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Emergency SOS Button/i })).toBeInTheDocument();
  });

  it('triggers emergency SOS callback when SOS button is clicked', () => {
    render(<Dashboards {...defaultProps} />);
    const sosBtn = screen.getByRole('button', { name: /Emergency SOS Button/i });
    fireEvent.click(sosBtn);
    expect(defaultProps.onTriggerEmergency).toHaveBeenCalledWith(
      'Medical',
      'Sector 101, Row A, Seat 1',
      'High',
      'Emergency beacon fired from Fan Seat Wallet'
    );
  });

  it('renders Admin diagnostic portal when Admin user logs in', () => {
    render(<Dashboards {...defaultProps} user={mockAdminUser} />);
    expect(screen.getByText(/Database Core Diagnostics/i)).toBeInTheDocument();
  });

});
