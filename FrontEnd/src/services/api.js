// API service for communicating with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Database connection API
export const databaseApi = {
  // Test and save database connection
  connect: async (databaseConfig) => {
    return apiRequest('/connect', {
      method: 'POST',
      body: JSON.stringify(databaseConfig),
    });
  },

  // Get list of connected databases
  getDatabases: async () => {
    return apiRequest('/databases', {
      method: 'GET',
    });
  },

  // Remove database connection
  disconnect: async (databaseId) => {
    return apiRequest('/disconnect', {
      method: 'DELETE',
      body: JSON.stringify({ databaseId }),
    });
  },

  // Test connection without saving
  testConnection: async (databaseConfig) => {
    return apiRequest('/test-connection', {
      method: 'POST',
      body: JSON.stringify(databaseConfig),
    });
  },

  // Get database schema/structure
  getSchema: async (databaseId) => {
    return apiRequest(`/databases/${databaseId}/schema`, {
      method: 'GET',
    });
  },

  // Get database statistics
  getStats: async (databaseId) => {
    return apiRequest(`/databases/${databaseId}/stats`, {
      method: 'GET',
    });
  },
};

// Query API
export const queryApi = {
  // Send natural language query
  executeQuery: async (databaseId, query, options = {}) => {
    return apiRequest('/query', {
      method: 'POST',
      body: JSON.stringify({
        databaseId,
        query,
        options,
      }),
    });
  },

  // Execute raw SQL query
  executeRawSql: async (databaseId, sql, options = {}) => {
    return apiRequest('/execute-sql', {
      method: 'POST',
      body: JSON.stringify({
        databaseId,
        sql,
        options,
      }),
    });
  },

  // Get query suggestions
  getSuggestions: async (databaseId, partialQuery) => {
    return apiRequest('/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        databaseId,
        partialQuery,
      }),
    });
  },
};

// Chat history API
export const chatApi = {
  // Get chat history for a database
  getHistory: async (databaseId, limit = 50, offset = 0) => {
    return apiRequest(`/history?databaseId=${databaseId}&limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  },

  // Save chat message
  saveMessage: async (databaseId, message) => {
    return apiRequest('/history', {
      method: 'POST',
      body: JSON.stringify({
        databaseId,
        message,
      }),
    });
  },

  // Clear chat history
  clearHistory: async (databaseId) => {
    return apiRequest(`/history/${databaseId}`, {
      method: 'DELETE',
    });
  },

  // Export chat history
  exportHistory: async (databaseId, format = 'json') => {
    return apiRequest(`/history/${databaseId}/export?format=${format}`, {
      method: 'GET',
    });
  },
};

// Query history API
export const queryHistoryApi = {
  // Get query history
  getQueryHistory: async (databaseId, limit = 100) => {
    return apiRequest(`/query-history?databaseId=${databaseId}&limit=${limit}`, {
      method: 'GET',
    });
  },

  // Save query to history
  saveQuery: async (databaseId, query, sql, results, executionTime) => {
    return apiRequest('/query-history', {
      method: 'POST',
      body: JSON.stringify({
        databaseId,
        query,
        sql,
        results,
        executionTime,
      }),
    });
  },

  // Favorite/unfavorite a query
  toggleFavorite: async (queryId) => {
    return apiRequest(`/query-history/${queryId}/favorite`, {
      method: 'POST',
    });
  },

  // Search query history
  searchHistory: async (databaseId, searchTerm) => {
    return apiRequest(`/query-history/search?databaseId=${databaseId}&q=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
    });
  },
};

// Mock API for development (when backend is not available)
export const mockApi = {
  connect: async (config) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
      success: true,
      database: {
        id: Date.now().toString(),
        ...config,
        status: 'connected',
        stats: {
          tables: Math.floor(Math.random() * 20) + 5,
          collections: config.type === 'mongodb' ? Math.floor(Math.random() * 10) + 3 : 0,
          lastConnected: new Date().toISOString(),
        },
      },
    };
  },

  query: async (databaseId, query) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      sql: `SELECT * FROM users WHERE name LIKE '%${query}%'`,
      results: [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-20' },
      ],
      executionTime: Math.floor(Math.random() * 500) + 100,
      explanation: `This query searches for users whose names contain "${query}". The SQL uses a LIKE operator with wildcards to perform a partial match.`,
    };
  },

  getDatabases: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      databases: [],
    };
  },
};

// Environment-based API selection
const isDevelopment = import.meta.env.DEV;
const useMockApi = isDevelopment && !import.meta.env.VITE_API_URL;

export const api = useMockApi ? mockApi : {
  database: databaseApi,
  query: queryApi,
  chat: chatApi,
  queryHistory: queryHistoryApi,
};
