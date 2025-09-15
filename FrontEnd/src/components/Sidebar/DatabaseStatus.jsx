import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Database, 
  Activity, 
  Clock, 
  Zap, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Server,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useDatabase } from '../../hooks/useAppState.jsx';
import { formatTimestamp, formatExecutionTime } from '../../utils/index.js';

const StatusIndicator = ({ status, size = "sm" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          label: 'Connected',
          pulse: false
        };
      case 'connecting':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          label: 'Connecting',
          pulse: true
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          label: 'Error',
          pulse: false
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          label: 'Disconnected',
          pulse: false
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          label: 'Unknown',
          pulse: false
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1 rounded-full ${config.bgColor}`}>
        <Icon className={`${iconSize} ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
      </div>
      <span className={`text-${size} font-medium`}>{config.label}</span>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, className = "" }) => (
  <Card className={`p-3 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {trend && (
        <TrendingUp className="h-3 w-3 text-green-500" />
      )}
    </div>
    <div className="mt-1">
      <span className="text-lg font-semibold">{value}</span>
    </div>
  </Card>
);

export const DatabaseStatus = ({ className = "" }) => {
  const { activeDatabase, updateDatabase } = useDatabase();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(100);

  // Simulate connection health monitoring
  useEffect(() => {
    if (!activeDatabase || activeDatabase.status !== 'connected') return;

    const interval = setInterval(() => {
      // Simulate fluctuating connection health
      const newHealth = Math.max(70, Math.min(100, connectionHealth + (Math.random() - 0.5) * 10));
      setConnectionHealth(newHealth);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeDatabase, connectionHealth]);

  const handleRefreshStats = async () => {
    if (!activeDatabase) return;

    setIsRefreshing(true);
    try {
      // Simulate API call to refresh database stats
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with mock data
      const mockStats = {
        tables: Math.floor(Math.random() * 20) + 5,
        collections: activeDatabase.type === 'mongodb' ? Math.floor(Math.random() * 10) + 3 : 0,
        lastConnected: new Date().toISOString(),
      };

      updateDatabase(activeDatabase.id, { 
        stats: mockStats,
        lastQueryTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!activeDatabase) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No Active Database</p>
              <p className="text-xs text-muted-foreground">
                Select a database to view its status and statistics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-500';
    if (health >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBgColor = (health) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Database Status</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshStats}
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Current Database Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {activeDatabase.nickname || `${activeDatabase.type} Database`}
              </CardTitle>
              <CardDescription className="truncate">
                {activeDatabase.type} • ID: {activeDatabase.id.slice(-8)}
              </CardDescription>
            </div>
            <StatusIndicator status={activeDatabase.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Health */}
          {activeDatabase.status === 'connected' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connection Health</span>
                <span className={`font-medium ${getHealthColor(connectionHealth)}`}>
                  {Math.round(connectionHealth)}%
                </span>
              </div>
              <Progress 
                value={connectionHealth} 
                className="h-2"
                style={{
                  '--progress-background': getHealthBgColor(connectionHealth)
                }}
              />
            </div>
          )}

          {/* Connection Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <Badge variant="outline" className="text-xs">
                {activeDatabase.type}
              </Badge>
            </div>
            
            {activeDatabase.stats?.lastConnected && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Connected:</span>
                <span className="text-xs">
                  {formatTimestamp(activeDatabase.stats.lastConnected)}
                </span>
              </div>
            )}

            {activeDatabase.lastQueryTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Query:</span>
                <span className="text-xs">
                  {formatTimestamp(activeDatabase.lastQueryTime)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Statistics */}
      {activeDatabase.stats && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Database Statistics</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {activeDatabase.stats.tables > 0 && (
              <StatCard
                icon={Database}
                label="Tables"
                value={activeDatabase.stats.tables}
              />
            )}
            
            {activeDatabase.stats.collections > 0 && (
              <StatCard
                icon={HardDrive}
                label="Collections"
                value={activeDatabase.stats.collections}
              />
            )}
          </div>

          {/* Additional Stats */}
          <div className="space-y-2">
            <StatCard
              icon={Activity}
              label="Queries Today"
              value={Math.floor(Math.random() * 50) + 10}
              trend={true}
            />
            
            <StatCard
              icon={Clock}
              label="Avg Response Time"
              value={`${Math.floor(Math.random() * 200) + 50}ms`}
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activeDatabase.lastQuery && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Last Query:</div>
              <div className="text-sm bg-muted p-2 rounded text-mono truncate" title={activeDatabase.lastQuery}>
                {activeDatabase.lastQuery}
              </div>
              {activeDatabase.lastQueryTime && (
                <div className="text-xs text-muted-foreground">
                  Executed {formatTimestamp(activeDatabase.lastQueryTime)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Issues */}
      {activeDatabase.status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Connection error detected. Check your network and database credentials.
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Tips */}
      {activeDatabase.status === 'connected' && connectionHealth < 80 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Connection health is below optimal. Consider checking your network or database performance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
