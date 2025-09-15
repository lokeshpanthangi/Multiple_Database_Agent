import { createContext, useContext, useReducer, useEffect } from 'react';
import { createInitialState, createChatMessage, MESSAGE_TYPES } from '../types/index.js';
import { storage, themeUtils } from '../utils/index.js';

// Create context
const AppStateContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_DATABASE: 'ADD_DATABASE',
  REMOVE_DATABASE: 'REMOVE_DATABASE',
  UPDATE_DATABASE: 'UPDATE_DATABASE',
  SET_ACTIVE_DATABASE: 'SET_ACTIVE_DATABASE',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  CLEAR_CHAT_HISTORY: 'CLEAR_CHAT_HISTORY',
  ADD_QUERY_TO_HISTORY: 'ADD_QUERY_TO_HISTORY',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_THEME: 'SET_THEME',
  LOAD_PERSISTED_STATE: 'LOAD_PERSISTED_STATE',
};

// Reducer function
const appStateReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        ui: { ...state.ui, error: null }
      };

    case ACTIONS.ADD_DATABASE:
      return {
        ...state,
        databases: [...state.databases, action.payload],
        activeDatabaseId: state.activeDatabaseId || action.payload.id
      };

    case ACTIONS.REMOVE_DATABASE:
      const filteredDatabases = state.databases.filter(db => db.id !== action.payload);
      const newActiveDatabaseId = state.activeDatabaseId === action.payload 
        ? (filteredDatabases.length > 0 ? filteredDatabases[0].id : null)
        : state.activeDatabaseId;
      
      return {
        ...state,
        databases: filteredDatabases,
        activeDatabaseId: newActiveDatabaseId,
        chatHistory: {
          ...state.chatHistory,
          [action.payload]: undefined
        }
      };

    case ACTIONS.UPDATE_DATABASE:
      return {
        ...state,
        databases: state.databases.map(db => 
          db.id === action.payload.id ? { ...db, ...action.payload.updates } : db
        )
      };

    case ACTIONS.SET_ACTIVE_DATABASE:
      return {
        ...state,
        activeDatabaseId: action.payload
      };

    case ACTIONS.ADD_CHAT_MESSAGE:
      const { databaseId, message } = action.payload;
      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [databaseId]: [
            ...(state.chatHistory[databaseId] || []),
            message
          ]
        }
      };

    case ACTIONS.CLEAR_CHAT_HISTORY:
      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [action.payload]: []
        }
      };

    case ACTIONS.ADD_QUERY_TO_HISTORY:
      return {
        ...state,
        queryHistory: [action.payload, ...state.queryHistory.slice(0, 99)] // Keep last 100 queries
      };

    case ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };

    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case ACTIONS.SET_THEME:
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload }
      };

    case ACTIONS.LOAD_PERSISTED_STATE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Provider component
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, createInitialState());

  // Load persisted state on mount
  useEffect(() => {
    const persistedDatabases = storage.get('databases', []);
    const persistedSettings = storage.get('settings', {});
    const persistedChatHistory = storage.get('chatHistory', {});
    const persistedQueryHistory = storage.get('queryHistory', []);
    const persistedActiveDatabaseId = storage.get('activeDatabaseId', null);

    // Initialize theme
    const theme = themeUtils.initTheme();

    dispatch({
      type: ACTIONS.LOAD_PERSISTED_STATE,
      payload: {
        databases: persistedDatabases,
        settings: { ...state.settings, ...persistedSettings, theme },
        chatHistory: persistedChatHistory,
        queryHistory: persistedQueryHistory,
        activeDatabaseId: persistedActiveDatabaseId
      }
    });
  }, []);

  // Persist state changes
  useEffect(() => {
    storage.set('databases', state.databases);
  }, [state.databases]);

  useEffect(() => {
    storage.set('settings', state.settings);
  }, [state.settings]);

  useEffect(() => {
    storage.set('chatHistory', state.chatHistory);
  }, [state.chatHistory]);

  useEffect(() => {
    storage.set('queryHistory', state.queryHistory);
  }, [state.queryHistory]);

  useEffect(() => {
    storage.set('activeDatabaseId', state.activeDatabaseId);
  }, [state.activeDatabaseId]);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
    
    addDatabase: (database) => dispatch({ type: ACTIONS.ADD_DATABASE, payload: database }),
    
    removeDatabase: (databaseId) => dispatch({ type: ACTIONS.REMOVE_DATABASE, payload: databaseId }),
    
    updateDatabase: (databaseId, updates) => dispatch({ 
      type: ACTIONS.UPDATE_DATABASE, 
      payload: { id: databaseId, updates } 
    }),
    
    setActiveDatabase: (databaseId) => dispatch({ type: ACTIONS.SET_ACTIVE_DATABASE, payload: databaseId }),
    
    addChatMessage: (databaseId, type, content, metadata = {}) => {
      const message = createChatMessage(type, content, metadata);
      dispatch({ 
        type: ACTIONS.ADD_CHAT_MESSAGE, 
        payload: { databaseId, message } 
      });
      return message;
    },
    
    clearChatHistory: (databaseId) => dispatch({ type: ACTIONS.CLEAR_CHAT_HISTORY, payload: databaseId }),
    
    addQueryToHistory: (query) => dispatch({ type: ACTIONS.ADD_QUERY_TO_HISTORY, payload: query }),
    
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
    
    updateSettings: (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings }),
    
    toggleTheme: () => {
      const newTheme = themeUtils.toggleTheme();
      dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
    }
  };

  // Computed values
  const computed = {
    activeDatabase: state.databases.find(db => db.id === state.activeDatabaseId) || null,
    activeChatHistory: state.chatHistory[state.activeDatabaseId] || [],
    connectedDatabases: state.databases.filter(db => db.status === 'connected'),
    hasError: !!state.ui.error,
    isLoading: state.ui.loading
  };

  const value = {
    state,
    actions,
    computed
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Additional custom hooks for specific functionality
export const useDatabase = () => {
  const { state, actions, computed } = useAppState();
  
  return {
    databases: state.databases,
    activeDatabase: computed.activeDatabase,
    connectedDatabases: computed.connectedDatabases,
    addDatabase: actions.addDatabase,
    removeDatabase: actions.removeDatabase,
    updateDatabase: actions.updateDatabase,
    setActiveDatabase: actions.setActiveDatabase
  };
};

export const useChat = () => {
  const { state, actions, computed } = useAppState();
  
  return {
    chatHistory: computed.activeChatHistory,
    addMessage: (type, content, metadata) => 
      actions.addChatMessage(state.activeDatabaseId, type, content, metadata),
    clearHistory: () => actions.clearChatHistory(state.activeDatabaseId),
    activeDatabaseId: state.activeDatabaseId
  };
};

export const useSettings = () => {
  const { state, actions } = useAppState();
  
  return {
    settings: state.settings,
    updateSettings: actions.updateSettings,
    toggleTheme: actions.toggleTheme
  };
};
