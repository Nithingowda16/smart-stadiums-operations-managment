import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DynamicIsland } from '../src/components/DynamicIsland';
import { AlertInfo } from '../src/types';

describe('DynamicIsland Component', () => {
  it('renders system status button when there are no active alerts', () => {
    render(<DynamicIsland alerts={[]} />);
    expect(screen.getByText('FIFA ONE AI')).toBeInTheDocument();
  });

  it('expands system parameters card when clicked in idle mode', () => {
    render(<DynamicIsland alerts={[]} />);
    const button = screen.getByText('FIFA ONE AI');
    fireEvent.click(button);
    expect(screen.getByText('SYSTEM PARAMETERS')).toBeInTheDocument();
    expect(screen.getByText('Core Telemetry Hub active at 127.0.0.1:8000')).toBeInTheDocument();
  });

  it('displays emergency alert details when active alert pill is clicked', () => {
    const emergencyAlert: AlertInfo = {
      id: 'e1',
      title: 'Medical Emergency',
      message: 'Paramedic dispatched to Gate A',
      time: '12:00',
      type: 'emergency'
    };

    render(<DynamicIsland alerts={[emergencyAlert]} />);
    expect(screen.getByText('Medical Emergency')).toBeInTheDocument();
    
    // Click emergency pill to expand
    fireEvent.click(screen.getByText('Medical Emergency'));
    expect(screen.getByText('Paramedic dispatched to Gate A')).toBeInTheDocument();
  });

  it('allows dismissing expanded emergency alert', () => {
    const emergencyAlert: AlertInfo = {
      id: 'e1',
      title: 'Medical Emergency',
      message: 'Paramedic dispatched to Gate A',
      time: '12:00',
      type: 'emergency'
    };

    render(<DynamicIsland alerts={[emergencyAlert]} />);
    fireEvent.click(screen.getByText('Medical Emergency'));
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    expect(screen.getByText('FIFA ONE AI')).toBeInTheDocument();
  });

});
