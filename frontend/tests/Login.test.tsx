import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../src/views/Login';

describe('Login Component', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders login form with default fields and title', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('toggles between Sign In and Registration forms', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    const toggleBtn = screen.getByText('Register Pass');
    fireEvent.click(toggleBtn);
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
  });

  it('autofills credentials when role dropdown option is selected', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    const roleSelect = screen.getByLabelText('Target Portal Role');
    fireEvent.change(roleSelect, { target: { value: 'Volunteer' } });
    expect(roleSelect).toHaveValue('Volunteer');
  });

  it('submits login request and handles success', async () => {
    const fakeUserData = {
      access_token: 'fake_jwt_token_123',
      user: { email: 'fan@fifa.one', role: 'Fan' }
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fakeUserData)
    } as Response);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'fan@fifa.one' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /Enter Stadium OS/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledWith('fake_jwt_token_123', fakeUserData.user);
    });
  });

  it('displays error message on invalid credentials', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: 'Invalid credentials' })
    } as Response);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'fan@fifa.one' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });

    const submitBtn = screen.getByRole('button', { name: /Enter Stadium OS/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

});
