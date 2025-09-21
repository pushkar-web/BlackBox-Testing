"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Calendar, MoreVertical, Play, Eye, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  name: string
  url: string
  description?: string
  status: "pending" | "analyzing" | "completed" | "failed"
  created_at: string
}

interface ProjectsListProps {
  projects: Project[]
  onProjectDeleted?: (projectId: string) => void
}

export function ProjectsList({ projects, onProjectDeleted }: ProjectsListProps) {
  const [deletingProject, setDeletingProject] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    setDeletingProject(projectId)

    try {
      const response = await fetch(`/api/projects/${projectId}/delete`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      toast({
        title: "Project deleted",
        description: `"${projectName}" has been successfully deleted.`,
      })

      if (onProjectDeleted) {
        onProjectDeleted(projectId)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingProject(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "analyzing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Create your first project to start analyzing websites with AI
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-sm">
                  <Globe className="w-3 h-3" />
                  {project.url}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Play className="w-4 h-4 mr-2" />
                    Re-analyze
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This action cannot be undone and will
                          permanently remove all project data including test results and analysis.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          disabled={deletingProject === project.id}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          {deletingProject === project.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
              )}

              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(project.created_at)}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/project/${project.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                </Link>
                {project.status === "completed" && (
                  <Button size="sm" variant="secondary">
                    <Play className="w-4 h-4 mr-2" />
                    Re-test
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
