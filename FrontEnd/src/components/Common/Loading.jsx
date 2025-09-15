import { Card, CardContent } from '@/components/ui/card.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { 
  Database, 
  MessageSquare, 
  Loader2,
  Zap
} from 'lucide-react';

// Simple loading spinner
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

// Loading overlay for full screen
export const LoadingOverlay = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Card className="p-6">
      <CardContent className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  </div>
);

// Loading skeleton for database list
export const DatabaseListSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Loading skeleton for chat messages
export const ChatMessageSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Card>
            <CardContent className="p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ))}
  </div>
);

// Loading skeleton for query results
export const QueryResultSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="bg-muted p-3 rounded-md">
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-3 border-b">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 border-b last:border-b-0">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for database status
export const DatabaseStatusSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-8 w-8" />
    </div>
    
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Inline loading states for buttons and small components
export const InlineLoading = ({ text = "Loading...", className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

// Loading state for empty states with custom icons
export const EmptyStateLoading = ({ 
  icon: Icon = Database, 
  title = "Loading...", 
  description = "Please wait while we fetch your data" 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
    <div className="relative">
      <Icon className="h-12 w-12 text-muted-foreground" />
      <div className="absolute -bottom-1 -right-1">
        <LoadingSpinner size="sm" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
    </div>
  </div>
);

// Pulsing loading animation for cards
export const PulsingCard = ({ children, className = "" }) => (
  <Card className={`animate-pulse ${className}`}>
    <CardContent className="p-4">
      {children}
    </CardContent>
  </Card>
);

// Loading dots animation
export const LoadingDots = ({ className = "" }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// Progress loading with steps
export const StepLoading = ({ steps, currentStep, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center justify-between text-sm">
      <span>Progress</span>
      <span>{currentStep + 1} of {steps.length}</span>
    </div>
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            index < currentStep 
              ? 'bg-green-100 text-green-600' 
              : index === currentStep
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {index < currentStep ? '✓' : index + 1}
          </div>
          <span className={`text-sm ${
            index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {step}
          </span>
          {index === currentStep && (
            <LoadingSpinner size="sm" className="ml-auto" />
          )}
        </div>
      ))}
    </div>
  </div>
);
