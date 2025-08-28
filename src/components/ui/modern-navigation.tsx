import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface ModernNavigationProps {
  items: NavigationItem[];
  variant?: 'floating' | 'glass' | 'minimal' | 'sidebar';
  position?: 'top' | 'bottom' | 'left' | 'right';
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * ModernNavigation - Navigation مدرن با انیمیشن‌ها
 * @param items - آیتم‌های Navigation
 * @param variant - نوع ظاهری
 * @param position - موقعیت Navigation
 * @param logo - لوگو
 * @param actions - اکشن‌های اضافی
 */
export function ModernNavigation({
  items,
  variant = 'glass',
  position = 'top',
  logo,
  actions,
  className
}: ModernNavigationProps) {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // پیدا کردن آیتم فعال
  useEffect(() => {
    const currentIndex = items.findIndex(item => location.pathname === item.href);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname, items]);

  // محاسبه موقعیت indicator
  useEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      if (variant === 'floating' || variant === 'glass') {
        setIndicatorStyle({
          width: itemRect.width,
          height: itemRect.height,
          transform: `translateX(${itemRect.left - navRect.left}px)`,
        });
      }
    }
  }, [activeIndex, variant]);

  const variants = {
    floating: 'glass-advanced fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl',
    glass: 'glass-card w-full backdrop-blur-md border-b border-border/50',
    minimal: 'bg-background border-b border-border',
    sidebar: 'glass-card h-screen w-64 fixed left-0 top-0 z-40 border-r border-border/50'
  };

  const positions = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0'
  };

  const isHorizontal = position === 'top' || position === 'bottom';
  const isSidebar = variant === 'sidebar';

  return (
    <nav
      ref={navRef}
      className={cn(
        variants[variant],
        !isSidebar && positions[position],
        'fade-in-down',
        className
      )}
    >
      <div className={cn(
        'flex items-center',
        isSidebar ? 'flex-col space-y-2 p-4' : isHorizontal ? 'justify-between' : 'flex-col'
      )}>
        {/* Logo */}
        {logo && (
          <div className="flex-shrink-0 fade-in-left">
            {logo}
          </div>
        )}

        {/* Navigation Items */}
        <div className={cn(
          'relative flex',
          isSidebar ? 'flex-col space-y-1 w-full' : 'items-center space-x-6'
        )}>
          {/* Active Indicator */}
          {(variant === 'floating' || variant === 'glass') && !isSidebar && (
            <div
              className="absolute inset-y-0 bg-primary/10 dark:bg-primary/20 rounded-lg transition-all duration-300 ease-out"
              style={indicatorStyle}
            />
          )}

          {items.map((item, index) => (
            <NavigationItem
              key={item.href}
              ref={el => itemRefs.current[index] = el}
              item={item}
              isActive={activeIndex === index}
              isSidebar={isSidebar}
              onHover={() => {
                if (variant === 'floating' || variant === 'glass') {
                  setActiveIndex(index);
                }
              }}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex-shrink-0 fade-in-right">
            {actions}
          </div>
        )}
      </div>
    </nav>
  );
}

interface NavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isSidebar: boolean;
  onHover?: () => void;
  delay?: number;
}

