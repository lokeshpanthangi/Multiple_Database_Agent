"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useDatabaseStore } from "@/hooks/use-database-store"
import type { DatabaseType, DatabaseCredentials } from "@/types/database"

interface DatabaseSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DATABASE_TYPES: { value: DatabaseType; label: string; description: string }[] = [
  { value: "postgresql", label: "PostgreSQL", description: "Open source relational database" },
  { value: "mysql", label: "MySQL", description: "Popular open source database" },
  { value: "sqlite", label: "SQLite", description: "Lightweight file-based database" },
  { value: "mongodb", label: "MongoDB", description: "Document-oriented NoSQL database" },
  { value: "supabase", label: "Supabase", description: "Open source Firebase alternative" },
  { value: "neondb", label: "NeonDB", description: "Serverless PostgreSQL" },
  { value: "planetscale", label: "PlanetScale", description: "Serverless MySQL platform" },
  { value: "firebase", label: "Firebase Firestore", description: "Google's NoSQL database" },
  { value: "redis", label: "Redis", description: "In-memory data structure store" },
  { value: "cassandra", label: "Cassandra", description: "Distributed NoSQL database" },
]

export function DatabaseSetupDialog({ open, onOpenChange }: DatabaseSetupDialogProps) {
  const [step, setStep] = useState<"type" | "credentials">("type")
  const [selectedType, setSelectedType] = useState<DatabaseType | null>(null)
  const [name, setName] = useState("")
  const [credentials, setCredentials] = useState<DatabaseCredentials>({})
  const [isConnecting, setIsConnecting] = useState(false)

  const { addConnection } = useDatabaseStore()

  const handleTypeSelect = (type: DatabaseType) => {
    setSelectedType(type)
    setStep("credentials")
    // Reset credentials when changing type
    setCredentials({})
  }

  const handleSubmit = async () => {
    if (!selectedType || !name) return

    setIsConnecting(true)

    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000))

    addConnection({
      name,
      type: selectedType,
      credentials,
      status: "connected", // In real app, this would be determined by actual connection test
    })

    setIsConnecting(false)
    onOpenChange(false)

    // Reset form
    setStep("type")
    setSelectedType(null)
    setName("")
    setCredentials({})
  }

  const renderCredentialFields = () => {
    if (!selectedType) return null

    switch (selectedType) {
      case "supabase":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                placeholder="https://your-project.supabase.co"
                value={credentials.projectUrl || ""}
                onChange={(e) => setCredentials({ ...credentials, projectUrl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="apiKey">API Key (Anon/Public)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={credentials.apiKey || ""}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="databaseUrl">Database URL (Optional)</Label>
              <Input
                id="databaseUrl"
                placeholder="postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres"
                value={credentials.connectionString || ""}
                onChange={(e) => setCredentials({ ...credentials, connectionString: e.target.value })}
              />
            </div>
          </div>
        )

      case "mongodb":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="connectionString">Connection String</Label>
              <Input
                id="connectionString"
                placeholder="mongodb://username:password@host:port/database"
                value={credentials.connectionString || ""}
                onChange={(e) => setCredentials({ ...credentials, connectionString: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="database">Database Name (Optional)</Label>
              <Input
                id="database"
                placeholder="my-database"
                value={credentials.database || ""}
                onChange={(e) => setCredentials({ ...credentials, database: e.target.value })}
              />
            </div>
          </div>
        )

      case "postgresql":
      case "mysql":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  value={credentials.host || ""}
                  onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder={selectedType === "postgresql" ? "5432" : "3306"}
                  value={credentials.port || ""}
                  onChange={(e) => setCredentials({ ...credentials, port: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="database">Database Name</Label>
              <Input
                id="database"
                placeholder="my-database"
                value={credentials.database || ""}
                onChange={(e) => setCredentials({ ...credentials, database: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={credentials.username || ""}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={credentials.password || ""}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ssl"
                checked={credentials.sslMode || false}
                onCheckedChange={(checked) => setCredentials({ ...credentials, sslMode: checked })}
              />
              <Label htmlFor="ssl">Enable SSL</Label>
            </div>
          </div>
        )

      case "sqlite":
        return (
          <div>
            <Label htmlFor="filePath">Database File Path</Label>
            <Input
              id="filePath"
              placeholder="/path/to/database.db"
              value={credentials.filePath || ""}
              onChange={(e) => setCredentials({ ...credentials, filePath: e.target.value })}
            />
          </div>
        )

      case "neondb":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="connectionString">Connection String</Label>
              <Input
                id="connectionString"
                placeholder="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
                value={credentials.connectionString || ""}
                onChange={(e) => setCredentials({ ...credentials, connectionString: e.target.value })}
              />
            </div>
          </div>
        )

      case "firebase":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                placeholder="my-firebase-project"
                value={credentials.projectId || ""}
                onChange={(e) => setCredentials({ ...credentials, projectId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="serviceAccount">Service Account Key (JSON)</Label>
              <Textarea
                id="serviceAccount"
                placeholder="Paste your service account JSON here..."
                value={credentials.serviceAccountKey || ""}
                onChange={(e) => setCredentials({ ...credentials, serviceAccountKey: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label htmlFor="connectionString">Connection String</Label>
            <Input
              id="connectionString"
              placeholder="Enter your connection string"
              value={credentials.connectionString || ""}
              onChange={(e) => setCredentials({ ...credentials, connectionString: e.target.value })}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{step === "type" ? "Select Database Type" : "Configure Connection"}</DialogTitle>
        </DialogHeader>

        {step === "type" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATABASE_TYPES.map((dbType) => (
              <Card
                key={dbType.value}
                className="cursor-pointer hover:shadow-md transition-all hover:ring-2 hover:ring-primary/20"
                onClick={() => handleTypeSelect(dbType.value)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{dbType.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{dbType.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Connection Name</Label>
              <Input id="name" placeholder="My Database" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {renderCredentialFields()}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep("type")} disabled={isConnecting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!name || isConnecting} className="flex-1">
                {isConnecting ? "Testing Connection..." : "Connect Database"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
