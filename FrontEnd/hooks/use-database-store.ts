"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DatabaseConnection, ChatMessage, QueryResult } from "@/types/database"

interface DatabaseStore {
  connections: DatabaseConnection[]
  activeConnectionId: string | null
  chatHistory: ChatMessage[]
  queryHistory: QueryResult[]

  // Connection management
  addConnection: (connection: Omit<DatabaseConnection, "id" | "createdAt">) => void
  removeConnection: (id: string) => void
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => void
  setActiveConnection: (id: string | null) => void

  // Chat management
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  clearChat: () => void

  // Query history
  addQueryResult: (result: Omit<QueryResult, "id" | "timestamp">) => void
  clearQueryHistory: () => void
}

export const useDatabaseStore = create<DatabaseStore>()(
  persist(
    (set, get) => ({
      connections: [],
      activeConnectionId: null,
      chatHistory: [],
      queryHistory: [],

      addConnection: (connection) => {
        const newConnection: DatabaseConnection = {
          ...connection,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        set((state) => ({
          connections: [...state.connections, newConnection],
        }))
      },

      removeConnection: (id) => {
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          activeConnectionId: state.activeConnectionId === id ? null : state.activeConnectionId,
        }))
      },

      updateConnection: (id, updates) => {
        set((state) => ({
          connections: state.connections.map((conn) => (conn.id === id ? { ...conn, ...updates } : conn)),
        }))
      },

      setActiveConnection: (id) => {
        set({ activeConnectionId: id })
      },

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        set((state) => ({
          chatHistory: [...state.chatHistory, newMessage],
        }))
      },

      clearChat: () => {
        set({ chatHistory: [] })
      },

      addQueryResult: (result) => {
        const newResult: QueryResult = {
          ...result,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        set((state) => ({
          queryHistory: [newResult, ...state.queryHistory].slice(0, 100), // Keep last 100 queries
        }))
      },

      clearQueryHistory: () => {
        set({ queryHistory: [] })
      },
    }),
    {
      name: "database-store",
    },
  ),
)
