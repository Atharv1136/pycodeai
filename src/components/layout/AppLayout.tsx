"use client"
import * as React from 'react'
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Header } from '@/components/layout/Header'

export function AppLayout({ children }: { children: React.ReactNode }) {
  // We can grab the cookie to set the initial state of the sidebar.
  // We're doing it on the client to avoid hydration errors.
  const [defaultOpen, setDefaultOpen] = React.useState(true)

  React.useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith('sidebar_state='))
      ?.split('=')[1]

    if (cookieValue) {
      setDefaultOpen(cookieValue === 'true')
    }
  }, [])

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset className="dark:bg-zinc-900/50 bg-zinc-100/50 min-h-screen">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  )
}
