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
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { copyToClipboard, formatExecutionTime, formatTimestamp, exportUtils } from '../../utils/index.js';

// Component to render formatted text with markdown support
const FormattedText = ({ content }) => {
  const formatText = (text) => {
    if (!text) return null;
    
    // Split text by lines to handle line breaks properly
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <br key={lineIndex} />;
      }
      
      // Process each line for formatting
      const parts = [];
      let currentIndex = 0;
      
      // Regular expression to match **bold**, *italic*, and other patterns
      const formatRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\d+\.\s|\-\s)/g;
      let match;
      
      while ((match = formatRegex.exec(line)) !== null) {
        // Add text before the match
        if (match.index > currentIndex) {
          parts.push(line.slice(currentIndex, match.index));
        }
        
        const matchedText = match[0];
        
        if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
          // Bold text
          parts.push(
            <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold">
              {matchedText.slice(2, -2)}
            </strong>
          );
        } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
          // Italic text
          parts.push(
            <em key={`italic-${lineIndex}-${match.index}`} className="italic">
              {matchedText.slice(1, -1)}
            </em>
          );
        } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
          // Code text
          parts.push(
            <code key={`code-${lineIndex}-${match.index}`} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {matchedText.slice(1, -1)}
            </code>
          );
        } else if (matchedText.match(/^\d+\.\s/)) {
          // Numbered list item
          parts.push(
            <span key={`number-${lineIndex}-${match.index}`} className="font-medium text-primary">
              {matchedText}
            </span>
          );
        } else if (matchedText === '- ') {
          // Bullet point
          parts.push(
            <span key={`bullet-${lineIndex}-${match.index}`} className="font-medium text-primary">
              • 
            </span>
          );
        } else {
          parts.push(matchedText);
        }
        
        currentIndex = match.index + matchedText.length;
      }
      
      // Add remaining text
      if (currentIndex < line.length) {
        parts.push(line.slice(currentIndex));
      }
      
      return (
        <div key={lineIndex} className={`${line.match(/^\d+\./) ? 'ml-0 mb-1' : line.startsWith('- ') ? 'ml-4 mb-1' : 'mb-1'}`}>
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };
  
  return (
    <div className="space-y-1">
      {formatText(content)}
    </div>
  );
};

export const SQLResult = ({ 
  responseContent,
  sql, 
  results, 
  executionTime, 
  explanation,
  error,
  timestamp,
  aggregationPipeline,
  collections,
  mongoQuery = false,
  className = ""
}) => {
  const [showSql, setShowSql] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('results');
  const [activeResultTab, setActiveResultTab] = useState('table');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopySql = async () => {
    const queryText = mongoQuery && aggregationPipeline 
      ? JSON.stringify(aggregationPipeline, null, 2)
      : sql;
    const success = await copyToClipboard(queryText);
    if (success) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  const handleExportResults = (format) => {
    // Handle string results from MongoDB backend
    let parsedResults = results;
    if (typeof results === 'string') {
      try {
        parsedResults = JSON.parse(results);
      } catch (e) {
        console.error('Failed to parse results for export:', e);
        return;
      }
    }
    
    if (!parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `query_results_${timestamp}`;
    
    if (format === 'csv') {
      exportUtils.downloadCsv(parsedResults, `${filename}.csv`);
    } else {
      exportUtils.downloadJson(parsedResults, `${filename}.json`);
    }
  };

  const renderTable = () => {
    // Handle string results from MongoDB backend
    let parsedResults = results;
    if (typeof results === 'string') {
      try {
        parsedResults = JSON.parse(results);
      } catch (e) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Raw results: {results}</p>
          </div>
        );
      }
    }

    if (!parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No results found</p>
        </div>
      );
    }

    const columns = Object.keys(parsedResults[0]);
    const maxRows = 100; // Limit displayed rows for performance
    const displayResults = parsedResults.slice(0, maxRows);
    const hasMoreRows = parsedResults.length > maxRows;

    return (
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{parsedResults.length} rows returned</span>
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
    // Handle string results from MongoDB backend
    let parsedResults = results;
    if (typeof results === 'string') {
      try {
        parsedResults = JSON.parse(results);
      } catch (e) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No data to visualize</p>
          </div>
        );
      }
    }

    if (!parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0) {
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
            Detected {parsedResults.length} data points across {Object.keys(parsedResults[0]).length} dimensions
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

  // Chat response format with dropdown
  const getResultCount = () => {
    if (!results) return 0;
    if (typeof results === 'string') {
      try {
        const parsed = JSON.parse(results);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        return 0;
      }
    }
    return Array.isArray(results) ? results.length : 0;
  };
  
  const resultCount = getResultCount();
  const hasResults = resultCount > 0;
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Chat Response Message */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-relaxed text-foreground">
              {responseContent ? 
                <FormattedText content={responseContent} />
                : 'Query executed successfully'}
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        </div>
        
        {/* Dropdown Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 p-1 h-auto font-normal relative z-10"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show details
            </>
          )}
        </Button>
      </div>
      
      {/* Expandable Results Section */}
      {isExpanded && (
        <Card className="relative z-0 bg-background border shadow-sm">
          <CardContent className="space-y-4 p-4">
            {/* Summary Information */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-3">
              <div className="flex items-center gap-4">
                {timestamp && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(timestamp)}
                  </span>
                )}
                {resultCount > 0 && (
                  <span>
                    Found {resultCount} result{resultCount !== 1 ? 's' : ''}
                  </span>
                )}
                {mongoQuery && collections && (
                  <span>
                    Collections: {Array.isArray(collections) ? collections.join(', ') : collections}
                  </span>
                )}
              </div>
            </div>

            {/* Main Tabs for Results and Query Details */}
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Results {hasResults && `(${resultCount})`}
                </TabsTrigger>
                <TabsTrigger value="query" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Query Details
                </TabsTrigger>
              </TabsList>
              
              {/* Results Tab */}
              <TabsContent value="results" className="mt-4">
                {hasResults ? (
                  <div className="space-y-4">
                    <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
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
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Query Details Tab */}
              <TabsContent value="query" className="mt-4">
                <div className="space-y-4">
                  {/* Query Information */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {mongoQuery ? 'MongoDB Aggregation Pipeline' : 'Generated SQL Query'}
                      </span>
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
                    
                    {showSql && (sql || (mongoQuery && aggregationPipeline)) && (
                      <div className="space-y-2">
                        <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto max-h-64">
                          <code>
                            {mongoQuery && aggregationPipeline 
                              ? JSON.stringify(aggregationPipeline, null, 2)
                              : sql}
                          </code>
                        </pre>
                        
                        {mongoQuery && collections && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Collections used: </span>
                            {Array.isArray(collections) ? collections.join(', ') : collections}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!sql && !aggregationPipeline && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No query details available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
