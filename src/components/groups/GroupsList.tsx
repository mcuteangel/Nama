import React, { useMemo } from "react";
import { ModernGrid } from "@/components/ui/modern-grid";
import { Users } from "lucide-react";
import EmptyState from '../common/EmptyState';
import GroupItem from './GroupItem';
import GroupListItem from './GroupListItem';
import { useTranslation } from 'react-i18next';

interface Group {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

interface GroupsListProps {
  /** Search term to filter groups */
  searchTerm: string;
  /** Selected color to filter groups */
  selectedColor: string;
  /** Sort option for group ordering */
  sortOption: string;
  /** Display mode for groups: 'grid' or 'list' */
  displayMode?: 'grid' | 'list';
  /** Groups data */
  groups: Group[];
}

/**
 * Simple GroupsList component that handles both regular and list rendering
 * based on the display mode
 */
const GroupsList: React.FC<GroupsListProps> = ({
  searchTerm,
  selectedColor,
  sortOption,
  displayMode = 'grid',
  groups
}) => {
  const { t } = useTranslation();

  // Filter and sort groups based on props
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesColor = !selectedColor || group.color === selectedColor;
      return matchesSearch && matchesColor;
    });

    // Sort groups
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created_at_desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'created_at_asc':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [groups, searchTerm, selectedColor, sortOption]);

  // Memoize the groups list rendering to prevent unnecessary re-renders
  const groupsListContent = useMemo(() => {
    if (filteredAndSortedGroups.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title={t('empty_states.no_groups_found')}
          description={t('empty_states.add_first_group')}
        />
      );
    }

    // Use list view when displayMode is 'list'
    if (displayMode === 'list') {
      return (
        <div className="w-full space-y-3 sm:space-y-4 px-0">
          {filteredAndSortedGroups.map((group) => (
            <GroupListItem
              key={group.id}
              group={group}
            />
          ))}
        </div>
      );
    }

    // Use regular grid for datasets
    return (
      <ModernGrid
        cols={1}
        gap="sm"
        className="w-full"
      >
        {filteredAndSortedGroups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
          />
        ))}
      </ModernGrid>
    );
  }, [filteredAndSortedGroups, displayMode, t]);

  return (
    <div className="space-y-2 sm:space-y-4 w-full px-0">
      {groupsListContent}
    </div>
  );
};

export default GroupsList;
