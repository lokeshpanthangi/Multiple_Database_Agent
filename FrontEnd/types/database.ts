export interface DatabaseConnection {
  id: string
  name: string
  type: DatabaseType
  credentials: DatabaseCredentials
  status: "connected" | "disconnected" | "connecting" | "error"
  lastUsed?: Date
  createdAt: Date
}

export type DatabaseType =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "mongodb"
  | "supabase"
  | "neondb"
  | "planetscale"
  | "firebase"
  | "redis"
  | "cassandra"

export interface DatabaseCredentials {
  // Common fields
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string

  // Specific to different database types
  connectionString?: string // MongoDB, NeonDB
  projectUrl?: string // Supabase
  apiKey?: string // Supabase
  projectId?: string // Firebase
  serviceAccountKey?: string // Firebase
  filePath?: string // SQLite
  sslMode?: boolean
}

export interface QueryResult {
  id: string
  query: string
  result: any
  executionTime: number
  timestamp: Date
  error?: string
}

export interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  query?: string
  result?: QueryResult
}
