import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Eye, EyeOff, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DATABASE_CREDENTIAL_FIELDS } from '../../types/index.js';
import { validateCredentials } from '../../utils/index.js';

export const CredentialForm = ({ 
  databaseType, 
  credentials, 
  onChange, 
  onSubmit, 
  isLoading = false,
  errors = [],
  className = '' 
}) => {
  const [showPasswords, setShowPasswords] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [nickname, setNickname] = useState('');

  const fields = DATABASE_CREDENTIAL_FIELDS[databaseType] || [];

  useEffect(() => {
    // Validate credentials when they change
    const errors = validateCredentials(databaseType, credentials);
    setValidationErrors(errors);
  }, [databaseType, credentials]);

  const handleFieldChange = (fieldName, value) => {
    onChange({
      ...credentials,
      [fieldName]: value
    });
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validationErrors.length === 0) {
      onSubmit({
        type: databaseType,
        nickname: nickname.trim() || `${databaseType}-${Date.now()}`,
        credentials
      });
    }
  };

  const renderField = (field) => {
    const value = credentials[field.name] || field.defaultValue || '';
    const hasError = validationErrors.some(error => 
      error.toLowerCase().includes(field.name.toLowerCase())
    );

    switch (field.type) {
      case 'password':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                type={showPasswords[field.name] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className={hasError ? 'border-destructive' : ''}
                required={field.required}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility(field.name)}
              >
                {showPasswords[field.name] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || '')}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={hasError ? 'border-destructive' : ''}
              required={field.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <Select value={value} onValueChange={(value) => handleFieldChange(field.name, value)}>
              <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'file':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={field.name}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      handleFieldChange(field.name, e.target?.result);
                    };
                    reader.readAsText(file);
                  }
                }}
                accept=".json"
                className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 ${hasError ? 'border-destructive' : ''}`}
                required={field.required}
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {value && (
              <p className="text-sm text-muted-foreground">
                File uploaded successfully
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={hasError ? 'border-destructive' : ''}
              rows={3}
              required={field.required}
            />
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="flex items-center gap-2">
              {field.label}
              {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            <Input
              id={field.name}
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={hasError ? 'border-destructive' : ''}
              required={field.required}
            />
          </div>
        );
    }
  };

  if (!databaseType || fields.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please select a database type to configure credentials.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
        <CardDescription>
          Enter the connection details for your {databaseType} database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Database Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">
              Connection Nickname (Optional)
            </Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Production DB, Development DB"
            />
            <p className="text-sm text-muted-foreground">
              A friendly name to identify this connection
            </p>
          </div>

          {/* Dynamic Credential Fields */}
          {fields.map(renderField)}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* API Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
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

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || validationErrors.length > 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Test & Save Connection
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
            <p>
              <strong>Note:</strong> Your credentials are stored securely in your browser's local storage.
            </p>
            <p>
              We recommend using read-only database users or API keys with limited permissions for security.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
