"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Copy, Code, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTheme } from "next-themes"
import { useDatabaseStore } from "@/hooks/use-database-store"
import { SQLResultDisplay } from "./sql-result-display"

export function ChatInterface() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { theme } = useTheme()
  const { connections, activeConnectionId, chatHistory, addMessage } = useDatabaseStore()
  const activeConnection = connections.find((conn) => conn.id === activeConnectionId)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const toggleMessageExpansion = (messageId: string) => {
    const newExpanded = new Set(expandedMessages)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedMessages(newExpanded)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeConnection || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message
    addMessage({
      type: "user",
      content: userMessage,
    })

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock AI response with SQL query
    const mockSQLQuery = generateMockSQL(userMessage)
    const mockResult = generateMockResult(userMessage)

    const naturalResponse = generateNaturalResponse(userMessage, mockResult)

    addMessage({
      type: "assistant",
      content: naturalResponse,
      query: mockSQLQuery,
      result: {
        id: crypto.randomUUID(),
        query: mockSQLQuery,
        result: mockResult,
        executionTime: Math.random() * 100 + 50,
        timestamp: new Date(),
      },
    })

    setIsLoading(false)
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (!activeConnection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Database Selected</h3>
          <p className="text-muted-foreground">Select a database connection to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full px-6">
          <div className="py-6 space-y-6">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Start a conversation</h3>
                <p className="text-muted-foreground mb-4">Ask me anything about your database using natural language</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    Show me all users
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    What tables do I have?
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    Find recent orders
                  </Badge>
                </div>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {message.type === "user" ? (
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground m-0">{message.content}</p>
                    </div>

                    {message.query && message.result && (
                      <Collapsible
                        open={expandedMessages.has(message.id)}
                        onOpenChange={() => toggleMessageExpansion(message.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 gap-2 hover:text-foreground ${
                              theme === "dark" ? "text-blue-400" : "text-orange-500"
                            }`}
                          >
                            {expandedMessages.has(message.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Code className="h-4 w-4" />
                            <span className="text-sm">View Query & Results</span>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 mt-2">
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Code className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">SQL Query</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.query!)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
                                <code className="font-mono text-foreground">{message.query}</code>
                              </pre>
                            </CardContent>
                          </Card>
                          <SQLResultDisplay result={message.result} />
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your query...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="border-t bg-card px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your database..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

function generateNaturalResponse(userInput: string, result: any): string {
  const input = userInput.toLowerCase()
  const rowCount = result.rowCount

  if (input.includes("user") || input.includes("customer")) {
    return `I found ${rowCount} users in your database. The results include their names, email addresses, and registration dates. You can expand the details below to see the full query and data.`
  }

  if (input.includes("table") || input.includes("schema")) {
    return `Your database contains ${rowCount} tables. I can see tables for users, orders, products, and categories. Click below to view the complete schema information.`
  }

  if (input.includes("order") || input.includes("purchase")) {
    return `I found ${rowCount} recent orders from the past week. The orders include both completed and pending transactions with customer details. Expand below to see the full breakdown.`
  }

  return `I've executed your query and found ${rowCount} results. You can view the detailed query and results by expanding the section below.`
}

// Mock functions for demonstration
function generateMockSQL(userInput: string): string {
  const input = userInput.toLowerCase()

  if (input.includes("user") || input.includes("customer")) {
    return "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10;"
  }

  if (input.includes("table") || input.includes("schema")) {
    return "SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public';"
  }

  if (input.includes("order") || input.includes("purchase")) {
    return "SELECT o.id, o.total, o.status, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.created_at >= NOW() - INTERVAL '7 days' ORDER BY o.created_at DESC;"
  }

  return "SELECT * FROM your_table LIMIT 10;"
}

function generateMockResult(userInput: string) {
  const input = userInput.toLowerCase()

  if (input.includes("user") || input.includes("customer")) {
    return {
      columns: ["id", "name", "email", "created_at"],
      rows: [
        [1, "John Doe", "john@example.com", "2024-01-15"],
        [2, "Jane Smith", "jane@example.com", "2024-01-14"],
        [3, "Bob Johnson", "bob@example.com", "2024-01-13"],
      ],
      rowCount: 3,
    }
  }

  if (input.includes("table") || input.includes("schema")) {
    return {
      columns: ["table_name", "table_type"],
      rows: [
        ["users", "BASE TABLE"],
        ["orders", "BASE TABLE"],
        ["products", "BASE TABLE"],
        ["categories", "BASE TABLE"],
      ],
      rowCount: 4,
    }
  }

  if (input.includes("order") || input.includes("purchase")) {
    return {
      columns: ["id", "total", "status", "customer_name"],
      rows: [
        [101, "$299.99", "completed", "John Doe"],
        [102, "$149.50", "pending", "Jane Smith"],
        [103, "$89.99", "completed", "Bob Johnson"],
      ],
      rowCount: 3,
    }
  }

  return {
    columns: ["id", "data"],
    rows: [
      [1, "Sample data"],
      [2, "More data"],
    ],
    rowCount: 2,
  }
}
