import { useEffect, useRef } from 'react';

// Screen Reader Only Text Component
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
);

// Skip Link Component for Keyboard Navigation
export const SkipLink = ({ href, children }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
  >
    {children}
  </a>
);

// Focus Trap Hook for Modal Dialogs
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        // Let parent components handle escape
        const escapeEvent = new CustomEvent('focustrap:escape', { bubbles: true });
        container.dispatchEvent(escapeEvent);
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);
    
    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};

// Announce Component for Dynamic Content Changes
export const LiveRegion = ({ 
  children, 
  politeness = 'polite', 
  atomic = false,
  className = ""
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    className={`sr-only ${className}`}
  >
    {children}
  </div>
);

// Keyboard Navigation Hook
export const useKeyboardNavigation = (items, onSelect) => {
  const activeIndexRef = useRef(-1);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndexRef.current = Math.min(activeIndexRef.current + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        activeIndexRef.current = 0;
        break;
      case 'End':
        e.preventDefault();
        activeIndexRef.current = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndexRef.current >= 0 && items[activeIndexRef.current]) {
          onSelect(items[activeIndexRef.current], activeIndexRef.current);
        }
        break;
      default:
        return;
    }
  };

  return {
    activeIndex: activeIndexRef.current,
    handleKeyDown,
    setActiveIndex: (index) => {
      activeIndexRef.current = index;
    }
  };
};

// ARIA Describedby Hook for Form Fields
export const useAriaDescribedBy = (baseId, conditions = {}) => {
  const ids = [];
  
  Object.entries(conditions).forEach(([key, isActive]) => {
    if (isActive) {
      ids.push(`${baseId}-${key}`);
    }
  });

  return ids.length > 0 ? ids.join(' ') : undefined;
};

// High Contrast Detection Hook
export const useHighContrast = () => {
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  return isHighContrast;
};

// Reduced Motion Detection Hook
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion;
};

// Focus Management Hook
export const useFocusManagement = () => {
  const previousFocusRef = useRef(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus();
    }
  };

  const focusElement = (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  };

  return {
    saveFocus,
    restoreFocus,
    focusElement
  };
};

// Accessible Button Component with Enhanced Keyboard Support
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = "",
  variant = "default",
  ...props 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible Form Field Component
export const AccessibleFormField = ({
  id,
  label,
  error,
  hint,
  required = false,
  children,
  className = ""
}) => {
  const describedBy = useAriaDescribedBy(id, {
    error: !!error,
    hint: !!hint
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': !!error,
        'aria-required': required
      })}
      
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Modal Component
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = "" 
}) => {
  const focusTrapRef = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      restoreFocus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, saveFocus, restoreFocus]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-lg font-semibold mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};
