import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Contacts from '../Contacts';
import { BrowserRouter } from 'react-router-dom';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the useSession hook
jest.mock('@/integrations/supabase/auth', () => ({
  useSession: () => ({
    session: { user: { id: 'user1' } },
    isLoading: false,
  }),
}));

// Mock the useGroups hook
jest.mock('@/hooks/use-groups', () => ({
  useGroups: () => ({
    groups: [
      { id: '1', name: 'Family' },
      { id: '2', name: 'Work' },
    ],
    fetchGroups: jest.fn(),
  }),
}));

// Mock the useDebounce hook
jest.mock('@/hooks/use-performance', () => ({
  useDebounce: (value: string) => value,
}));

// Mock the exportContactsToCsv function
jest.mock('@/utils/export-contacts', () => ({
  exportContactsToCsv: jest.fn(),
}));

// Mock the ContactList component
jest.mock('@/components/ContactList', () => () => <div data-testid="contact-list">Contact List</div>);

// Mock child components
jest.mock('@/components/common/SuspenseWrapper', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);

describe('Contacts Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and description', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    );

    expect(screen.getByText('مدیریت مخاطبین')).toBeInTheDocument();
    expect(screen.getByText('ثبت، جستجو و سازماندهی مخاطبین شما')).toBeInTheDocument();
  });

  it('has display mode toggle buttons', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /کارتی/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /لیستی/i })).toBeInTheDocument();
  });

  it('toggles between grid and list display modes', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    );

    // Initially should be in grid mode (active)
    const gridButton = screen.getByRole('button', { name: /کارتی/i });
    const listButton = screen.getByRole('button', { name: /لیستی/i });
    
    expect(gridButton).toHaveClass('bg-blue-500');
    expect(listButton).not.toHaveClass('bg-blue-500');

    // Click list button
    fireEvent.click(listButton);
    
    // Now list mode should be active
    expect(listButton).toHaveClass('bg-blue-500');
    expect(gridButton).not.toHaveClass('bg-blue-500');

    // Click grid button
    fireEvent.click(gridButton);
    
    // Now grid mode should be active again
    expect(gridButton).toHaveClass('bg-blue-500');
    expect(listButton).not.toHaveClass('bg-blue-500');
  });

  it('navigates to add contact page when add button is clicked', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /افزودن مخاطب جدید/i });
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/add-contact');
  });
});