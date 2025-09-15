import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Debounce Hook for Performance Optimization
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle Hook for Performance Optimization
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

// Intersection Observer Hook for Lazy Loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};

// Virtual Scrolling Hook for Large Lists
export const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    scrollTop
  };
};

// Memoized Component Factory
export const createMemoizedComponent = (Component, areEqual) => {
  return React.memo(Component, areEqual);
};

// Performance Monitoring Hook
export const usePerformanceMonitor = (name) => {
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const end = useCallback(() => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      startTimeRef.current = null;
      return duration;
    }
    return 0;
  }, [name]);

  return { start, end };
};

// Image Lazy Loading Component
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.svg',
  className = "",
  ...props 
}) => {
  const { targetRef, hasIntersected } = useIntersectionObserver();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <div ref={targetRef} className={`relative ${className}`}>
      {hasIntersected && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
      {!isLoaded && hasIntersected && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
    </div>
  );
};

// Optimized Search Hook with Debouncing
export const useOptimizedSearch = (items, searchFields, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items;

    const lowercaseSearch = debouncedSearchTerm.toLowerCase();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(lowercaseSearch);
      });
    });
  }, [items, searchFields, debouncedSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm
  };
};

// Batch Processing Hook for Large Operations
export const useBatchProcessor = (batchSize = 100, delay = 10) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processBatch = useCallback(async (items, processor) => {
    setIsProcessing(true);
    setProgress(0);

    const results = [];
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);

      const currentBatch = Math.floor(i / batchSize) + 1;
      setProgress((currentBatch / totalBatches) * 100);

      // Allow UI to update between batches
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsProcessing(false);
    setProgress(100);
    return results;
  }, [batchSize, delay]);

  return {
    processBatch,
    isProcessing,
    progress
  };
};

// Memory Usage Monitor Hook
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

// Optimized Event Handler Hook
export const useOptimizedEventHandler = (handler, dependencies = []) => {
  return useCallback(handler, dependencies);
};

// Component Preloader for Code Splitting
export const preloadComponent = (componentImport) => {
  return componentImport();
};

// Resource Preloader Hook
export const useResourcePreloader = () => {
  const preloadedResources = useRef(new Set());

  const preloadImage = useCallback((src) => {
    if (preloadedResources.current.has(src)) return;

    const img = new Image();
    img.src = src;
    preloadedResources.current.add(src);
  }, []);

  const preloadFont = useCallback((fontUrl) => {
    if (preloadedResources.current.has(fontUrl)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    preloadedResources.current.add(fontUrl);
  }, []);

  return {
    preloadImage,
    preloadFont
  };
};

// Performance Budget Monitor
export const usePerformanceBudget = (budgets = {}) => {
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    const checkBudgets = () => {
      const newViolations = [];

      // Check FCP (First Contentful Paint)
      if (budgets.fcp && 'getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry && fcpEntry.startTime > budgets.fcp) {
          newViolations.push({
            metric: 'FCP',
            value: fcpEntry.startTime,
            budget: budgets.fcp
          });
        }
      }

      // Check bundle size
      if (budgets.bundleSize && 'getEntriesByType' in performance) {
        const resourceEntries = performance.getEntriesByType('resource');
        const totalSize = resourceEntries.reduce((total, entry) => {
          return total + (entry.transferSize || 0);
        }, 0);
        
        if (totalSize > budgets.bundleSize) {
          newViolations.push({
            metric: 'Bundle Size',
            value: totalSize,
            budget: budgets.bundleSize
          });
        }
      }

      setViolations(newViolations);
    };

    // Check budgets after page load
    if (document.readyState === 'complete') {
      checkBudgets();
    } else {
      window.addEventListener('load', checkBudgets);
      return () => window.removeEventListener('load', checkBudgets);
    }
  }, [budgets]);

  return violations;
};

// Optimized State Update Hook
export const useOptimizedState = (initialState) => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  const optimizedSetState = useCallback((newState) => {
    if (typeof newState === 'function') {
      setState(prevState => {
        const nextState = newState(prevState);
        stateRef.current = nextState;
        return nextState;
      });
    } else {
      if (JSON.stringify(newState) !== JSON.stringify(stateRef.current)) {
        setState(newState);
        stateRef.current = newState;
      }
    }
  }, []);

  return [state, optimizedSetState];
};
