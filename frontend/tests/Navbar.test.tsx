import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../src/components/Navbar';
import { User } from '../src/types';

describe('Navbar Component', () => {
  const mockUser: User = {
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

  const defaultProps = {
    user: mockUser,
    onLogout: vi.fn(),
    language: 'English',
    onLanguageChange: vi.fn(),
    accessibilitySettings: { highContrast: false, largeFont: false, screenReader: false },
    onAccessibilityChange: vi.fn(),
    connected: true,
    theme: 'dark' as const,
    onThemeToggle: vi.fn(),
    activePage: 'dashboard' as const,
    onPageChange: vi.fn()
  };

  it('renders branding title and subtitle', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('FIFA ONE AI')).toBeInTheDocument();
    expect(screen.getByText('One Identity. One Stadium. One AI.')).toBeInTheDocument();
  });

  it('renders navigation tabs for Fan role', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('OS Hub')).toBeInTheDocument();
    expect(screen.getByText('Express Dining')).toBeInTheDocument();
    expect(screen.getByText('Stadium Green Index')).toBeInTheDocument();
  });

  it('calls onPageChange when navigation tabs are clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByText('Express Dining'));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith('food');
  });

  it('opens language selector menu when language button is clicked', () => {
    render(<Navbar {...defaultProps} />);
    const langBtn = screen.getByText('English');
    fireEvent.click(langBtn);
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('calls onLogout when sign out button is clicked', () => {
    render(<Navbar {...defaultProps} />);
    const logoutBtn = screen.getByTitle('Sign Out');
    fireEvent.click(logoutBtn);
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

});
