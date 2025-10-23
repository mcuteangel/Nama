// Types and interfaces for Contacts page modular components

export type ContactDisplayMode = 'grid' | 'list';

export type SortOption =
  | 'first_name_asc'
  | 'first_name_desc'
  | 'last_name_asc'
  | 'last_name_desc'
  | 'created_at_desc'
  | 'created_at_asc';

export interface ContactFilters {
  searchTerm: string;
  selectedGroup: string;
  companyFilter: string;
  sortOption: SortOption;
  currentPage: number;
  itemsPerPage: number;
}

export interface MultiSelectState {
  isMultiSelectMode: boolean;
  selectedContacts: Set<string>;
  showGroupSelectionDialog: boolean;
}

export interface ContactPageState extends ContactFilters, MultiSelectState {
  totalItems: number;
  displayMode: ContactDisplayMode;
  isExporting: boolean;
}

// Event handler types
export interface ContactFiltersHandlers {
  onSearchChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export interface ContactMultiSelectHandlers {
  onToggleMultiSelect: () => void;
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkGroup: () => void;
  onGroupSelected: (groupId: string) => void;
}

export interface ContactActionsHandlers {
  onAddContact: () => void;
  onExport: () => void;
}

// Component props types
export interface ContactsHeaderProps {
  className?: string;
}

export interface ContactsSearchBarProps {
  searchTerm: string;
  multiSelectMode: boolean;
  selectedContactsCount: number;
  isExporting: boolean;
  session: any; // TODO: Import proper session type
  onSearchChange: (value: string) => void;
  onToggleMultiSelect: () => void;
  onDeselectAll: () => void;
  onAddContact: () => void;
  onExport: () => void;
  onBulkDelete: () => void;
  onBulkGroup: () => void;
  className?: string;
}

export interface ContactsFiltersProps {
  selectedGroup: string;
  companyFilter: string;
  sortOption: SortOption;
  displayMode: ContactDisplayMode;
  groups: any[]; // TODO: Import proper group type
  isMobile: boolean;
  onGroupChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onDisplayModeChange: (mode: ContactDisplayMode) => void;
  className?: string;
}

export interface ContactsMultiSelectActionsProps {
  selectedContactsCount: number;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkGroup: () => void;
  className?: string;
}

export interface ContactsListContainerProps {
  searchTerm: string;
  selectedGroup: string;
  companyFilter: string;
  sortOption: SortOption;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  displayMode: ContactDisplayMode;
  multiSelectMode: boolean;
  selectedContacts: Set<string>;
  onPaginationChange: (page: number, limit: number) => void;
  onTotalChange: (total: number) => void;
  onSelectContact: (contactId: string, selected: boolean) => void;
  onSelectAll: () => void;
  className?: string;
}

export interface ContactsPaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  isMobile: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  className?: string;
}

export interface ContactsFloatingButtonProps {
  onAddContact: () => void;
  isMobile: boolean;
  className?: string;
}

export interface ContactsStatsProps {
  totalItems: number;
  className?: string;
}

export interface GroupSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupSelected: (groupId: string) => void;
  selectedContactCount: number;
}
