import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Table, 
  BarChart3, 
  Code, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { copyToClipboard, formatExecutionTime, exportUtils } from '../../utils/index.js';

export const SQLResult = ({ 
  sql, 
  results, 
  executionTime, 
  explanation,
  error,
  className = ""
}) => {
  const [showSql, setShowSql] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('table');

  const handleCopySql = async () => {
    const success = await copyToClipboard(sql);
    if (success) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleExportResults = (format) => {
    if (!results || results.length === 0) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `query_results_${timestamp}`;
    
    if (format === 'csv') {
      exportUtils.downloadCsv(results, `${filename}.csv`);
    } else {
      exportUtils.downloadJson(results, `${filename}.json`);
    }
  };

  const renderTable = () => {
    if (!results || results.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No results found</p>
        </div>
      );
    }

    const columns = Object.keys(results[0]);
    const maxRows = 100; // Limit displayed rows for performance
    const displayResults = results.slice(0, maxRows);
    const hasMoreRows = results.length > maxRows;

    return (
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{results.length} rows returned</span>
            <span>{columns.length} columns</span>
            {executionTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatExecutionTime(executionTime)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportResults('csv')}
              disabled={results.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportResults('json')}
              disabled={results.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left font-medium text-muted-foreground border-b"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayResults.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div className="max-w-xs truncate" title={String(row[column])}>
                          {row[column] === null ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : row[column] === '' ? (
                            <span className="text-muted-foreground italic">empty</span>
                          ) : (
                            String(row[column])
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* More rows indicator */}
        {hasMoreRows && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Showing first {maxRows} rows of {results.length} total results. 
              Export to see all data.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  const renderChart = () => {
    if (!results || results.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data to visualize</p>
        </div>
      );
    }

    // Simple chart placeholder - would integrate with Recharts for real charts
    return (
      <div className="space-y-4">
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Chart Visualization</p>
          <p>Chart visualization would be implemented here using Recharts</p>
          <p className="text-sm mt-2">
            Detected {results.length} data points across {Object.keys(results[0]).length} dimensions
          </p>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card className={`border-destructive ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Query Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription className="font-mono text-sm">
              {error}
            </AlertDescription>
          </Alert>
          
          {sql && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Generated SQL:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySql}
                  className="h-8"
                >
                  {copiedSql ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedSql ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                <code>{sql}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Query Results
            </CardTitle>
            {explanation && (
              <CardDescription className="mt-2">
                {explanation}
              </CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SQL Query Section */}
        {sql && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                Generated SQL
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSql(!showSql)}
                  className="h-8"
                >
                  {showSql ? (
                    <EyeOff className="h-3 w-3 mr-1" />
                  ) : (
                    <Eye className="h-3 w-3 mr-1" />
                  )}
                  {showSql ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySql}
                  className="h-8"
                >
                  {copiedSql ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedSql ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            {showSql && (
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                <code>{sql}</code>
              </pre>
            )}
          </div>
        )}

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Chart View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
            {renderTable()}
          </TabsContent>
          
          <TabsContent value="chart" className="mt-4">
            {renderChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
