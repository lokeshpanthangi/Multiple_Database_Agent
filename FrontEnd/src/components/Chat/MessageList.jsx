import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  User, 
  Bot, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { SQLResult } from './SQLResult.jsx';
import { MESSAGE_TYPES } from '../../types/index.js';
import { formatTimestamp, copyToClipboard } from '../../utils/index.js';
import { useState } from 'react';

const MessageBubble = ({ message, isUser = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'You' : 'SQL Agent'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <Card className={`${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted/50'
        } shadow-sm`}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 text-sm whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className={`h-6 w-6 p-0 opacity-60 hover:opacity-100 ${
                  isUser ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''
                }`}
              >
                {copied ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SystemMessage = ({ message }) => {
  return (
    <div className="flex justify-center my-4">
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        {message.content}
      </Badge>
    </div>
  );
};

const LoadingMessage = () => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-muted">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 max-w-[80%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">SQL Agent</span>
          <span className="text-xs text-muted-foreground">thinking...</span>
        </div>
        
        <Card className="bg-muted/50 shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Analyzing your query and generating SQL...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const MessageList = ({ 
  messages = [], 
  isLoading = false, 
  className = "" 
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const renderMessage = (message, index) => {
    switch (message.type) {
      case MESSAGE_TYPES.USER:
        return (
          <MessageBubble
            key={message.id || index}
            message={message}
            isUser={true}
          />
        );

      case MESSAGE_TYPES.AGENT:
        return (
          <MessageBubble
            key={message.id || index}
            message={message}
            isUser={false}
          />
        );

      case MESSAGE_TYPES.SQL_QUERY:
      case MESSAGE_TYPES.QUERY_RESULT:
        return (
          <div key={message.id || index} className="flex-1">
            <SQLResult
              responseContent={message.content}
              sql={message.metadata?.sql}
              results={message.metadata?.results}
              executionTime={message.metadata?.executionTime}
              explanation={message.metadata?.explanation}
              error={message.metadata?.error}
              timestamp={message.timestamp}
              aggregationPipeline={message.metadata?.aggregationPipeline}
              collections={message.metadata?.collections}
              mongoQuery={message.metadata?.mongoQuery}
            />
          </div>
        );

      case MESSAGE_TYPES.ERROR:
        return (
          <div key={message.id || index} className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-destructive text-destructive-foreground">
                <AlertCircle className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 max-w-[80%]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">System</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {message.content}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      default:
        return (
          <SystemMessage
            key={message.id || index}
            message={message}
          />
        );
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Start a conversation</h3>
            <p className="text-muted-foreground text-sm">
              Ask me anything about your data. I'll help you write SQL queries and analyze your results.
            </p>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Try asking:</p>
            <ul className="space-y-1">
              <li>"Show me all users from last month"</li>
              <li>"What are the top selling products?"</li>
              <li>"Calculate the average order value"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto ${className}`}
    >
      <div className="space-y-6 p-4">
        {messages.map(renderMessage)}
        
        {/* Loading indicator */}
        {isLoading && <LoadingMessage />}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
