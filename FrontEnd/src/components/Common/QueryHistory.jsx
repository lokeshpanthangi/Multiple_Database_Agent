import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { 
  History, 
  Search, 
  Star, 
  StarOff, 
  Copy, 
  Play, 
  Trash2, 
  Download,
  Filter,
  Clock,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { useAppState } from '../../hooks/useAppState.jsx';
import { formatTimestamp, formatExecutionTime, copyToClipboard } from '../../utils/index.js';

const QueryCard = ({ query, onExecute, onToggleFavorite, onDelete, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(query.sql);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(query);
    }
  };

  const getStatusIcon = (success) => {
    return success ? (
      <CheckCircle2 className="h-3 w-3 text-green-500" />
    ) : (
      <AlertCircle className="h-3 w-3 text-red-500" />
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm truncate">
              {query.description || query.originalQuery}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(query.timestamp)}
              {query.executionTime && (
                <>
                  <span>•</span>
                  <span>{formatExecutionTime(query.executionTime)}</span>
                </>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1">
            {getStatusIcon(query.success)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(query.id)}
              className="h-6 w-6 p-0"
            >
              {query.favorite ? (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* SQL Query */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">SQL Query</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 text-xs"
              >
                {copied ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-20">
            <code>{query.sql}</code>
          </pre>
        </div>

        {/* Results Summary */}
        {query.results && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{query.results.length} rows returned</span>
            {query.results.length > 0 && (
              <span>{Object.keys(query.results[0]).length} columns</span>
            )}
          </div>
        )}

        {/* Database Info */}
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {query.databaseName || 'Unknown Database'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExecute(query)}
              className="h-7 px-2 text-xs"
            >
              <Play className="h-3 w-3 mr-1" />
              Run Again
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <span className="sr-only">More options</span>
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleFavorite(query.id)}>
                {query.favorite ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(query.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export const QueryHistory = ({ onExecuteQuery, className = "" }) => {
  const { state, actions } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [filterBy, setFilterBy] = useState('all');

  // Mock query history data (in real app, this would come from state)
  const mockQueries = [
    {
      id: '1',
      originalQuery: 'Show me all users created in the last 30 days',
      sql: 'SELECT * FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      executionTime: 245,
      success: true,
      favorite: true,
      databaseName: 'Production DB',
      results: Array(15).fill().map((_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
    },
    {
      id: '2',
      originalQuery: 'What are the top 5 products by sales?',
      sql: 'SELECT product_name, SUM(sales) as total_sales FROM products GROUP BY product_name ORDER BY total_sales DESC LIMIT 5',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      executionTime: 156,
      success: true,
      favorite: false,
      databaseName: 'Analytics DB',
      results: Array(5).fill().map((_, i) => ({ product: `Product ${i + 1}`, sales: 1000 - i * 100 }))
    },
    {
      id: '3',
      originalQuery: 'Find customers with no orders',
      sql: 'SELECT c.* FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.customer_id IS NULL',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      executionTime: 1200,
      success: false,
      favorite: false,
      databaseName: 'Production DB',
      error: 'Table "orders" does not exist'
    }
  ];

  const filteredQueries = useMemo(() => {
    let filtered = mockQueries.filter(query => {
      const matchesSearch = 
        query.originalQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.sql.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'favorites' && query.favorite) ||
        (filterBy === 'successful' && query.success) ||
        (filterBy === 'failed' && !query.success);
      
      return matchesSearch && matchesFilter;
    });

    // Sort queries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'executionTime':
          return (b.executionTime || 0) - (a.executionTime || 0);
        case 'favorite':
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, filterBy]);

  const handleExecuteQuery = (query) => {
    onExecuteQuery?.(query.originalQuery);
  };

  const handleToggleFavorite = (queryId) => {
    // In real app, this would update the query in state
    console.log('Toggle favorite for query:', queryId);
  };

  const handleDeleteQuery = (queryId) => {
    if (window.confirm('Are you sure you want to delete this query from history?')) {
      // In real app, this would remove the query from state
      console.log('Delete query:', queryId);
    }
  };

  const handleCopyQuery = (query) => {
    // Optional callback when query is copied
    console.log('Copied query:', query.id);
  };

  const handleExportHistory = () => {
    const exportData = {
      queries: filteredQueries,
      exportedAt: new Date().toISOString(),
      totalQueries: mockQueries.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const favoriteQueries = filteredQueries.filter(q => q.favorite);
  const recentQueries = filteredQueries.slice(0, 10);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Query History</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportHistory}
          disabled={filteredQueries.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {filterBy === 'all' ? 'All' : filterBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                All Queries ({mockQueries.length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('favorites')}>
                Favorites ({mockQueries.filter(q => q.favorite).length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('successful')}>
                Successful ({mockQueries.filter(q => q.success).length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('failed')}>
                Failed ({mockQueries.filter(q => !q.success).length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort: {sortBy === 'timestamp' ? 'Recent' : sortBy}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('timestamp')}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('executionTime')}>
                Execution Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('favorite')}>
                Favorites First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredQueries.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favoriteQueries.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({recentQueries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredQueries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No queries found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start executing queries to build your history'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredQueries.map(query => (
                <QueryCard
                  key={query.id}
                  query={query}
                  onExecute={handleExecuteQuery}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteQuery}
                  onCopy={handleCopyQuery}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteQueries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorite queries</h3>
                <p className="text-muted-foreground">
                  Star queries to save them as favorites for quick access
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {favoriteQueries.map(query => (
                <QueryCard
                  key={query.id}
                  query={query}
                  onExecute={handleExecuteQuery}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteQuery}
                  onCopy={handleCopyQuery}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {recentQueries.map(query => (
              <QueryCard
                key={query.id}
                query={query}
                onExecute={handleExecuteQuery}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteQuery}
                onCopy={handleCopyQuery}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      {mockQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Query Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{mockQueries.length}</div>
                <div className="text-muted-foreground">Total Queries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockQueries.filter(q => q.success).length}
                </div>
                <div className="text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockQueries.filter(q => q.favorite).length}
                </div>
                <div className="text-muted-foreground">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(mockQueries.reduce((acc, q) => acc + (q.executionTime || 0), 0) / mockQueries.length)}ms
                </div>
                <div className="text-muted-foreground">Avg Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