const NavigationItem = React.forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ item, isActive, isSidebar, onHover }, ref) => {
    return (
      <div className={`stagger-item hover:scale-105 transition-transform duration-200`}>
        <Link
          ref={ref}
          to={item.href}
          className={cn(
            'relative flex items-center transition-all duration-300 group ripple',
            isSidebar ? 'w-full px-3 py-2 rounded-lg' : 'px-3 py-2 rounded-lg text-sm font-medium',
            isActive 
              ? 'text-primary bg-primary/10 dark:bg-primary/20' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          onMouseEnter={onHover}
          aria-disabled={item.disabled}
        >
          {/* Icon */}
          {item.icon && (
            <span className={cn(
              'flex-shrink-0 transition-transform duration-300',
              isSidebar ? 'mr-3 rtl:mr-0 rtl:ml-3' : 'mr-2 rtl:mr-0 rtl:ml-2',
              'group-hover:scale-110'
            )}>
              {item.icon}
            </span>
          )}

          {/* Label */}
          <span className={cn(
            'transition-colors duration-300',
            isSidebar ? 'text-sm' : 'text-sm'
          )}>
            {item.label}
          </span>

          {/* Badge */}
          {item.badge && (
            <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full scale-in rtl:ml-0 rtl:mr-2">
              {item.badge}
            </span>
          )}

          {/* Ripple Effect */}
          <span className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-20 bg-current transition-opacity duration-150" />
        </Link>
      </div>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

export interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  separator?: React.ReactNode;
  className?: string;
}

/**
 * ModernBreadcrumb - مسیریاب مدرن
 */
export function ModernBreadcrumb({ 
  items, 
  separator = '/', 
  className 
}: BreadcrumbProps) {
  return (
    <nav aria-label="مسیریاب" className={cn('flex items-center space-x-2 rtl:space-x-reverse', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className={`fade-in-left stagger-item`}>
            {item.href ? (
              <Link
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium text-sm">
                {item.label}
              </span>
            )}
          </div>

          {index < items.length - 1 && (
            <span className={`text-muted-foreground text-sm fade-in-right stagger-item`}>
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * ModernTabs - تب‌های مدرن با انیمیشن
 */
export function ModernTabs({ 
  tabs, 
  defaultTab, 
  variant = 'default',
  className,
  onTabChange 
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [tabIndicator, setTabIndicator] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isRTLRef = useRef(false);
  
  // Function to update the tab indicator
  const updateTabIndicator = React.useCallback(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    
    if (activeTabElement && tabsRef.current) {
      const tabsRect = tabsRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      // Calculate a more accurate position for RTL
      const isRTL = isRTLRef.current;
      
      let position;
      let width = tabRect.width;
      
      if (isRTL) {
        // In RTL: measure from the right edge of the container
        position = tabsRect.right - tabRect.right;
        
        // Ensure the indicator stays within the container
        if (position < 0) position = 0;
        if (position + width > tabsRect.width) width = tabsRect.width - position;
      } else {
        // In LTR: measure from the left edge (standard)
        position = tabRect.left - tabsRect.left;
        
        // Ensure the indicator stays within the container
        if (position < 0) position = 0;
        if (position + width > tabsRect.width) width = tabsRect.width - position;
      }
      
      setTabIndicator({
        width: width,
        height: variant === 'underline' ? 2 : tabRect.height,
        transform: `translateX(${position}px)`,
        // Add additional styles to ensure visibility
        zIndex: 0,
        pointerEvents: 'none',
      });
      
      // Force a repaint
      setTimeout(() => {
        const el = tabsRef.current;
        if (el) el.style.transform = 'translateZ(0)';
      }, 0);
    }
  }, [activeTab, variant, tabs]);

  // Track RTL changes
  useEffect(() => {
    const handleDirChange = () => {
      isRTLRef.current = document.documentElement.dir === 'rtl';
      updateTabIndicator();
    };
    
    // Initial check
    isRTLRef.current = document.documentElement.dir === 'rtl';
    
    // Set up observer for direction changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          handleDirChange();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [updateTabIndicator]);
  
  // Update indicator when active tab changes
  useEffect(() => {
    updateTabIndicator();
  }, [activeTab, updateTabIndicator]);
  
  // Update indicator when tabs change
  useEffect(() => {
    updateTabIndicator();
  }, [tabs, updateTabIndicator]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const variants = {
    default: 'bg-muted rounded-lg p-1',
    pills: 'space-x-2 rtl:space-x-reverse',
    underline: 'border-b border-border'
  };

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div
        ref={tabsRef}
        className={cn('relative flex', variants[variant], variant)}
      >
        {/* Tab Indicator */}
        <div
          className={cn(
            'absolute transition-all duration-300 ease-out tab-indicator',
            variant === 'default' && 'bg-background rounded-md shadow-sm',
            variant === 'pills' && 'bg-primary rounded-lg',
            variant === 'underline' && 'bg-primary bottom-0 rounded-t'
          )}
          style={tabIndicator}
        />

        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap hover:scale-105 rtl-tab-button',
              variant === 'default' && 'rounded-md',
              variant === 'pills' && 'rounded-lg',
              variant === 'underline' && 'border-b-2 border-transparent',
              activeTab === tab.id
                ? variant === 'pills'
                  ? 'text-primary-foreground active-tab'
                  : 'text-foreground active-tab'
                : 'text-muted-foreground hover:text-foreground'
            )}
            data-state={activeTab === tab.id ? 'active' : 'inactive'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <div 
          className={`fade-in-up transition-all duration-300 tab-content`} 
          key={activeTab}
          style={{ 
            direction: isRTLRef.current ? 'rtl' : 'ltr',
            textAlign: isRTLRef.current ? 'right' : 'left'
          }}
        >
          {activeContent}
        </div>
      </div>
    </div>
  );
}
