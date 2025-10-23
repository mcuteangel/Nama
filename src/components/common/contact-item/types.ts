import { GenderDisplay } from '@/types/contact.types';

export interface CheckboxStyle {
  base: string;
  unselected: string;
  selected: string;
  checkIcon: string;
  checkMark: string;
  checkMarkSelected: string;
}

export interface ContactDisplayData {
  displayPhoneNumber: string;
  displayEmail?: string;
  displayPosition?: string;
  displayCompany?: string;
  displayAddress?: string;
  displayGroups: Array<{
    name: string;
    color?: string;
  }>;
  fullName: string;
  avatarFallback: string;
  displayGender: GenderDisplay;
  displayMode?: 'grid' | 'list';
}

export interface ContactItemProps {
  contact: {
    id: string;
    avatar_url?: string | null;
    first_name?: string;
    last_name?: string;
    phone_numbers: Array<{ phone_number: string }>;
    email_addresses: Array<{ email_address: string }>;
    position?: string;
    company?: string;
    city?: string;
    state?: string;
    country?: string;
    gender?: 'male' | 'female' | null;
    contact_groups?: Array<{
      groups: Array<{ name: string; color?: string }>;
    }>;
  };
  onContactDeleted: (id: string) => void;
  onContactEdited: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
  multiSelect?: boolean;
  isSelected?: boolean;
  onSelect?: (contactId: string, selected: boolean) => void;
  displayMode?: 'grid' | 'list';
}

export interface GestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchStart?: (scale: number) => void;
  onPinch?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;
  onTap?: (position: { x: number; y: number }) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  onDragStart?: () => void;
  onDrag?: (offset: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}
