import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Clock, 
  Download, 
  Database,
  Zap,
  Shield,
  Bell,
  Palette,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../hooks/useAppState.jsx';

export const Settings = ({ onClose, className = "" }) => {
  const { settings, updateSettings, toggleTheme } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      queryTimeout: 30000,
      resultLimit: 1000,
      exportFormat: 'json'
    };
    setLocalSettings(defaultSettings);
    setHasChanges(true);
    setSaved(false);
  };

  const handleThemeChange = (theme) => {
    handleSettingChange('theme', theme);
    if (theme !== 'system') {
      // Apply theme immediately for preview
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={localSettings.theme} 
              onValueChange={(value) => handleThemeChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Query Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4" />
            Query Settings
          </CardTitle>
          <CardDescription>
            Configure how queries are executed and displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="queryTimeout">Query Timeout (seconds)</Label>
            <Input
              id="queryTimeout"
              type="number"
              min="5"
              max="300"
              value={localSettings.queryTimeout / 1000}
              onChange={(e) => handleSettingChange('queryTimeout', parseInt(e.target.value) * 1000)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum time to wait for query execution (5-300 seconds)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultLimit">Result Limit</Label>
            <Select 
              value={localSettings.resultLimit.toString()} 
              onValueChange={(value) => handleSettingChange('resultLimit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select result limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
                <SelectItem value="1000">1,000 rows</SelectItem>
                <SelectItem value="5000">5,000 rows</SelectItem>
                <SelectItem value="10000">10,000 rows</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Maximum number of rows to display in query results
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exportFormat">Default Export Format</Label>
            <Select 
              value={localSettings.exportFormat} 
              onValueChange={(value) => handleSettingChange('exportFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Performance
          </CardTitle>
          <CardDescription>
            Optimize application performance and resource usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoRefresh">Auto-refresh Database Status</Label>
              <p className="text-xs text-muted-foreground">
                Automatically update connection status every 30 seconds
              </p>
            </div>
            <Switch
              id="autoRefresh"
              checked={localSettings.autoRefresh || false}
              onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cacheQueries">Cache Query Results</Label>
              <p className="text-xs text-muted-foreground">
                Store recent query results for faster access
              </p>
            </div>
            <Switch
              id="cacheQueries"
              checked={localSettings.cacheQueries || false}
              onCheckedChange={(checked) => handleSettingChange('cacheQueries', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Manage your data privacy and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="saveCredentials">Save Database Credentials</Label>
              <p className="text-xs text-muted-foreground">
                Store encrypted credentials in browser local storage
              </p>
            </div>
            <Switch
              id="saveCredentials"
              checked={localSettings.saveCredentials !== false}
              onCheckedChange={(checked) => handleSettingChange('saveCredentials', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="saveChatHistory">Save Chat History</Label>
              <p className="text-xs text-muted-foreground">
                Keep conversation history between sessions
              </p>
            </div>
            <Switch
              id="saveChatHistory"
              checked={localSettings.saveChatHistory !== false}
              onCheckedChange={(checked) => handleSettingChange('saveChatHistory', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Usage Analytics</Label>
              <p className="text-xs text-muted-foreground">
                Help improve the app by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={localSettings.analytics || false}
              onCheckedChange={(checked) => handleSettingChange('analytics', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="queryNotifications">Query Completion Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when long-running queries complete
              </p>
            </div>
            <Switch
              id="queryNotifications"
              checked={localSettings.queryNotifications || false}
              onCheckedChange={(checked) => handleSettingChange('queryNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="errorNotifications">Error Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Show desktop notifications for query errors
              </p>
            </div>
            <Switch
              id="errorNotifications"
              checked={localSettings.errorNotifications !== false}
              onCheckedChange={(checked) => handleSettingChange('errorNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <SettingsIcon className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Settings are automatically saved to your browser's local storage. 
          Some changes may require refreshing the page to take full effect.
        </AlertDescription>
      </Alert>
    </div>
  );
};
