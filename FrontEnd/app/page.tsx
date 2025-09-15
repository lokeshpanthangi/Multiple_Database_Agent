"use client"

import { useState } from "react"
import { Menu, Settings, History, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import { DatabaseConnectionManager } from "@/components/database/database-connection-manager"
import { ChatInterface } from "@/components/chat/chat-interface"
import { SettingsDialog } from "@/components/settings/settings-dialog"
import { QueryHistoryDialog } from "@/components/history/query-history-dialog"
import { useDatabaseStore } from "@/hooks/use-database-store"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { theme, setTheme } = useTheme()
  const { connections, activeConnectionId } = useDatabaseStore()
  const activeConnection = connections.find((conn) => conn.id === activeConnectionId)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:border-r lg:bg-sidebar transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-16" : "lg:w-80"
        }`}
      >
        <div className="flex-1 flex flex-col h-screen">
          <div className="p-6 border-b flex-shrink-0 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">SQL Database Agent</h1>
                <p className="text-sm text-sidebar-foreground/70 mt-1">Query databases with natural language</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full shadow-inner">
                <div className="p-6">
                  <DatabaseConnectionManager />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-foreground">SQL Database Agent</h1>
              <p className="text-sm text-muted-foreground mt-1">Query databases with natural language</p>
            </div>
            <ScrollArea className="flex-1 shadow-inner">
              <div className="p-6">
                <DatabaseConnectionManager />
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b bg-card px-4 lg:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:block">
                {activeConnection ? (
                  <div>
                    <h2 className="font-semibold text-foreground">Database Chat</h2>
                    <p className="text-sm text-muted-foreground">Connected to {activeConnection.name}</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-semibold text-foreground">SQL Database Agent</h2>
                    <p className="text-sm text-muted-foreground">Select a database to get started</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
                <History className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <QueryHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  )
}
