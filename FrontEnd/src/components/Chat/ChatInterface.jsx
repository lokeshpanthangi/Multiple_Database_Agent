import { useState } from 'react';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  MessageSquare, 
  Trash2, 
  Download, 
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';
import { MessageList } from './MessageList.jsx';
import { MessageInput } from './MessageInput.jsx';
import { useChat, useDatabase } from '../../hooks/useAppState.jsx';
import { MESSAGE_TYPES, DATABASE_TYPES } from '../../types/index.js';
import { api } from '../../services/api.js';

export const ChatInterface = ({ className = "" }) => {
  const { chatHistory, addMessage, clearHistory, activeDatabaseId } = useChat();
  const { activeDatabase } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message) => {
    if (!activeDatabase || !message.trim()) return;

    // Add user message
    addMessage(MESSAGE_TYPES.USER, message);
    setIsLoading(true);

    try {
      let response;
      
      if (activeDatabase.type === DATABASE_TYPES.MONGODB) {
        // Use MongoDB-specific API
        const connectionString = activeDatabase.credentials.connectionString;
        const databaseName = activeDatabase.credentials.database || 'test';
        const nickname = activeDatabase.nickname || 'MongoDB Connection';
        
        response = await api.mongo.query(nickname, connectionString, databaseName, message);
        
        // Add query result for MongoDB
        addMessage(MESSAGE_TYPES.QUERY_RESULT, response.response, {
          aggregationPipeline: response.query_workflow?.aggregation_pipeline,
          collections: response.query_workflow?.collection_names,
          results: response.results,
          mongoQuery: true
        });
      } else {
        // Use generic API for other databases
        response = await api.query?.(activeDatabaseId, message);

        if (response?.success) {
          // Add query result
          addMessage(MESSAGE_TYPES.QUERY_RESULT, 'Query executed successfully', {
            sql: response.sql,
            results: response.results,
            executionTime: response.executionTime
          });
        } else {
          throw new Error(response?.message || 'Query failed');
        }
      }
    } catch (error) {
      console.error('Query failed:', error);
      
      // Add error message
      addMessage(MESSAGE_TYPES.ERROR, error.message || 'An error occurred while processing your query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  const handleExportHistory = () => {
    if (chatHistory.length === 0) return;

    const exportData = {
      database: {
        id: activeDatabase?.id,
        nickname: activeDatabase?.nickname,
        type: activeDatabase?.type
      },
      messages: chatHistory,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${activeDatabase?.nickname || 'database'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    // Refresh the chat interface - could reload recent messages from server
    window.location.reload();
  };

  if (!activeDatabase) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <Card className="p-8 max-w-md text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Database Connected</h3>
              <p className="text-muted-foreground text-sm">
                Please connect to a database to start chatting with your data.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">
                Chat with {activeDatabase.nickname || activeDatabase.type}
              </h2>
              <p className="text-sm text-muted-foreground">
                Ask questions about your data in natural language
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh chat"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportHistory}
              disabled={chatHistory.length === 0}
              title="Export chat history"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              disabled={chatHistory.length === 0}
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {activeDatabase.status !== 'connected' && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Database connection is {activeDatabase.status}. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <MessageList
        messages={chatHistory}
        isLoading={isLoading}
        className="flex-1 min-h-0"
      />

      {/* Input Area */}
      <div className="bg-background/95 backdrop-blur-sm p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          activeDatabase={activeDatabase}
          placeholder="Ask me anything about your data..."
        />
      </div>
    </div>
  );
};
