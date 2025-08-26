import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility, useKeyboardShortcut } from './AccessibilityProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  scope?: 'global' | 'contacts' | 'forms' | 'modal';
  category: 'navigation' | 'actions' | 'accessibility' | 'search';
}

interface KeyboardNavigationHandlerProps {
  children: React.ReactNode;
  scope?: 'global' | 'contacts' | 'forms' | 'modal';
}

export const KeyboardNavigationHandler: React.FC<KeyboardNavigationHandlerProps> = ({ 
  children, 
  scope = 'global' 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { announce, focusElement } = useAccessibility();
  
  // Refs for managing focus
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);
  
  // State for shortcut help modal
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  // Find focusable elements
  const findFocusableElements = useCallback((container: HTMLElement = document.body) => {
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[];
  }, []);

  // Navigation shortcuts
  const navigationShortcuts: KeyboardShortcut[] = [
    {
      key: 'alt+1',
      description: t('shortcuts.home', 'Go to Home'),
      action: () => {
        navigate('/');
        announce(t('shortcuts.navigated_home', 'Navigated to Home'));
      },
      category: 'navigation',
      scope: 'global'
    },
    {
      key: 'alt+2',
      description: t('shortcuts.contacts', 'Go to Contacts'),
      action: () => {
        navigate('/contacts');
        announce(t('shortcuts.navigated_contacts', 'Navigated to Contacts'));
      },
      category: 'navigation',
      scope: 'global'
    },
    {
      key: 'alt+3',
      description: t('shortcuts.add_contact', 'Add New Contact'),
      action: () => {
        navigate('/contacts/add');
        announce(t('shortcuts.navigated_add_contact', 'Navigated to Add Contact'));
      },
      category: 'navigation',
      scope: 'global'
    },
    {
      key: 'alt+4',
      description: t('shortcuts.groups', 'Go to Groups'),
      action: () => {
        navigate('/groups');
        announce(t('shortcuts.navigated_groups', 'Navigated to Groups'));
      },
      category: 'navigation',
      scope: 'global'
    },
    {
      key: 'alt+5',
      description: t('shortcuts.statistics', 'Go to Statistics'),
      action: () => {
        navigate('/statistics');
        announce(t('shortcuts.navigated_statistics', 'Navigated to Statistics'));
      },
      category: 'navigation',
      scope: 'global'
    },
    {
      key: 'alt+6',
      description: t('shortcuts.settings', 'Go to Settings'),
      action: () => {
        navigate('/settings');
        announce(t('shortcuts.navigated_settings', 'Navigated to Settings'));
      },
      category: 'navigation',
      scope: 'global'
    }
  ];

  // Search and action shortcuts
  const actionShortcuts: KeyboardShortcut[] = [
    {
      key: 'ctrl+k',
      description: t('shortcuts.search', 'Focus Search'),
      action: () => {
        searchInputRef.current = document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="جستجو"]') as HTMLInputElement;
        if (searchInputRef.current) {
          focusElement(searchInputRef.current);
          announce(t('shortcuts.search_focused', 'Search focused'));
        } else {
          toast.info(t('shortcuts.search_not_available', 'Search not available on this page'));
        }
      },
      category: 'search',
      scope: 'global'
    },
    {
      key: 'ctrl+n',
      description: t('shortcuts.new_contact', 'New Contact'),
      action: () => {
        if (location.pathname.includes('/contacts')) {
          navigate('/contacts/add');
          announce(t('shortcuts.new_contact_created', 'Creating new contact'));
        } else {
          toast.info(t('shortcuts.new_contact_not_available', 'New contact only available in contacts section'));
        }
      },
      category: 'actions',
      scope: 'contacts'
    },
    {
      key: 'ctrl+s',
      description: t('shortcuts.save', 'Save Form'),
      action: () => {
        const saveButton = document.querySelector('button[type="submit"], button[form], .save-button') as HTMLButtonElement;
        if (saveButton && !saveButton.disabled) {
          saveButton.click();
          announce(t('shortcuts.form_saved', 'Form saved'));
        } else {
          toast.info(t('shortcuts.save_not_available', 'Save not available'));
        }
      },
      category: 'actions',
      scope: 'forms'
    },
    {
      key: 'escape',
      description: t('shortcuts.close_modal', 'Close Modal/Dialog'),
      action: () => {
        const closeButton = document.querySelector('[data-dismiss="modal"], .modal-close, [aria-label*="close" i], [aria-label*="بستن"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
          announce(t('shortcuts.modal_closed', 'Modal closed'));
        }
      },
      category: 'actions',
      scope: 'modal'
    }
  ];

  // Accessibility shortcuts
  const accessibilityShortcuts: KeyboardShortcut[] = [
    {
      key: 'alt+h',
      description: t('shortcuts.help', 'Show Keyboard Shortcuts'),
      action: () => {
        setShowShortcuts(true);
        announce(t('shortcuts.help_opened', 'Keyboard shortcuts help opened'));
      },
      category: 'accessibility',
      scope: 'global'
    },
    {
      key: 'alt+m',
      description: t('shortcuts.main_content', 'Skip to Main Content'),
      action: () => {
        mainContentRef.current = document.querySelector('main, #main-content, [role="main"]') as HTMLElement;
        if (mainContentRef.current) {
          focusElement(mainContentRef.current);
          announce(t('shortcuts.main_content_focused', 'Main content focused'));
        }
      },
      category: 'accessibility',
      scope: 'global'
    },
    {
      key: 'tab',
      description: t('shortcuts.next_element', 'Next Focusable Element'),
      action: () => {
        // Tab navigation is handled natively, but we can enhance it
        const focusableElements = findFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        const nextElement = focusableElements[currentIndex + 1] || focusableElements[0];
        if (nextElement) {
          focusElement(nextElement);
        }
      },
      category: 'accessibility',
      scope: 'global'
    },
    {
      key: 'shift+tab',
      description: t('shortcuts.previous_element', 'Previous Focusable Element'),
      action: () => {
        const focusableElements = findFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        const prevElement = focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
        if (prevElement) {
          focusElement(prevElement);
        }
      },
      category: 'accessibility',
      scope: 'global'
    }
  ];

  // Contact-specific shortcuts
  const contactShortcuts: KeyboardShortcut[] = [
    {
      key: 'ctrl+e',
      description: t('shortcuts.edit_contact', 'Edit Selected Contact'),
      action: () => {
        const editButton = document.querySelector('.contact-item:focus-within .edit-button, [aria-label*="edit" i]') as HTMLButtonElement;
        if (editButton) {
          editButton.click();
          announce(t('shortcuts.contact_edit', 'Editing contact'));
        } else {
          toast.info(t('shortcuts.no_contact_selected', 'No contact selected for editing'));
        }
      },
      category: 'actions',
      scope: 'contacts'
    },
    {
      key: 'delete',
      description: t('shortcuts.delete_contact', 'Delete Selected Contact'),
      action: () => {
        const deleteButton = document.querySelector('.contact-item:focus-within .delete-button, [aria-label*="delete" i]') as HTMLButtonElement;
        if (deleteButton) {
          deleteButton.click();
          announce(t('shortcuts.contact_delete', 'Deleting contact'));
        } else {
          toast.info(t('shortcuts.no_contact_selected_delete', 'No contact selected for deletion'));
        }
      },
      category: 'actions',
      scope: 'contacts'
    },
    {
      key: 'enter',
      description: t('shortcuts.open_contact', 'Open Contact Details'),
      action: () => {
        const contactCard = document.querySelector('.contact-item:focus-within, .contact-card:focus-within') as HTMLElement;
        if (contactCard) {
          contactCard.click();
          announce(t('shortcuts.contact_opened', 'Contact details opened'));
        }
      },
      category: 'actions',
      scope: 'contacts'
    }
  ];

  // Combine all shortcuts based on scope
  const getAllShortcuts = useCallback(() => {
    const allShortcuts = [
      ...navigationShortcuts,
      ...actionShortcuts,
      ...accessibilityShortcuts,
      ...contactShortcuts
    ];

    return allShortcuts.filter(shortcut => 
      !shortcut.scope || shortcut.scope === 'global' || shortcut.scope === scope
    );
  }, [scope]);

  // Register all shortcuts
  const shortcuts = getAllShortcuts();
  
  shortcuts.forEach(shortcut => {
    useKeyboardShortcut(shortcut.key, shortcut.action, [shortcut.action]);
  });

  // Handle special keys that might conflict with form inputs
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      // Allow Ctrl+K even in input fields for search
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        const searchShortcut = shortcuts.find(s => s.key === 'ctrl+k');
        if (searchShortcut) {
          event.preventDefault();
          searchShortcut.action();
        }
      }
      
      // Prevent other shortcuts when typing in input fields
      if (isInputField && !event.ctrlKey && !event.altKey && !event.metaKey) {
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Keyboard shortcuts help modal
  const ShortcutsHelp = () => {
    if (!showShortcuts) return null;

    const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
      const category = shortcut.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
      return groups;
    }, {} as Record<string, KeyboardShortcut[]>);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 id="shortcuts-title" className="text-xl font-semibold">{t('shortcuts.title', 'Keyboard Shortcuts')}</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label={t('shortcuts.close_help', 'Close shortcuts help')}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="font-medium text-lg mb-3 capitalize">
                    {t(`shortcuts.category_${category}`, category)}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex justify-between items-center py-1">
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                          {shortcut.key.split('+').map(key => key.charAt(0).toUpperCase() + key.slice(1)).join(' + ')}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('shortcuts.tip', 'Press Alt+H anytime to view these shortcuts')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {children}
      <ShortcutsHelp />
    </>
  );
};

export default KeyboardNavigationHandler;