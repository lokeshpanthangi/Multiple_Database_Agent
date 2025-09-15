"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Download, Upload } from "lucide-react"
import { useDatabaseStore } from "@/hooks/use-database-store"
import { useTheme } from "next-themes"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { connections, chatHistory, queryHistory, clearChat, clearQueryHistory } = useDatabaseStore()

  const [queryTimeout, setQueryTimeout] = useState("30")
  const [resultLimit, setResultLimit] = useState("1000")
  const [autoSave, setAutoSave] = useState(true)
  const [showExecutionTime, setShowExecutionTime] = useState(true)

  const exportData = () => {
    const data = {
      connections: connections.map((conn) => ({
        ...conn,
        credentials: {}, // Don't export sensitive credentials
      })),
      chatHistory,
      queryHistory,
      settings: {
        queryTimeout,
        resultLimit,
        autoSave,
        showExecutionTime,
        theme,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sql-agent-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            // Handle import logic here
            console.log("Import data:", data)
          } catch (error) {
            console.error("Failed to import data:", error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="execution-time">Show Execution Time</Label>
                  <p className="text-sm text-muted-foreground">Display query execution time in results</p>
                </div>
                <Switch id="execution-time" checked={showExecutionTime} onCheckedChange={setShowExecutionTime} />
              </div>
            </CardContent>
          </Card>

          {/* Query Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Query Settings</CardTitle>
              <CardDescription>Configure query execution behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout">Query Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={queryTimeout}
                    onChange={(e) => setQueryTimeout(e.target.value)}
                    min="1"
                    max="300"
                  />
                </div>
                <div>
                  <Label htmlFor="limit">Result Limit (rows)</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={resultLimit}
                    onChange={(e) => setResultLimit(e.target.value)}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save Query History</Label>
                  <p className="text-sm text-muted-foreground">Automatically save executed queries</p>
                </div>
                <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Management</CardTitle>
              <CardDescription>Manage your data and history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportData} className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={importData} className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Chat History</p>
                    <p className="text-sm text-muted-foreground">
                      Remove all chat messages ({chatHistory.length} messages)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChat}
                    disabled={chatHistory.length === 0}
                    className="gap-2 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Clear Query History</p>
                    <p className="text-sm text-muted-foreground">
                      Remove all saved queries ({queryHistory.length} queries)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearQueryHistory}
                    disabled={queryHistory.length === 0}
                    className="gap-2 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
              <CardDescription>Overview of your usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Connected Databases</p>
                  <p className="text-2xl font-bold text-primary">{connections.length}</p>
                </div>
                <div>
                  <p className="font-medium">Chat Messages</p>
                  <p className="text-2xl font-bold text-primary">{chatHistory.length}</p>
                </div>
                <div>
                  <p className="font-medium">Queries Executed</p>
                  <p className="text-2xl font-bold text-primary">{queryHistory.length}</p>
                </div>
                <div>
                  <p className="font-medium">Active Connections</p>
                  <p className="text-2xl font-bold text-primary">
                    {connections.filter((conn) => conn.status === "connected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
