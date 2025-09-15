import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Database, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { useDatabase } from '../../hooks/useAppState.jsx';
import { formatTimestamp } from '../../utils/index.js';

const DatabaseCard = ({ database, isActive, onSelect, onEdit, onDelete }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'connecting':
        return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'ring-2 ring-primary bg-primary/5 border-primary' 
          : 'hover:border-primary/50'
      }`}
      onClick={() => onSelect(database.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm truncate">
                {database.nickname || `${database.type} Database`}
              </CardTitle>
              <p className="text-xs text-muted-foreground truncate">
                {database.type}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(database); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Connection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(database.id); }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(database.status)}`}
            >
              {getStatusIcon(database.status)}
              <span className="ml-1 capitalize">{database.status}</span>
            </Badge>
          </div>

          {/* Stats */}
          {database.stats && (
            <div className="text-xs text-muted-foreground space-y-1">
              {database.stats.tables > 0 && (
                <div>Tables: {database.stats.tables}</div>
              )}
              {database.stats.collections > 0 && (
                <div>Collections: {database.stats.collections}</div>
              )}
              {database.stats.lastConnected && (
                <div>Last connected: {formatTimestamp(database.stats.lastConnected)}</div>
              )}
            </div>
          )}

          {/* Last Query */}
          {database.lastQuery && (
            <div className="text-xs text-muted-foreground">
              <div className="truncate" title={database.lastQuery}>
                Last query: {database.lastQuery}
              </div>
              {database.lastQueryTime && (
                <div>Executed: {formatTimestamp(database.lastQueryTime)}</div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DatabaseList = ({ onAddDatabase, className = "" }) => {
  const { databases, activeDatabase, setActiveDatabase, removeDatabase } = useDatabase();
  const [isDeleting, setIsDeleting] = useState(null);

  const handleSelectDatabase = (databaseId) => {
    setActiveDatabase(databaseId);
  };

  const handleEditDatabase = (database) => {
    // TODO: Implement edit functionality
    console.log('Edit database:', database);
  };

  const handleDeleteDatabase = async (databaseId) => {
    if (window.confirm('Are you sure you want to remove this database connection? This will also clear its chat history.')) {
      setIsDeleting(databaseId);
      try {
        // TODO: Call API to disconnect if needed
        removeDatabase(databaseId);
      } catch (error) {
        console.error('Failed to remove database:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const connectedDatabases = databases.filter(db => db.status === 'connected');
  const otherDatabases = databases.filter(db => db.status !== 'connected');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Databases</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddDatabase}
          className="h-8"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {/* No Databases State */}
      {databases.length === 0 && (
        <Card className="p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No databases connected</p>
              <p className="text-xs text-muted-foreground">
                Add your first database to get started
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddDatabase}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Database
            </Button>
          </div>
        </Card>
      )}

      {/* Connected Databases */}
      {connectedDatabases.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Connected ({connectedDatabases.length})</span>
          </div>
          <div className="space-y-2">
            {connectedDatabases.map(database => (
              <DatabaseCard
                key={database.id}
                database={database}
                isActive={activeDatabase?.id === database.id}
                onSelect={handleSelectDatabase}
                onEdit={handleEditDatabase}
                onDelete={handleDeleteDatabase}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Databases */}
      {otherDatabases.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Other Connections ({otherDatabases.length})</span>
          </div>
          <div className="space-y-2">
            {otherDatabases.map(database => (
              <DatabaseCard
                key={database.id}
                database={database}
                isActive={activeDatabase?.id === database.id}
                onSelect={handleSelectDatabase}
                onEdit={handleEditDatabase}
                onDelete={handleDeleteDatabase}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {databases.length > 0 && (
        <Card className="p-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </h4>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddDatabase}
                className="w-full justify-start h-8"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Database
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={() => {
                  // TODO: Implement test all connections
                  console.log('Test all connections');
                }}
              >
                <Zap className="h-3 w-3 mr-2" />
                Test All Connections
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Tips */}
      {databases.some(db => db.status === 'error') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Some database connections have errors. Check your credentials and network connectivity.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
