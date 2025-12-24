"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Plus,
  FileText,
  Calendar,
  Star,
  Download,
  Code,
  Database,
  Globe,
  Zap
} from 'lucide-react'

export default function TemplatesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')

  // Dynamic templates - will be loaded from database or AI-generated
  const templates = []

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Automation', label: 'Automation' }
  ]

  const handleUseTemplate = (templateId: number) => {
    toast({
      title: "Template Applied",
      description: "Template has been added to your projects",
    })
  }

  const handleDownloadTemplate = (templateId: number) => {
    toast({
      title: "Download Started",
      description: "Template files are being prepared for download",
    })
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = category === 'all' || template.category === category
    
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Start your projects with pre-built templates and examples
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {template.isOfficial && (
                        <Badge variant="secondary" className="text-xs">
                          Official
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  <span>{template.language}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{template.category}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{template.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-muted-foreground">{template.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate(template.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">AI-Powered Templates</h3>
          <p className="text-muted-foreground text-center mb-4">
            Ask the AI to create any template you need! Just describe what you want and the AI will generate the code for you.
          </p>
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>Try asking: "Create a data analysis template" or "Make a web scraper template"</p>
            <p>Or go to the editor and ask the AI to generate any project structure you need!</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Templates</span>
            </div>
            <div className="text-2xl font-bold mt-2">∞</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Customizable</span>
            </div>
            <div className="text-2xl font-bold mt-2">100%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Instant Generation</span>
            </div>
            <div className="text-2xl font-bold mt-2">Yes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">All Languages</span>
            </div>
            <div className="text-2xl font-bold mt-2">∞</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
