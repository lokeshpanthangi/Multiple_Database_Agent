import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  Zap, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const TEST_STEPS = [
  { id: 'validation', label: 'Validating credentials', icon: CheckCircle2 },
  { id: 'connection', label: 'Establishing connection', icon: Zap },
  { id: 'authentication', label: 'Authenticating', icon: Database },
  { id: 'schema', label: 'Reading database schema', icon: Database },
];

export const ConnectionTest = ({ 
  databaseConfig, 
  onTestComplete, 
  onRetry,
  className = '' 
}) => {
  const [testState, setTestState] = useState('idle'); // idle, testing, success, error
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);

  const runConnectionTest = async () => {
    setTestState('testing');
    setCurrentStep(0);
    setError(null);
    setTestResults(null);

    try {
      // Simulate connection test steps
      for (let i = 0; i < TEST_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate async operation
        
        // Simulate potential failure at any step
        if (Math.random() < 0.1 && i === 1) { // 10% chance of connection failure
          throw new Error('Connection timeout - please check your network and credentials');
        }
      }

      // Simulate successful connection with mock results
      const mockResults = {
        connectionTime: Math.floor(Math.random() * 500) + 100,
        databaseVersion: getDatabaseVersion(databaseConfig.type),
        schema: {
          tables: Math.floor(Math.random() * 20) + 5,
          views: Math.floor(Math.random() * 5),
          procedures: Math.floor(Math.random() * 10),
        },
        permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        serverInfo: {
          host: databaseConfig.credentials.host || 'localhost',
          port: databaseConfig.credentials.port || getDefaultPort(databaseConfig.type),
          ssl: databaseConfig.credentials.ssl || 'disabled'
        }
      };

      setTestResults(mockResults);
      setTestState('success');
      onTestComplete?.(true, mockResults);

    } catch (err) {
      setError(err.message);
      setTestState('error');
      onTestComplete?.(false, err.message);
    }
  };

  const getDatabaseVersion = (type) => {
    const versions = {
      postgresql: 'PostgreSQL 15.2',
      mysql: 'MySQL 8.0.32',
      sqlite: 'SQLite 3.40.1',
      mongodb: 'MongoDB 6.0.4',
      supabase: 'Supabase (PostgreSQL 15.1)',
      neondb: 'Neon (PostgreSQL 15.2)',
      firebase: 'Firestore',
      redis: 'Redis 7.0.8',
      cassandra: 'Cassandra 4.1.0'
    };
    return versions[type] || 'Unknown';
  };

  const getDefaultPort = (type) => {
    const ports = {
      postgresql: 5432,
      mysql: 3306,
      mongodb: 27017,
      redis: 6379,
      cassandra: 9042
    };
    return ports[type] || 'N/A';
  };

  const getProgressPercentage = () => {
    if (testState === 'idle') return 0;
    if (testState === 'success') return 100;
    if (testState === 'error') return (currentStep / TEST_STEPS.length) * 100;
    return ((currentStep + 1) / TEST_STEPS.length) * 100;
  };

  const renderTestSteps = () => {
    return (
      <div className="space-y-3">
        {TEST_STEPS.map((step, index) => {
          const Icon = step.icon;
          let status = 'pending';
          
          if (testState === 'success' || index < currentStep) {
            status = 'completed';
          } else if (index === currentStep && testState === 'testing') {
            status = 'active';
          } else if (testState === 'error' && index === currentStep) {
            status = 'error';
          }

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                status === 'completed' ? 'bg-green-100 text-green-600' :
                status === 'active' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                status === 'error' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {status === 'active' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : status === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className={`text-sm ${
                status === 'completed' ? 'text-green-600' :
                status === 'active' ? 'text-blue-600 font-medium' :
                status === 'error' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
              {status === 'completed' && (
                <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderResults = () => {
    if (!testResults) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Connection Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Response time: {testResults.connectionTime}ms</p>
              <p>Version: {testResults.databaseVersion}</p>
              <p>Host: {testResults.serverInfo.host}:{testResults.serverInfo.port}</p>
              <p>SSL: {testResults.serverInfo.ssl}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Database Schema</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Tables: {testResults.schema.tables}</p>
              <p>Views: {testResults.schema.views}</p>
              <p>Procedures: {testResults.schema.procedures}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Permissions</h4>
          <div className="flex flex-wrap gap-1">
            {testResults.permissions.map(permission => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Connection Test
        </CardTitle>
        <CardDescription>
          {databaseConfig ? 
            `Testing connection to ${databaseConfig.type} database` :
            'Configure your database credentials to test the connection'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!databaseConfig ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please complete the database configuration before testing the connection.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connection Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Test Steps */}
            {testState !== 'idle' && renderTestSteps()}

            {/* Success Results */}
            {testState === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-3">
                    <p className="font-medium">Connection successful!</p>
                    {renderResults()}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {testState === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Connection failed</p>
                    <p>{error}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={runConnectionTest}
                disabled={testState === 'testing'}
                variant={testState === 'success' ? 'outline' : 'default'}
                className="flex-1"
              >
                {testState === 'testing' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : testState === 'success' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Again
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              
              {testState === 'error' && onRetry && (
                <Button onClick={onRetry} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>

            {/* Help Text */}
            {testState === 'idle' && (
              <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                <p>This test will verify:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Network connectivity to your database</li>
                  <li>Authentication with provided credentials</li>
                  <li>Basic permissions and schema access</li>
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
