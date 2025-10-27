import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-performance';
import type { ContactFilters, SortOption } from '@/types/contact-page.types';

interface UseContactsFiltersProps {
  initialSearchTerm?: string;
  initialSelectedGroup?: string;
  initialCompanyFilter?: string;
  initialSortOption?: SortOption;
  initialCurrentPage?: number;
  initialItemsPerPage?: number;
}

export const useContactsFilters = ({
  initialSearchTerm = '',
  initialSelectedGroup = '',
  initialCompanyFilter = '',
  initialSortOption = 'last_name_asc' as SortOption,
  initialCurrentPage = 1,
  initialItemsPerPage = 20,
}: UseContactsFiltersProps = {}) => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedGroup, setSelectedGroup] = useState(initialSelectedGroup);
  const [companyFilter, setCompanyFilter] = useState(initialCompanyFilter);
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Debounce search terms for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedCompanyFilter = useDebounce(companyFilter, 300);

  // Memoize filter values to prevent unnecessary re-renders
  const filterValues: ContactFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    selectedGroup,
    companyFilter: debouncedCompanyFilter,
    sortOption,
    currentPage,
    itemsPerPage,
  }), [debouncedSearchTerm, selectedGroup, debouncedCompanyFilter, sortOption, currentPage, itemsPerPage]);

  // Handler functions
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setSelectedGroup(value === 'all' ? '' : value);
    setCurrentPage(1); // Reset to first page when group changes
  }, []);

  const handleCompanyChange = useCallback((value: string) => {
    setCompanyFilter(value);
    setCurrentPage(1); // Reset to first page when company filter changes
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page when sort changes
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when items per page changes
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGroup('');
    setCompanyFilter('');
    setSortOption('last_name_asc');
    setCurrentPage(1);
    setItemsPerPage(20);
  }, []);

  return {
    // State values
    searchTerm,
    selectedGroup,
    companyFilter,
    sortOption,
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    debouncedCompanyFilter,
    filterValues,

    // Handlers
    handleSearchChange,
    handleGroupChange,
    handleCompanyChange,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    resetFilters,
  };
};
