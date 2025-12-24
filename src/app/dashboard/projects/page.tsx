"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Folder,
  Calendar,
  Eye,
  Share2,
  Star,
  Code,
  Clock
} from 'lucide-react'

export default function ProjectsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  // Mock projects data
  const projects = [
    {
      id: 1,
      name: 'Snake Game',
      description: 'A classic snake game built with pygame',
      language: 'Python',
      lastModified: '2024-01-15',
      isPublic: true,
      isStarred: true,
      files: 3,
      runs: 45
    },
    {
      id: 2,
      name: 'Data Analysis Dashboard',
      description: 'Interactive dashboard for sales data visualization',
      language: 'Python',
      lastModified: '2024-01-14',
      isPublic: false,
      isStarred: false,
      files: 8,
      runs: 120
    },
    {
      id: 3,
      name: 'Web Scraper',
      description: 'Scrapes product information from e-commerce sites',
      language: 'Python',
      lastModified: '2024-01-12',
      isPublic: true,
      isStarred: false,
      files: 2,
      runs: 67
    },
    {
      id: 4,
      name: 'Machine Learning Model',
      description: 'Predictive model for customer churn analysis',
      language: 'Python',
      lastModified: '2024-01-10',
      isPublic: false,
      isStarred: true,
      files: 12,
      runs: 89
    },
    {
      id: 5,
      name: 'API Server',
      description: 'RESTful API built with FastAPI',
      language: 'Python',
      lastModified: '2024-01-08',
      isPublic: true,
      isStarred: false,
      files: 5,
      runs: 34
    }
  ]

  const handleCreateProject = () => {
    toast({
      title: "New Project",
      description: "Creating a new project...",
    })
  }

  const handleStarProject = (projectId: number) => {
    toast({
      title: "Project Starred",
      description: "Project added to your favorites",
    })
  }

  const handleShareProject = (projectId: number) => {
    toast({
      title: "Share Project",
      description: "Share link copied to clipboard",
    })
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'public') return matchesSearch && project.isPublic
    if (filter === 'private') return matchesSearch && !project.isPublic
    if (filter === 'starred') return matchesSearch && project.isStarred
    
    return matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your Python projects
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('public')}
              >
                Public
              </Button>
              <Button
                variant={filter === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('private')}
              >
                Private
              </Button>
              <Button
                variant={filter === 'starred' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('starred')}
              >
                Starred
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleStarProject(project.id)}
                  >
                    <Star className={`h-4 w-4 ${project.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-sm">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  <span>{project.language}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{project.lastModified}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{project.files} files</span>
                  <span className="text-muted-foreground">{project.runs} runs</span>
                </div>
                <div className="flex items-center gap-2">
                  {project.isPublic ? (
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareProject(project.id)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
            </p>
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Projects</span>
            </div>
            <div className="text-2xl font-bold mt-2">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Public Projects</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {projects.filter(p => p.isPublic).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Starred</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {projects.filter(p => p.isStarred).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Runs</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {projects.reduce((sum, p) => sum + p.runs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
