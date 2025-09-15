import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  ArrowLeft, 
  ArrowRight, 
  Database, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { DatabaseSelector } from './DatabaseSelector.jsx';
import { CredentialForm } from './CredentialForm.jsx';
import { ConnectionTest } from './ConnectionTest.jsx';
import { useAppState } from '../../hooks/useAppState.jsx';
import { api } from '../../services/api.js';

const SETUP_STEPS = [
  { id: 'select', title: 'Select Database', description: 'Choose your database type' },
  { id: 'configure', title: 'Configure Connection', description: 'Enter connection details' },
  { id: 'test', title: 'Test & Save', description: 'Verify and save connection' }
];

export const SetupPage = ({ onComplete, onCancel }) => {
  const { actions } = useAppState();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [credentials, setCredentials] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [testResults, setTestResults] = useState(null);

  const currentStepId = SETUP_STEPS[currentStep]?.id;

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors([]);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  const handleDatabaseSelect = (type) => {
    setSelectedType(type);
    setCredentials({});
    setErrors([]);
    setTestResults(null);
  };

  const handleCredentialsChange = (newCredentials) => {
    setCredentials(newCredentials);
    setErrors([]);
  };

  const handleConnectionTest = async (databaseConfig) => {
    setIsLoading(true);
    setErrors([]);

    try {
      // Use mock API for development
      const result = await api.connect(databaseConfig);
      
      if (result.success) {
        // Add database to global state
        actions.addDatabase(result.database);
        
        // Set as active database if it's the first one
        actions.setActiveDatabase(result.database.id);
        
        setTestResults(result);
        actions.setError(null);
        
        // Complete setup after successful connection
        setTimeout(() => {
          onComplete?.(result.database);
        }, 1500);
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setErrors([error.message]);
      actions.setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestComplete = (success, results) => {
    if (success) {
      setTestResults(results);
    } else {
      setErrors([results]);
    }
  };

  const canProceedToNext = () => {
    switch (currentStepId) {
      case 'select':
        return selectedType !== '';
      case 'configure':
        return Object.keys(credentials).length > 0;
      case 'test':
        return testResults !== null;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {SETUP_STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
            index < currentStep 
              ? 'bg-primary border-primary text-primary-foreground' 
              : index === currentStep
              ? 'border-primary text-primary bg-primary/10'
              : 'border-muted-foreground/30 text-muted-foreground'
          }`}>
            {index < currentStep ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <div className="ml-3 hidden sm:block">
            <p className={`text-sm font-medium ${
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
          {index < SETUP_STEPS.length - 1 && (
            <div className={`w-12 h-px mx-4 ${
              index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case 'select':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Choose Your Database</h2>
              <p className="text-muted-foreground">
                Select the type of database you want to connect to
              </p>
            </div>
            <DatabaseSelector
              selectedType={selectedType}
              onSelect={handleDatabaseSelect}
            />
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Configure Connection</h2>
              <p className="text-muted-foreground">
                Enter your database connection details
              </p>
              {selectedType && (
                <Badge variant="outline" className="mt-2">
                  <Database className="h-3 w-3 mr-1" />
                  {selectedType}
                </Badge>
              )}
            </div>
            <CredentialForm
              databaseType={selectedType}
              credentials={credentials}
              onChange={handleCredentialsChange}
              onSubmit={handleConnectionTest}
              isLoading={isLoading}
              errors={errors}
            />
          </div>
        );

      case 'test':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Test Connection</h2>
              <p className="text-muted-foreground">
                Verify your database connection and save it
              </p>
            </div>
            <ConnectionTest
              databaseConfig={{ type: selectedType, credentials }}
              onTestComplete={handleTestComplete}
              onRetry={() => setCurrentStep(1)}
            />
            
            {testResults && (
              <Alert className="border-green-200 bg-green-50">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">🎉 Connection successful!</p>
                    <p>Your database has been added and you can now start chatting with your data.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
          <p className="text-muted-foreground">
            Connect your database to start querying with natural language
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            
            {currentStep < SETUP_STEPS.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext() || isLoading}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Global Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
