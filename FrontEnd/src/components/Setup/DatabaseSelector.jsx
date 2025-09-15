import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cloud, 
  Zap, 
  Globe,
  Layers,
  Archive,
  Grid3X3,
  FileText
} from 'lucide-react';
import { DATABASE_TYPES } from '../../types/index.js';

const DATABASE_OPTIONS = [
  {
    type: DATABASE_TYPES.POSTGRESQL,
    name: 'PostgreSQL',
    description: 'Advanced open-source relational database',
    icon: Database,
    category: 'SQL',
    popular: true
  },
  {
    type: DATABASE_TYPES.MYSQL,
    name: 'MySQL',
    description: 'World\'s most popular open source database',
    icon: Database,
    category: 'SQL',
    popular: true
  },
  {
    type: DATABASE_TYPES.SQLITE,
    name: 'SQLite',
    description: 'Lightweight, file-based SQL database',
    icon: HardDrive,
    category: 'SQL',
    popular: false
  },
  {
    type: DATABASE_TYPES.MONGODB,
    name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    icon: Layers,
    category: 'NoSQL',
    popular: true
  },
  {
    type: DATABASE_TYPES.SUPABASE,
    name: 'Supabase',
    description: 'Open source Firebase alternative',
    icon: Zap,
    category: 'Cloud',
    popular: true
  },
  {
    type: DATABASE_TYPES.NEONDB,
    name: 'NeonDB',
    description: 'Serverless PostgreSQL platform',
    icon: Cloud,
    category: 'Cloud',
    popular: false
  },
  {
    type: DATABASE_TYPES.PLANETSCALE,
    name: 'PlanetScale',
    description: 'MySQL-compatible serverless database',
    icon: Globe,
    category: 'Cloud',
    popular: false
  },
  {
    type: DATABASE_TYPES.FIREBASE,
    name: 'Firebase Firestore',
    description: 'Google\'s NoSQL document database',
    icon: Server,
    category: 'Cloud',
    popular: true
  },
  {
    type: DATABASE_TYPES.REDIS,
    name: 'Redis',
    description: 'In-memory data structure store',
    icon: Archive,
    category: 'Cache',
    popular: false
  },
  {
    type: DATABASE_TYPES.CASSANDRA,
    name: 'Cassandra',
    description: 'Distributed wide-column store',
    icon: Grid3X3,
    category: 'NoSQL',
    popular: false
  },
  {
    type: DATABASE_TYPES.OTHER_SQL,
    name: 'Other SQL',
    description: 'Other SQL databases',
    icon: FileText,
    category: 'SQL',
    popular: false
  },
  {
    type: DATABASE_TYPES.OTHER_NOSQL,
    name: 'Other NoSQL',
    description: 'Other NoSQL databases',
    icon: FileText,
    category: 'NoSQL',
    popular: false
  }
];

const CATEGORIES = ['All', 'SQL', 'NoSQL', 'Cloud', 'Cache'];

export const DatabaseSelector = ({ selectedType, onSelect, className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredOptions = DATABASE_OPTIONS.filter(option => 
    selectedCategory === 'All' || option.category === selectedCategory
  );

  const popularOptions = filteredOptions.filter(option => option.popular);
  const otherOptions = filteredOptions.filter(option => !option.popular);

  const DatabaseCard = ({ option }) => {
    const Icon = option.icon;
    const isSelected = selectedType === option.type;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
          isSelected 
            ? 'ring-2 ring-primary bg-primary/5 border-primary' 
            : 'hover:border-primary/50'
        } ${className}`}
        onClick={() => onSelect(option.type)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{option.name}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {option.category}
                </Badge>
              </div>
            </div>
            {option.popular && (
              <Badge variant="default" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm">
            {option.description}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="transition-all duration-200"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Popular Databases */}
      {popularOptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Popular Databases</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularOptions.map(option => (
              <DatabaseCard key={option.type} option={option} />
            ))}
          </div>
        </div>
      )}

      {/* Other Databases */}
      {otherOptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            {popularOptions.length > 0 ? 'Other Options' : 'Available Databases'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherOptions.map(option => (
              <DatabaseCard key={option.type} option={option} />
            ))}
          </div>
        </div>
      )}

      {filteredOptions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No databases found for the selected category.</p>
        </div>
      )}
    </div>
  );
};
