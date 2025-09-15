"use client"

import { useState } from "react"
import { Clock, Database, Copy, Download, ChevronDown, ChevronUp, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { QueryResult } from "@/types/database"

interface SQLResultDisplayProps {
  result: QueryResult
}

export function SQLResultDisplay({ result }: SQLResultDisplayProps) {
  const [isQueryOpen, setIsQueryOpen] = useState(false)

  const copyResultAsJSON = () => {
    const jsonData = JSON.stringify(result.result, null, 2)
    navigator.clipboard.writeText(jsonData)
  }

  const copyQuery = () => {
    navigator.clipboard.writeText(result.query)
  }

  const downloadResultAsCSV = () => {
    if (!result.result.columns || !result.result.rows) return

    const csvContent = [
      result.result.columns.join(","),
      ...result.result.rows.map((row: any[]) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `query-result-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatResultAsText = () => {
    if (!result.result.columns || !result.result.rows) return "No data available"

    const { columns, rows } = result.result
    let text = `Found ${rows.length} result${rows.length !== 1 ? "s" : ""}:\n\n`

    rows.forEach((row: any[], index: number) => {
      text += `Record ${index + 1}:\n`
      columns.forEach((column: string, colIndex: number) => {
        const value = row[colIndex] === null ? "NULL" : String(row[colIndex])
        text += `  ${column}: ${value}\n`
      })
      text += "\n"
    })

    return text.trim()
  }

  if (result.error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-destructive">Query Error</CardTitle>
            <Badge variant="destructive">Error</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-destructive bg-destructive/10 p-3 rounded border overflow-x-auto">
            <code>{result.error}</code>
          </pre>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Query Results</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{result.executionTime.toFixed(0)}ms</span>
              </div>
              <Badge variant="secondary">{result.result.rowCount} rows</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.result.columns && result.result.rows ? (
            <>
              <div className="bg-muted/30 p-4 rounded-lg border">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {formatResultAsText()}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyResultAsJSON} className="gap-2 bg-transparent">
                  <Copy className="h-3 w-3" />
                  Copy as JSON
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResultAsCSV} className="gap-2 bg-transparent">
                  <Download className="h-3 w-3" />
                  Download CSV
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No data to display</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Collapsible open={isQueryOpen} onOpenChange={setIsQueryOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between gap-2 bg-transparent">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span>View Query Details</span>
            </div>
            {isQueryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">SQL Query</span>
                </div>
                <Button variant="ghost" size="sm" onClick={copyQuery} className="h-8 w-8 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                <code className="font-mono text-foreground">{result.query}</code>
              </pre>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
