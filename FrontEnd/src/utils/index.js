// Utility functions for the SQL Multidatabase Agent

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Format execution time
export const formatExecutionTime = (milliseconds) => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Validate database credentials
export const validateCredentials = (type, credentials) => {
  const errors = [];
  
  // Basic validation - can be extended based on database type
  if (!credentials || typeof credentials !== 'object') {
    errors.push('Credentials are required');
    return errors;
  }

  // Type-specific validation
  switch (type) {
    case 'postgresql':
    case 'mysql':
      if (!credentials.host) errors.push('Host is required');
      if (!credentials.port) errors.push('Port is required');
      if (!credentials.database) errors.push('Database name is required');
      if (!credentials.username) errors.push('Username is required');
      if (!credentials.password) errors.push('Password is required');
      break;
    case 'sqlite':
      if (!credentials.filePath) errors.push('File path is required');
      break;
    case 'mongodb':
      if (!credentials.connectionString) errors.push('Connection string is required');
      break;
    case 'supabase':
      if (!credentials.projectUrl) errors.push('Project URL is required');
      if (!credentials.apiKey) errors.push('API Key is required');
      if (!credentials.databaseUrl) errors.push('Database URL is required');
      break;
    case 'neondb':
      if (!credentials.connectionString) errors.push('Connection string is required');
      if (!credentials.database) errors.push('Database name is required');
      break;
    case 'firebase':
      if (!credentials.projectId) errors.push('Project ID is required');
      if (!credentials.serviceAccountKey) errors.push('Service Account Key is required');
      break;
  }

  return errors;
};

// Format SQL query for display
export const formatSqlQuery = (query) => {
  // Basic SQL formatting - can be enhanced with a proper SQL formatter
  return query
    .replace(/\s+/g, ' ')
    .replace(/,/g, ',\n  ')
    .replace(/FROM/gi, '\nFROM')
    .replace(/WHERE/gi, '\nWHERE')
    .replace(/ORDER BY/gi, '\nORDER BY')
    .replace(/GROUP BY/gi, '\nGROUP BY')
    .replace(/HAVING/gi, '\nHAVING')
    .replace(/JOIN/gi, '\nJOIN')
    .replace(/LEFT JOIN/gi, '\nLEFT JOIN')
    .replace(/RIGHT JOIN/gi, '\nRIGHT JOIN')
    .replace(/INNER JOIN/gi, '\nINNER JOIN')
    .trim();
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Debounce function for search and input handling
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Theme utilities
export const themeUtils = {
  toggleTheme: () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    storage.set('theme', newTheme);
    return newTheme;
  },
  
  initTheme: () => {
    const savedTheme = storage.get('theme', 'light');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    return savedTheme;
  }
};

// Export data utilities
export const exportUtils = {
  downloadJson: (data, filename = 'export.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  downloadCsv: (data, filename = 'export.csv') => {
    if (!Array.isArray(data) || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
