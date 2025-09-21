"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, XCircle, Clock } from "lucide-react"

interface ProjectStatusHandlerProps {
  projectId: string
  initialStatus: string
}

export function ProjectStatusHandler({ projectId, initialStatus }: ProjectStatusHandlerProps) {
  const [status, setStatus] = useState(initialStatus)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] Setting up real-time status updates for project:", projectId)

    let progressInterval: NodeJS.Timeout | null = null
    let pollInterval: NodeJS.Timeout | null = null

    // Set up real-time subscription for project status changes
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log("[v0] Project status updated:", payload.new.status)
          const newStatus = payload.new.status
          setStatus(newStatus)

          if (newStatus === "completed") {
            // Clear any existing intervals
            if (progressInterval) {
              clearInterval(progressInterval)
              progressInterval = null
            }
            if (pollInterval) {
              clearInterval(pollInterval)
              pollInterval = null
            }

            // Smoothly animate to 100%
            setProgress(100)

            // Wait a bit then refresh the page to show results
            setTimeout(() => {
              console.log("[v0] Analysis completed, redirecting to results...")
              window.location.reload()
            }, 1500)
          } else if (newStatus === "failed") {
            // Clear intervals on failure
            if (progressInterval) {
              clearInterval(progressInterval)
              progressInterval = null
            }
            if (pollInterval) {
              clearInterval(pollInterval)
              pollInterval = null
            }
            setProgress(0)
          }
        },
      )
      .subscribe()

    // Also poll for status changes as a fallback
    if (status === "analyzing" || status === "pending") {
      pollInterval = setInterval(async () => {
        try {
          const { data: project } = await supabase
            .from("projects")
            .select("status")
            .eq("id", projectId)
            .single()

          if (project && project.status !== status) {
            console.log("[v0] Polling detected status change:", project.status)
            setStatus(project.status)

            if (project.status === "completed") {
              if (progressInterval) {
                clearInterval(progressInterval)
                progressInterval = null
              }
              if (pollInterval) {
                clearInterval(pollInterval)
                pollInterval = null
              }
              setProgress(100)
              setTimeout(() => {
                console.log("[v0] Analysis completed via polling, redirecting...")
                window.location.reload()
              }, 1500)
            }
          }
        } catch (error) {
          console.error("[v0] Error polling project status:", error)
        }
      }, 5000) // Poll every 5 seconds
    }

    if (status === "analyzing") {
      setProgress(15)
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Don't let progress reach 100% until we get the completed status
          if (prev >= 95) return 95
          // More realistic progress increase
          const increment = prev < 30 ? Math.random() * 5 + 3 :
                           prev < 60 ? Math.random() * 3 + 2 :
                           prev < 85 ? Math.random() * 2 + 1 :
                           Math.random() * 0.5 + 0.5
          return Math.min(prev + increment, 95)
        })
      }, 3000)
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      supabase.removeChannel(channel)
    }
  }, [projectId, status, router, supabase])

  // Don't show anything if analysis is completed
  if (status === "completed") {
    return null
  }

  const getStatusDisplay = () => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          title: "Analysis Queued",
          description: "Your website analysis is queued and will start shortly.",
          color: "text-blue-600",
          showProgress: false,
        }
      case "analyzing":
        return {
          icon: Loader2,
          title: "Analyzing Website",
          description: "Our AI is crawling your website and running comprehensive tests.",
          color: "text-blue-600",
          showProgress: true,
        }
      case "failed":
        return {
          icon: XCircle,
          title: "Analysis Failed",
          description: "There was an error analyzing your website. Please try again.",
          color: "text-red-600",
          showProgress: false,
        }
      default:
        return null
    }
  }

  const statusDisplay = getStatusDisplay()
  if (!statusDisplay) return null

  const Icon = statusDisplay.icon

  return (
    <div className="container mx-auto px-4 py-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Icon className={`w-6 h-6 ${statusDisplay.color} ${status === "analyzing" ? "animate-spin" : ""}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{statusDisplay.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{statusDisplay.description}</p>

              {statusDisplay.showProgress && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-slate-500">This may take a few minutes depending on your website size.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
