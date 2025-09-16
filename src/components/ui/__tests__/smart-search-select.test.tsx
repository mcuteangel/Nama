import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartSearchSelect } from '../smart-search-select';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
  }),
}));

describe('SmartSearchSelect', () => {
  const mockOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3', keywords: ['three', 'third'] },
  ];

  const mockOnValueChange = jest.fn();

  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders with placeholder', () => {
    render(
      <SmartSearchSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
        placeholder="Select an option"
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('displays options when opened', async () => {
    render(
      <SmartSearchSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
      />
    );

    // Click to open the dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Check that options are displayed
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  it('filters options based on search term', async () => {
    render(
      <SmartSearchSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
      />
    );

    // Click to open the dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Type in search input
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Option 1' } });
    
    // Check that only matching options are displayed
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });
  });

  it('calls onValueChange when an option is selected', async () => {
    render(
      <SmartSearchSelect
        options={mockOptions}
        onValueChange={mockOnValueChange}
      />
    );

    // Click to open the dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Click on an option
    await waitFor(() => {
      fireEvent.click(screen.getByText('Option 1'));
    });
    
    expect(mockOnValueChange).toHaveBeenCalledWith('1');
  });
});