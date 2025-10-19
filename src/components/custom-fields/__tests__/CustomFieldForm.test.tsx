import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CustomFieldForm from '../CustomFieldForm';

// Mock the necessary hooks and components
vi.mock('@/integrations/supabase/auth', () => ({
  useSession: () => ({
    session: { user: { id: 'test-user-id' } },
    isLoading: false
  })
}));

vi.mock('@/services/custom-field-template-service', () => ({
  CustomFieldTemplateService: {
    addCustomFieldTemplate: vi.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    updateCustomFieldTemplate: vi.fn().mockResolvedValue({
      data: {},
      error: null
    })
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('react-hook-form', () => ({
  ...vi.importActual('react-hook-form'),
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    watch: vi.fn(),
    reset: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    formState: {
      errors: {}
    }
  })
}));

describe('CustomFieldForm', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CustomFieldForm />
      </MemoryRouter>
    );
    expect(screen.getByText('custom_field_template.add_title')).toBeInTheDocument();
  });
});