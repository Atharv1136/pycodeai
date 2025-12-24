"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Folder, Code, Bot } from 'lucide-react'
import { ProjectList } from '@/components/dashboard/ProjectList'
import { CreditDisplay } from '@/components/dashboard/CreditDisplay'
import { useEditorStore } from '@/lib/store'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { projects, createProject, loadUserProjects, getUserStats, dailyCodeRuns, dailyAiQueries, currentUser } = useEditorStore()

  // Check profile completion on mount
  // Check profile completion on mount
  // useEffect(() => {
  //   if (currentUser && currentUser.id && currentUser.id !== 'demo_1') {
  //     // Check if profile_complete is false and redirect
  //     if (currentUser.profileComplete === false) {
  //       router.push('/dashboard/profile')
  //     }
  //   }
  // }, [currentUser, router])

  const handleCreateProject = async () => {
    const projectName = `Project ${projects.length + 1}`
    await createProject(projectName, 'A new Python project')
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Only load if user is logged in (not demo user)
        if (currentUser && currentUser.id && currentUser.id !== 'demo_1') {
          console.log('[Dashboard] Loading data for user:', currentUser.id);
          await getUserStats();
          await loadUserProjects(); // Load projects from database
          console.log('[Dashboard] Data loaded. Projects count:', projects.length);
        } else {
          console.log('[Dashboard] User not logged in or is demo user');
        }
      } catch (error) {
        console.error('[Dashboard] Error loading dashboard data:', error)
      }
    }

    loadData()
  }, [currentUser?.id, loadUserProjects, getUserStats]) // Reload when user changes

  const dashboardStats = [
    { title: 'Total Projects', value: projects.length.toString(), icon: Folder },
    { title: 'Code Runs Today', value: dailyCodeRuns.toString(), icon: Code },
    { title: 'AI Queries Used', value: dailyAiQueries.toString(), icon: Bot },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dev!</h1>
            <p className="text-muted-foreground">Here's a summary of your activity.</p>
          </div>
          <Button size="lg" onClick={handleCreateProject}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Project
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {dashboardStats.map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
          <CreditDisplay />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Projects</h2>
          <ProjectList />
        </div>
      </div>
    </AppLayout>
  )
}
