import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  Trash2, 
  Download,
  Filter,
  User,
  Bot,
  Database,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { useChat, useDatabase } from '../../hooks/useAppState.jsx';
import { MESSAGE_TYPES } from '../../types/index.js';
import { formatTimestamp } from '../../utils/index.js';

const MessagePreview = ({ message, onClick }) => {
  const getMessageIcon = (type) => {
    switch (type) {
      case MESSAGE_TYPES.USER:
        return <User className="h-3 w-3" />;
      case MESSAGE_TYPES.AGENT:
        return <Bot className="h-3 w-3" />;
      case MESSAGE_TYPES.QUERY_RESULT:
        return <Database className="h-3 w-3" />;
      case MESSAGE_TYPES.ERROR:
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case MESSAGE_TYPES.USER:
        return 'text-primary';
      case MESSAGE_TYPES.AGENT:
        return 'text-blue-600';
      case MESSAGE_TYPES.QUERY_RESULT:
        return 'text-green-600';
      case MESSAGE_TYPES.ERROR:
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const truncateContent = (content, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
      onClick={() => onClick(message)}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-1 ${getMessageTypeColor(message.type)}`}>
          {getMessageIcon(message.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="text-xs h-4">
              {message.type === MESSAGE_TYPES.USER ? 'You' : 'Agent'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.timestamp).split(' ')[1]} {/* Show only time */}
            </span>
          </div>
          <p className="text-xs text-foreground truncate">
            {message.type === MESSAGE_TYPES.QUERY_RESULT 
              ? message.metadata?.explanation || 'Query executed'
              : truncateContent(message.content)
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export const ChatHistory = ({ className = "" }) => {
  const { chatHistory, clearHistory } = useChat();
  const { activeDatabase } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredMessages = chatHistory.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (message.metadata?.explanation && message.metadata.explanation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || message.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleMessageClick = (message) => {
    // Scroll to message in chat interface
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      clearHistory();
    }
  };

  const getFilterOptions = () => [
    { value: 'all', label: 'All Messages', count: chatHistory.length },
    { value: MESSAGE_TYPES.USER, label: 'Your Messages', count: chatHistory.filter(m => m.type === MESSAGE_TYPES.USER).length },
    { value: MESSAGE_TYPES.AGENT, label: 'Agent Responses', count: chatHistory.filter(m => m.type === MESSAGE_TYPES.AGENT).length },
    { value: MESSAGE_TYPES.QUERY_RESULT, label: 'Query Results', count: chatHistory.filter(m => m.type === MESSAGE_TYPES.QUERY_RESULT).length },
    { value: MESSAGE_TYPES.ERROR, label: 'Errors', count: chatHistory.filter(m => m.type === MESSAGE_TYPES.ERROR).length },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Chat History</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportHistory}
            disabled={chatHistory.length === 0}
            className="h-8 w-8 p-0"
            title="Export history"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={chatHistory.length === 0}
            className="h-8 w-8 p-0"
            title="Clear history"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      {chatHistory.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  <span className="text-xs">
                    {getFilterOptions().find(opt => opt.value === filterType)?.label}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs h-4">
                  {filteredMessages.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {getFilterOptions().map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs">{option.label}</span>
                  <Badge variant="secondary" className="text-xs h-4">
                    {option.count}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {chatHistory.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No chat history</p>
                <p className="text-xs text-muted-foreground">
                  Start a conversation to see your message history here
                </p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <Search className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">No messages found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2 space-y-1">
                {filteredMessages.slice().reverse().map((message, index) => (
                  <MessagePreview
                    key={message.id || index}
                    message={message}
                    onClick={handleMessageClick}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {chatHistory.length > 0 && (
        <Card className="p-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Session Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Messages:</span>
                <Badge variant="secondary" className="text-xs h-4">
                  {chatHistory.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Queries:</span>
                <Badge variant="secondary" className="text-xs h-4">
                  {chatHistory.filter(m => m.type === MESSAGE_TYPES.QUERY_RESULT).length}
                </Badge>
              </div>
            </div>
            {activeDatabase && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Database className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {activeDatabase.nickname || activeDatabase.type}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
