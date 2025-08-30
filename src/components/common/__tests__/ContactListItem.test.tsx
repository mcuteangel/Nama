import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactListItem } from '../ContactListItem';
import { BrowserRouter } from 'react-router-dom';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the ContactCrudService
jest.mock('@/services/contact-crud-service', () => ({
  ContactCrudService: {
    deleteContact: jest.fn().mockResolvedValue({ error: null }),
  },
}));

// Mock the useErrorHandler hook
jest.mock('@/hooks/use-error-handler', () => ({
  useErrorHandler: () => ({
    isLoading: false,
    executeAsync: (fn: any) => fn(),
  }),
}));

// Mock the ErrorManager
jest.mock('@/lib/error-manager', () => ({
  ErrorManager: {
    notifyUser: jest.fn(),
    logError: jest.fn(),
  },
}));

describe('ContactListItem', () => {
  const mockContact = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    gender: 'male',
    phone_numbers: [
      {
        id: '1',
        phone_number: '123-456-7890',
        phone_type: 'mobile',
      },
    ],
    email_addresses: [
      {
        id: '1',
        email_address: 'john.doe@example.com',
        email_type: 'work',
      },
    ],
  };

  const mockProps = {
    contact: mockContact,
    onContactDeleted: jest.fn(),
    onContactEdited: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <BrowserRouter>
        <ContactListItem {...mockProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('navigates to contact detail when clicked', () => {
    render(
      <BrowserRouter>
        <ContactListItem {...mockProps} />
      </BrowserRouter>
    );

    const contactItem = screen.getByText('John Doe').closest('div');
    fireEvent.click(contactItem!);

    expect(mockNavigate).toHaveBeenCalledWith('/contacts/1');
  });

  it('calls onContactEdited when edit button is clicked', () => {
    render(
      <BrowserRouter>
        <ContactListItem {...mockProps} />
      </BrowserRouter>
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockProps.onContactEdited).toHaveBeenCalledWith('1');
    expect(mockNavigate).toHaveBeenCalledWith('/contacts/edit/1');
  });
});
