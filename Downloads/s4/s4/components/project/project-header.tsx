"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Calendar, ArrowLeft, ExternalLink, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    url: string
    description?: string
    status: string
    created_at: string
    updated_at: string
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }


  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/export`)
      
      if (response.ok) {
        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name}-report.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to export report')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <header className="border-b bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span className="text-sm">{project.url}</span>
                <Link href={project.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 ml-1 hover:text-blue-600" />
                </Link>
              </div>
            </div>

            {project.description && <p className="text-slate-600 dark:text-slate-300 mb-2">{project.description}</p>}

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Created: {formatDate(project.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Updated: {formatDate(project.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleExportReport}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
