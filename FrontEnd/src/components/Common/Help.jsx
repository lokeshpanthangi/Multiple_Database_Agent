import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Zap, 
  Database, 
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Lightbulb,
  Code,
  Settings,
  Shield,
  Rocket
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.jsx';

const QuickStartCard = ({ icon: Icon, title, description, steps, badge }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <ol className="space-y-2 text-sm">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);

const FAQItem = ({ question, answer, isOpen, onToggle }) => (
  <Collapsible open={isOpen} onOpenChange={onToggle}>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" className="w-full justify-between p-4 h-auto text-left">
        <span className="font-medium">{question}</span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="px-4 pb-4">
      <div className="text-sm text-muted-foreground leading-relaxed">
        {answer}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

const ExampleQuery = ({ title, description, query, database }) => (
  <Card className="hover:shadow-sm transition-shadow">
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{title}</h4>
          <Badge variant="outline" className="text-xs">
            {database}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="bg-muted p-3 rounded-md">
          <code className="text-xs">{query}</code>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <Code className="h-3 w-3 mr-2" />
          Try This Query
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const Help = ({ className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);

  const quickStartGuides = [
    {
      icon: Database,
      title: "Connect Your First Database",
      description: "Get started by connecting to your database",
      badge: "Essential",
      steps: [
        "Click the 'Add Database' button in the sidebar",
        "Select your database type (PostgreSQL, MySQL, etc.)",
        "Enter your connection credentials",
        "Test the connection and save"
      ]
    },
    {
      icon: MessageSquare,
      title: "Ask Your First Question",
      description: "Learn how to query your data with natural language",
      badge: "Beginner",
      steps: [
        "Select your connected database",
        "Type a question in plain English",
        "Review the generated SQL query",
        "Examine the results in table or chart view"
      ]
    },
    {
      icon: Zap,
      title: "Advanced Query Techniques",
      description: "Master complex queries and data analysis",
      badge: "Advanced",
      steps: [
        "Use specific column names for precise results",
        "Ask for aggregations like 'average', 'sum', 'count'",
        "Request data filtering with date ranges",
        "Combine multiple conditions in your questions"
      ]
    }
  ];

  const faqData = [
    {
      question: "How does the AI understand my questions?",
      answer: "Our AI uses advanced natural language processing to understand your questions and convert them into SQL queries. It analyzes your database schema and generates appropriate queries based on your intent."
    },
    {
      question: "Is my database data secure?",
      answer: "Yes, your data security is our top priority. All connections use encrypted protocols, credentials are stored securely in your browser, and we never store or access your actual data. The AI only sees the database schema to generate queries."
    },
    {
      question: "What database types are supported?",
      answer: "We support a wide range of databases including PostgreSQL, MySQL, SQLite, MongoDB, Supabase, NeonDB, PlanetScale, Firebase Firestore, Redis, and Cassandra. More database types are added regularly."
    },
    {
      question: "Can I edit the generated SQL queries?",
      answer: "Absolutely! You can view, copy, and modify any generated SQL query. This is great for learning SQL or fine-tuning queries for your specific needs."
    },
    {
      question: "How do I export my query results?",
      answer: "Query results can be exported in multiple formats including CSV, JSON, and Excel. Look for the export buttons in the results section after running a query."
    },
    {
      question: "What if the AI generates an incorrect query?",
      answer: "If a query doesn't produce the expected results, try rephrasing your question with more specific details. You can also provide feedback to help improve the AI's understanding."
    }
  ];

  const exampleQueries = [
    {
      title: "Find Recent Users",
      description: "Get all users who signed up in the last 30 days",
      query: "Show me all users created in the last 30 days",
      database: "PostgreSQL"
    },
    {
      title: "Sales Analysis",
      description: "Calculate total sales by product category",
      query: "What are the total sales for each product category?",
      database: "MySQL"
    },
    {
      title: "Customer Insights",
      description: "Find customers with the highest order values",
      query: "Who are the top 10 customers by total order value?",
      database: "PostgreSQL"
    },
    {
      title: "Inventory Check",
      description: "List products that are running low on stock",
      query: "Show me products with less than 10 items in stock",
      database: "MySQL"
    }
  ];

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Help & Documentation</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search help topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="quickstart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="space-y-6">
          <div className="grid gap-6">
            {quickStartGuides.map((guide, index) => (
              <QuickStartCard key={index} {...guide} />
            ))}
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Start with simple questions like "Show me all users" or "What are my top products?" 
              to get familiar with how the AI interprets your requests.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sample Queries</h3>
              <p className="text-muted-foreground text-sm">
                Try these example queries to see how natural language translates to SQL
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {exampleQueries.map((example, index) => (
                <ExampleQuery key={index} {...example} />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Query Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium">Be specific:</span>
                  <span className="text-muted-foreground">Use exact column names when possible</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Use time ranges:</span>
                  <span className="text-muted-foreground">"last 30 days", "this month", "2023"</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Ask for aggregations:</span>
                  <span className="text-muted-foreground">"total", "average", "count", "maximum"</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Request sorting:</span>
                  <span className="text-muted-foreground">"top 10", "highest", "most recent"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using the SQL Database Agent
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredFAQ.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No FAQ items match your search
                </div>
              ) : (
                <div className="divide-y">
                  {filteredFAQ.map((item, index) => (
                    <FAQItem
                      key={index}
                      question={item.question}
                      answer={item.answer}
                      isOpen={openFAQ === index}
                      onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Book className="h-4 w-4" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Database Connection Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Query Writing Best Practices
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  API Reference
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Database Setup Examples
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Security Best Practices
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Troubleshooting Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Data Privacy Policy
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Security Measures
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Compliance Information
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Rocket className="h-4 w-4" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Custom Query Templates
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Data Visualization
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Export & Integration
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              Need more help? Contact our support team or check out our community forum for additional assistance.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};
