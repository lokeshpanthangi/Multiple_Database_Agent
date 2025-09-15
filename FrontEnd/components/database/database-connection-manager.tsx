"use client"

import { useState } from "react"
import { Plus, Database, Trash2, Settings, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDatabaseStore } from "@/hooks/use-database-store"
import type { DatabaseConnection } from "@/types/database"
import { DatabaseSetupDialog } from "./database-setup-dialog"

export function DatabaseConnectionManager() {
  const [showSetup, setShowSetup] = useState(false)
  const { connections, activeConnectionId, setActiveConnection, removeConnection } = useDatabaseStore()

  const getStatusColor = (status: DatabaseConnection["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-muted-foreground"
    }
  }

  const getStatusText = (status: DatabaseConnection["status"]) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting"
      case "error":
        return "Error"
      default:
        return "Disconnected"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Database Connections</h2>
        <Button onClick={() => setShowSetup(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {connections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No databases connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect to your first database to start querying with natural language
            </p>
            <Button onClick={() => setShowSetup(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Database
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {connections.map((connection) => (
            <Card
              key={connection.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeConnectionId === connection.id ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => setActiveConnection(connection.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Circle className={`h-3 w-3 ${getStatusColor(connection.status)}`} />
                      <CardTitle
                        className={`text-base ${activeConnectionId === connection.id ? "text-foreground" : ""}`}
                      >
                        {connection.name}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {connection.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open settings dialog
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeConnection(connection.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between text-sm ${
                      activeConnectionId === connection.id ? "text-muted-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span>{getStatusText(connection.status)}</span>
                    {connection.lastUsed && <span>Last used: {connection.lastUsed.toLocaleDateString()}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DatabaseSetupDialog open={showSetup} onOpenChange={setShowSetup} />
    </div>
  )
}
