import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  MessageSquare, 
  Activity,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { DatabaseList } from './DatabaseList.jsx';
import { DatabaseStatus } from './DatabaseStatus.jsx';
import { ChatHistory } from './ChatHistory.jsx';
import { useAppState } from '../../hooks/useAppState.jsx';

export const Sidebar = ({ 
  onAddDatabase, 
  onOpenSettings,
  className = "",
  isMobile = false 
}) => {
  const { state, actions } = useAppState();
  const [activeTab, setActiveTab] = useState('databases');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      actions.toggleSidebar();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-80';
  const isOpen = isMobile ? state.ui.sidebarOpen : true;

  if (isMobile && !isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed left-0 top-0 z-50' : 'relative'} 
        ${sidebarWidth} 
        h-full bg-background border-r transition-all duration-300 ease-in-out
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm">SQL Agent</h1>
                    <p className="text-xs text-muted-foreground">Database Assistant</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="h-8 w-8 p-0"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {!isCollapsed ? (
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="databases" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      DBs
                    </TabsTrigger>
                    <TabsTrigger value="status" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Status
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="databases" className="p-4 mt-0">
                    <DatabaseList onAddDatabase={onAddDatabase} />
                  </TabsContent>
                  
                  <TabsContent value="status" className="p-4 mt-0">
                    <DatabaseStatus />
                  </TabsContent>
                  
                  <TabsContent value="history" className="p-4 mt-0">
                    <ChatHistory />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          ) : (
            /* Collapsed State */
            <div className="flex-1 p-2 space-y-2">
              <Button
                variant={activeTab === 'databases' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab('databases');
                  setIsCollapsed(false);
                }}
                className="w-full h-12 p-0"
                title="Databases"
              >
                <Database className="h-4 w-4" />
              </Button>
              
              <Button
                variant={activeTab === 'status' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab('status');
                  setIsCollapsed(false);
                }}
                className="w-full h-12 p-0"
                title="Status"
              >
                <Activity className="h-4 w-4" />
              </Button>
              
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setActiveTab('history');
                  setIsCollapsed(false);
                }}
                className="w-full h-12 p-0"
                title="History"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSettings}
                  className="w-full justify-start h-8"
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Settings
                </Button>
                
                {/* Connection Summary */}
                {state.databases.length > 0 && (
                  <Card className="p-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Connected:</span>
                        <span className="font-medium">
                          {state.databases.filter(db => db.status === 'connected').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{state.databases.length}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
