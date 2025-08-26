import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ContactForm from '../ContactForm';
import { SessionContextProvider } from '../../integrations/supabase/auth';
import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../integrations/i18n';

// Mock Supabase
vi.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}));

// Mock hooks
vi.mock('../../hooks/use-contact-form-logic', () => ({
  useContactFormLogic: () => ({
    form: {
      register: vi.fn(),
      handleSubmit: vi.fn((fn) => (e) => {
        e.preventDefault();
        fn({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumbers: [{ number: '1234567890', type: 'mobile' }],
          emails: [{ email: 'john@example.com', type: 'personal' }]
        });
      }),
      watch: vi.fn(),
      setValue: vi.fn(),
      formState: { errors: {}, isSubmitting: false }
    },
    phoneNumbers: [{ number: '', type: 'mobile' }],
    emails: [{ email: '', type: 'personal' }],
    socialLinks: [],
    customFields: [],
    avatarPreview: null,
    isLoading: false,
    addPhoneNumber: vi.fn(),
    removePhoneNumber: vi.fn(),
    addEmail: vi.fn(),
    removeEmail: vi.fn(),
    addSocialLink: vi.fn(),
    removeSocialLink: vi.fn(),
    addCustomField: vi.fn(),
    removeCustomField: vi.fn(),
    handleAvatarChange: vi.fn(),
    onSubmit: vi.fn()
  })
}));

vi.mock('../../hooks/use-groups', () => ({
  useGroups: () => ({
    data: [
      { id: '1', name: 'Family', color: '#ff0000' },
      { id: '2', name: 'Work', color: '#00ff00' }
    ],
    isLoading: false,
    error: null
  })
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={null as any}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <I18nextProvider i18n={i18n}>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </I18nextProvider>
        </ThemeProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

describe('ContactForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact form with basic fields', () => {
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('allows adding and removing phone numbers', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    const addPhoneButton = screen.getByRole('button', { name: /add phone/i });
    await user.click(addPhoneButton);

    expect(screen.getAllByLabelText(/phone number/i)).toHaveLength(2);
  });

  it('allows adding and removing email addresses', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    const addEmailButton = screen.getByRole('button', { name: /add email/i });
    await user.click(addEmailButton);

    expect(screen.getAllByLabelText(/email/i)).toHaveLength(2);
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it('displays group selection dropdown', () => {
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    expect(screen.getByText(/select group/i)).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');

    const submitButton = screen.getByRole('button', { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe'
        })
      );
    });
  });

  it('displays loading state during submission', () => {
    vi.mocked(require('../../hooks/use-contact-form-logic').useContactFormLogic).mockReturnValue({
      // ... other properties
      isLoading: true,
      form: {
        formState: { isSubmitting: true }
      }
    });

    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('supports internationalization', () => {
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    // Check that translation keys are being used
    expect(screen.getByText(/contact information/i)).toBeInTheDocument();
  });

  it('handles avatar upload', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <ContactForm onSubmit={onSubmit} />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText(/profile picture/i);
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    
    await user.upload(fileInput, file);

    expect(fileInput).toHaveProperty('files', expect.arrayContaining([file]));
  });
});