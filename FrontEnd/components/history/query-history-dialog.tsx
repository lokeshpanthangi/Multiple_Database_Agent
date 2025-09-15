"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Clock, Database, Copy, Play, Star, Trash2 } from "lucide-react"
import { useDatabaseStore } from "@/hooks/use-database-store"

interface QueryHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QueryHistoryDialog({ open, onOpenChange }: QueryHistoryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const { queryHistory, connections } = useDatabaseStore()

  const filteredHistory = queryHistory.filter((query) => query.query.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFavorite = (queryId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(queryId)) {
      newFavorites.delete(queryId)
    } else {
      newFavorites.add(queryId)
    }
    setFavorites(newFavorites)
  }

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query)
  }

  const rerunQuery = (query: string) => {
    // In a real app, this would execute the query
    console.log("Rerunning query:", query)
  }

  const formatExecutionTime = (time: number) => {
    if (time < 1000) {
      return `${time.toFixed(0)}ms`
    }
    return `${(time / 1000).toFixed(1)}s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Query History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* History List */}
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {searchQuery ? "No matching queries" : "No query history"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Try adjusting your search terms" : "Execute some queries to see them here"}
                  </p>
                </div>
              ) : (
                filteredHistory.map((queryResult) => (
                  <Card key={queryResult.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {queryResult.timestamp.toLocaleString()}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {formatExecutionTime(queryResult.executionTime)}
                            </Badge>
                            {queryResult.error && (
                              <Badge variant="destructive" className="text-xs">
                                Error
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(queryResult.id)}
                            className={favorites.has(queryResult.id) ? "text-yellow-500" : ""}
                          >
                            <Star className={`h-4 w-4 ${favorites.has(queryResult.id) ? "fill-current" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyQuery(queryResult.query)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => rerunQuery(queryResult.query)}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <pre className="text-sm bg-muted p-3 rounded border overflow-x-auto">
                          <code className="font-mono">{queryResult.query}</code>
                        </pre>

                        {queryResult.error ? (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border">
                            {queryResult.error}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Returned {queryResult.result?.rowCount || 0} rows
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
