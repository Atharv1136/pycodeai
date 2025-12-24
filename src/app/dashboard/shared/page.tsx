"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  MoreHorizontal,
  Folder,
  Calendar,
  Eye,
  Share2,
  Star,
  Code,
  Clock,
  Users,
  Download
} from 'lucide-react'

export default function SharedPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock shared projects data
  const sharedProjects = [
    {
      id: 1,
      name: 'Team Dashboard',
      description: 'Collaborative dashboard for project management',
      language: 'Python',
      lastModified: '2024-01-15',
      sharedBy: {
        name: 'Sarah Johnson',
        avatar: '',
        email: 'sarah@example.com'
      },
      permissions: 'edit',
      files: 12,
      runs: 156,
      isStarred: true
    },
    {
      id: 2,
      name: 'Data Pipeline',
      description: 'ETL pipeline for processing customer data',
      language: 'Python',
      lastModified: '2024-01-14',
      sharedBy: {
        name: 'Mike Chen',
        avatar: '',
        email: 'mike@example.com'
      },
      permissions: 'view',
      files: 8,
      runs: 89,
      isStarred: false
    },
    {
      id: 3,
      name: 'ML Model Training',
      description: 'Machine learning model for recommendation system',
      language: 'Python',
      lastModified: '2024-01-12',
      sharedBy: {
        name: 'Alex Rodriguez',
        avatar: '',
        email: 'alex@example.com'
      },
      permissions: 'edit',
      files: 15,
      runs: 234,
      isStarred: false
    },
    {
      id: 4,
      name: 'API Documentation',
      description: 'Interactive API documentation generator',
      language: 'Python',
      lastModified: '2024-01-10',
      sharedBy: {
        name: 'Emma Wilson',
        avatar: '',
        email: 'emma@example.com'
      },
      permissions: 'view',
      files: 6,
      runs: 45,
      isStarred: true
    }
  ]

  const handleStarProject = (projectId: number) => {
    toast({
      title: "Project Starred",
      description: "Project added to your favorites",
    })
  }

  const handleDownloadProject = (projectId: number) => {
    toast({
      title: "Download Started",
      description: "Project files are being prepared for download",
    })
  }

  const filteredProjects = sharedProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.sharedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'edit':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'view':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared with me</h1>
          <p className="text-muted-foreground">
            Projects shared by your team members and collaborators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {sharedProjects.length} shared projects
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shared projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Shared Projects Grid */}
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
              {/* Shared by */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.sharedBy.avatar} alt={project.sharedBy.name} />
                  <AvatarFallback className="text-xs">
                    {project.sharedBy.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Shared by {project.sharedBy.name}
                </span>
              </div>

              {/* Project details */}
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
                <Badge className={`text-xs ${getPermissionColor(project.permissions)}`}>
                  {project.permissions === 'edit' ? 'Can Edit' : 'View Only'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadProject(project.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No shared projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'No one has shared any projects with you yet'}
            </p>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Request Access
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Shared</span>
            </div>
            <div className="text-2xl font-bold mt-2">{sharedProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Collaborators</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {new Set(sharedProjects.map(p => p.sharedBy.email)).size}
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
              {sharedProjects.filter(p => p.isStarred).length}
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
              {sharedProjects.reduce((sum, p) => sum + p.runs, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
