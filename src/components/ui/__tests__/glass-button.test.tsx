import { render, screen } from '@testing-library/react';
import { GlassButton } from '../glass-button';
import { Plus } from 'lucide-react';
import React from 'react';

describe('GlassButton', () => {
  it('renders with correct text', () => {
    render(<GlassButton>Test Button</GlassButton>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <GlassButton>
        <Plus className="w-4 h-4" />
        Button with Icon
      </GlassButton>
    );
    expect(screen.getByText('Button with Icon')).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('applies glass effect classes', () => {
    render(<GlassButton>Test Button</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('glass-advanced');
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('border-white/20');
  });
});