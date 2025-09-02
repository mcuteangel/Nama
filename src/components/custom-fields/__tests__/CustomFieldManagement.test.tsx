import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomFieldManagement from '../CustomFieldManagement';

// Mock the necessary hooks and components
vi.mock('@/integrations/supabase/auth', () => ({
  useSession: () => ({
    session: { user: { id: 'test-user-id' } },
    isLoading: false
  })
}));

vi.mock('@/services/custom-field-template-service', () => ({
  CustomFieldTemplateService: {
    getAllCustomFieldTemplates: vi.fn().mockResolvedValue({
      data: [],
      error: null
    }),
    deleteCustomFieldTemplate: vi.fn().mockResolvedValue({
      success: true,
      error: null
    })
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('CustomFieldManagement', () => {
  it('renders without crashing', () => {
    render(<CustomFieldManagement />);
    expect(screen.getByText('custom_field_management.title')).toBeInTheDocument();
  });
});