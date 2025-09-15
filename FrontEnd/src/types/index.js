// Database Types
export const DATABASE_TYPES = {
  POSTGRESQL: 'postgresql',
  MYSQL: 'mysql',
  SQLITE: 'sqlite',
  MONGODB: 'mongodb',
  SUPABASE: 'supabase',
  NEONDB: 'neondb',
  PLANETSCALE: 'planetscale',
  FIREBASE: 'firebase',
  REDIS: 'redis',
  CASSANDRA: 'cassandra',
  OTHER_SQL: 'other_sql',
  OTHER_NOSQL: 'other_nosql'
};

// Database Connection Configuration
export const createDatabaseConfig = (type, credentials, nickname = '') => ({
  id: Date.now().toString(),
  type,
  nickname,
  credentials,
  status: 'disconnected',
  lastQuery: null,
  lastQueryTime: null,
  stats: {
    tables: 0,
    collections: 0,
    lastConnected: null
  }
});

// Message Types for Chat
export const MESSAGE_TYPES = {
  USER: 'user',
  AGENT: 'agent',
  SQL_QUERY: 'sql_query',
  QUERY_RESULT: 'query_result',
  ERROR: 'error'
};

// Chat Message Structure
export const createChatMessage = (type, content, metadata = {}) => ({
  id: Date.now().toString(),
  type,
  content,
  timestamp: new Date().toISOString(),
  metadata
});

// Application State Structure
export const createInitialState = () => ({
  databases: [],
  activeDatabaseId: null,
  chatHistory: {},
  queryHistory: [],
  settings: {
    theme: 'light',
    queryTimeout: 30000,
    resultLimit: 1000,
    exportFormat: 'json'
  },
  ui: {
    sidebarOpen: true,
    loading: false,
    error: null
  }
});

// Database Credential Fields Configuration
export const DATABASE_CREDENTIAL_FIELDS = {
  [DATABASE_TYPES.POSTGRESQL]: [
    { name: 'host', label: 'Host', type: 'text', required: true },
    { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 5432 },
    { name: 'database', label: 'Database Name', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'ssl', label: 'SSL Mode', type: 'select', options: ['disable', 'require', 'prefer'] }
  ],
  [DATABASE_TYPES.MYSQL]: [
    { name: 'host', label: 'Host', type: 'text', required: true },
    { name: 'port', label: 'Port', type: 'number', required: true, defaultValue: 3306 },
    { name: 'database', label: 'Database Name', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'ssl', label: 'SSL Mode', type: 'select', options: ['disable', 'require', 'prefer'] }
  ],
  [DATABASE_TYPES.SQLITE]: [
    { name: 'filePath', label: 'File Path', type: 'text', required: true }
  ],
  [DATABASE_TYPES.MONGODB]: [
    { name: 'connectionString', label: 'Connection String/Database URL', type: 'text', required: true },
    { name: 'database', label: 'Database Name (optional)', type: 'text', required: false }
  ],
  [DATABASE_TYPES.SUPABASE]: [
    { name: 'projectUrl', label: 'Project URL', type: 'text', required: true },
    { name: 'apiKey', label: 'API Key (Anon/Public)', type: 'password', required: true },
    { name: 'databaseUrl', label: 'Database URL', type: 'text', required: true }
  ],
  [DATABASE_TYPES.NEONDB]: [
    { name: 'connectionString', label: 'Connection String', type: 'text', required: true },
    { name: 'database', label: 'Database Name', type: 'text', required: true }
  ],
  [DATABASE_TYPES.FIREBASE]: [
    { name: 'projectId', label: 'Project ID', type: 'text', required: true },
    { name: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'file', required: true }
  ]
};
