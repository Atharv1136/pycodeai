"use client";

import { useEffect, use } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { EditorLayout } from '@/components/editor/EditorLayout'
import { useEditorStore } from '@/lib/store'

export default function EditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { loadProject, loadUserProjects, currentUser } = useEditorStore()
  const resolvedParams = use(params)

  useEffect(() => {
    // Load projects from database if user is logged in
    if (currentUser && currentUser.id && currentUser.id !== 'demo_1') {
      loadUserProjects().then(async () => {
        // After loading from database, load the specific project (with uploaded files)
        await loadProject(resolvedParams.projectId)
      })
    } else {
      // Fallback to localStorage for demo/offline mode
      const savedProjects = localStorage.getItem('pycode-projects')
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects)
          const projectsWithDates = parsedProjects.map((project: any) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt)
          }))
          useEditorStore.setState({ projects: projectsWithDates })
        } catch (error) {
          console.error('Error loading projects:', error)
        }
      }
      
      // Load the specific project
      loadProject(resolvedParams.projectId)
    }
  }, [resolvedParams.projectId, loadProject, loadUserProjects, currentUser?.id]) // Reload when user ID changes

  return (
    <AppLayout>
      <EditorLayout />
    </AppLayout>
  )
}
