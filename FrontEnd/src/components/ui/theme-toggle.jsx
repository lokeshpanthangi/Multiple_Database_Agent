import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../../hooks/useAppState.jsx';
import { cn } from '@/lib/utils';

export const ThemeToggle = ({ className, size = "sm", variant = "ghost" }) => {
  const { settings, toggleTheme } = useSettings();
  const [isAnimating, setIsAnimating] = useState(false);
  const isDark = settings.theme === 'dark';

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "relative overflow-hidden transition-all duration-300 ease-in-out",
        "hover:scale-105 active:scale-95",
        "focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        size === "sm" ? "h-8 w-8 p-0" : "h-10 w-10 p-0",
        className
      )}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          className={cn(
            "absolute transition-all duration-300 ease-in-out",
            size === "sm" ? "h-4 w-4" : "h-5 w-5",
            isDark 
              ? "opacity-0 rotate-90 scale-0" 
              : "opacity-100 rotate-0 scale-100",
            isAnimating && "animate-spin"
          )}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={cn(
            "absolute transition-all duration-300 ease-in-out",
            size === "sm" ? "h-4 w-4" : "h-5 w-5",
            isDark 
              ? "opacity-100 rotate-0 scale-100" 
              : "opacity-0 -rotate-90 scale-0",
            isAnimating && "animate-pulse"
          )}
        />
        
        {/* Animated Background Glow */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-300 ease-in-out",
            "bg-gradient-to-r opacity-0 blur-sm",
            isDark 
              ? "from-blue-400/20 to-purple-400/20" 
              : "from-yellow-400/20 to-orange-400/20",
            isAnimating && "opacity-100 animate-pulse"
          )}
        />
      </div>
      
      {/* Ripple Effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500 ease-out",
          "bg-current opacity-0 scale-0",
          isAnimating && "opacity-10 scale-150"
        )}
      />
    </Button>
  );
};

export default ThemeToggle;