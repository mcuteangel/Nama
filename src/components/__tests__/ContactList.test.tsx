import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactList from '../ContactList';
import { BrowserRouter } from 'react-router-dom';

// Mock the useSession hook
jest.mock('@/integrations/supabase/auth', () => ({
  useSession: () => ({
    session: { user: { id: 'user1' } },
    isLoading: false,
  }),
}));

// Mock the useErrorHandler hook
jest.mock('@/hooks/use-error-handler', () => ({
  useErrorHandler: () => ({
    isLoading: false,
    executeAsync: (fn: any) => fn(),
  }),
}));

// Mock the fetchWithCache function
jest.mock('@/utils/cache-helpers', () => ({
  fetchWithCache: jest.fn().mockResolvedValue({
    data: [
      {
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
      },
    ],
    error: null,
    fromCache: false,
  }),
  invalidateCache: jest.fn(),
}));

// Mock the ContactListService
jest.mock('@/services/contact-list-service', () => ({
  ContactListService: {
    getFilteredContacts: jest.fn().mockResolvedValue({
      data: [
        {
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
        },
      ],
      error: null,
    }),
  },
}));

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the useIsMobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Mock child components
jest.mock('../common/EmptyState', () => () => <div data-testid="empty-state">Empty State</div>);
jest.mock('../common/ContactItem', () => () => <div data-testid="contact-item">Contact Item</div>);
jest.mock('../common/ContactListItem', () => () => <div data-testid="contact-list-item">Contact List Item</div>);
jest.mock('../VirtualizedContactList', () => () => <div data-testid="virtualized-contact-list">Virtualized Contact List</div>);

describe('ContactList', () => {
  const mockProps = {
    searchTerm: '',
    selectedGroup: '',
    companyFilter: '',
    sortOption: 'last_name_asc',
  };

  it('renders contacts in grid mode by default', async () => {
    render(
      <BrowserRouter>
        <ContactList {...mockProps} />
      </BrowserRouter>
    );

    // Wait for the component to load
    expect(await screen.findByTestId('contact-item')).toBeInTheDocument();
  });

  it('renders contacts in list mode when displayMode is list', async () => {
    render(
      <BrowserRouter>
        <ContactList {...mockProps} displayMode="list" />
      </BrowserRouter>
    );

    // Wait for the component to load
    expect(await screen.findByTestId('contact-list-item')).toBeInTheDocument();
  });
});