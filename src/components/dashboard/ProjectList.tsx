"use client"

import { useEffect } from 'react'
import { ProjectCard, type Project } from './ProjectCard'
import { useEditorStore } from '@/lib/store'

export function ProjectList() {
  const { projects } = useEditorStore()

  // Projects are now loaded from database via the store
  // No need to load from localStorage anymore

  // Convert store projects to ProjectCard format
  const displayProjects: Project[] = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description || 'No description provided',
    language: 'Python',
    lastModified: getTimeAgo(project.updatedAt),
    isFavorite: false, // We can add this feature later
  }))

  if (displayProjects.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold">No projects yet</h3>
        <p className="text-muted-foreground mt-2">Create your first project to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}
