import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Square, 
  Sparkles,
  Database,
  Lightbulb
} from 'lucide-react';

const EXAMPLE_QUERIES = [
  "Show me all users created in the last 30 days",
  "What are the top 5 products by sales?",
  "Find customers with no orders",
  "Calculate monthly revenue for this year",
  "Show me the database schema"
];

export const MessageInput = ({ 
  onSendMessage, 
  isLoading = false, 
  activeDatabase = null,
  placeholder = "Ask me anything about your data...",
  className = ""
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && activeDatabase) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleInputFocus = () => {
    if (!message.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Suggestions */}
      {showSuggestions && (
        <Card className="absolute bottom-full mb-2 w-full p-4 shadow-lg border bg-background/95 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Try asking:
            </div>
            <div className="space-y-2">
              {EXAMPLE_QUERIES.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(query)}
                  className="block w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-sm"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Main Input Area */}
      <Card className="p-4 shadow-lg border bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Active Database Indicator */}
          {activeDatabase && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                {activeDatabase.nickname || activeDatabase.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Connected and ready
              </span>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={activeDatabase ? placeholder : "Please connect a database first..."}
                disabled={!activeDatabase || isLoading}
                className="min-h-[52px] max-h-[140px] resize-none pr-20 pl-3 text-sm w-[95%]"
                rows={1}
              />
              
              {/* Voice Recording Button - Inside Input */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                disabled={!activeDatabase || isLoading}
                className={`absolute right-2 top-2 h-8 w-8 p-0 hover:bg-muted/50 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              {/* Character count for long messages */}
              {message.length > 100 && (
                <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                  {message.length}/1000
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || !activeDatabase || isLoading}
              className="h-12 w-12 p-0 shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {!activeDatabase && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Connect a database to start chatting</span>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span>Processing your query...</span>
            </div>
          )}

          {/* Quick Actions */}
          {activeDatabase && !isLoading && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span>AI-powered SQL generation</span>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
