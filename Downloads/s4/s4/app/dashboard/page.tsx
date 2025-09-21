"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProjectsList } from "@/components/dashboard/projects-list"
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog"
import type { User } from "@supabase/supabase-js"

interface Project {
  id: string
  name: string
  url: string
  description?: string
  status: "pending" | "analyzing" | "completed" | "failed"
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)

      // Fetch user's projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      setProjects(projectsData || [])
      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Projects</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Manage and analyze your websites with AI-powered testing
            </p>
          </div>
          <NewProjectDialog />
        </div>

        <ProjectsList projects={projects} onProjectDeleted={handleProjectDeleted} />
      </main>
    </div>
  )
}
