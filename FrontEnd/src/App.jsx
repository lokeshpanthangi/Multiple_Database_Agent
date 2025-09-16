import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Database, 
  Settings as SettingsIcon, 
  HelpCircle, 
  History,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './components/ui/theme-toggle.jsx';

// Import components
import { SetupPage } from './components/Setup/SetupPage.jsx';
import { ChatInterface } from './components/Chat/ChatInterface.jsx';
import { Sidebar } from './components/Sidebar/Sidebar.jsx';
import { Settings } from './components/Sidebar/Settings.jsx';
import { QueryHistory } from './components/Common/QueryHistory.jsx';
import { Help } from './components/Common/Help.jsx';
import { LoadingOverlay } from './components/Common/Loading.jsx';

// Import hooks and providers
import { AppStateProvider, useAppState } from './hooks/useAppState.jsx';

import './App.css';

// Main application component
const AppContent = () => {
  const { state, actions, computed } = useAppState();
  const [currentView, setCurrentView] = useState('chat'); // chat, setup, settings, history, help
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-show setup if no databases are connected
  useEffect(() => {
    if (state.databases.length === 0 && currentView === 'chat') {
      setCurrentView('setup');
    }
  }, [state.databases.length, currentView]);

  const handleAddDatabase = () => {
    setCurrentView('setup');
    if (isMobile) {
      actions.toggleSidebar();
    }
  };

  const handleSetupComplete = (database) => {
    setCurrentView('chat');
    // Show success message
    setTimeout(() => {
      actions.setError(null);
    }, 3000);
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
    if (isMobile) {
      actions.toggleSidebar();
    }
  };

  const handleOpenHistory = () => {
    setCurrentView('history');
    if (isMobile) {
      actions.toggleSidebar();
    }
  };

  const handleOpenHelp = () => {
    setCurrentView('help');
    if (isMobile) {
      actions.toggleSidebar();
    }
  };

  const handleExecuteQuery = (query) => {
    setCurrentView('chat');
    // In a real app, this would send the query to the chat interface
    console.log('Execute query:', query);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'setup':
        return (
          <SetupPage
            onComplete={handleSetupComplete}
            onCancel={() => setCurrentView('chat')}
          />
        );
      
      case 'settings':
        return (
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <Settings onClose={() => setCurrentView('chat')} />
          </div>
        );
      
      case 'history':
        return (
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <QueryHistory onExecuteQuery={handleExecuteQuery} />
          </div>
        );
      
      case 'help':
        return (
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <Help />
          </div>
        );
      
      case 'chat':
      default:
        return <ChatInterface />;
    }
  };

  const renderMobileHeader = () => {
    if (!isMobile) return null;

    return (
      <div className="md:hidden bg-background border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.toggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Database className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">SQL Agent</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <ThemeToggle size="sm" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenHistory}
            className="h-8 w-8 p-0"
            title="Query History"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenHelp}
            className="h-8 w-8 p-0"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenSettings}
            className="h-8 w-8 p-0"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      {renderMobileHeader()}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onAddDatabase={handleAddDatabase}
          onOpenSettings={handleOpenSettings}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Navigation */}
          {!isMobile && currentView !== 'chat' && (
            <div className="border-b bg-background/95 backdrop-blur-sm px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView('chat')}
                  >
                    ← Back to Chat
                  </Button>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex gap-2">
                    <Button
                      variant={currentView === 'history' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={handleOpenHistory}
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                    <Button
                      variant={currentView === 'help' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={handleOpenHelp}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </Button>
                    <Button
                      variant={currentView === 'settings' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={handleOpenSettings}
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
                <div className="flex items-center">
                  <ThemeToggle size="sm" />
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Global Loading Overlay */}
      {computed.isLoading && (
        <LoadingOverlay message="Processing your request..." />
      )}

      {/* Global Error Alert */}
      {computed.hasError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{state.ui.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.clearError}
                className="h-6 w-6 p-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

// Root App component with providers
function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
