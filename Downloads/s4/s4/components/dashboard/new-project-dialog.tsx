"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function NewProjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  })
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const isLocalhostUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()

      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.") ||
        hostname.endsWith(".local")
      )
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate URL format
      try {
        new URL(formData.url)
      } catch {
        throw new Error("Please enter a valid URL")
      }

      if (isLocalhostUrl(formData.url)) {
        throw new Error(
          "Localhost URLs cannot be tested from our servers. Please deploy your website to a public URL (like Vercel, Netlify, or GitHub Pages) for testing, or use a tool like ngrok to create a public tunnel to your localhost.",
        )
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: formData.name,
          url: formData.url,
          description: formData.description || null,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      console.log("[v0] Triggering analysis for new project:", data.id)

      // Start analysis in the background
      fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: data.id }),
      }).catch((err) => {
        console.error("[v0] Failed to trigger analysis:", err)
      })

      // Reset form and close dialog
      setFormData({ name: "", url: "", description: "" })
      setOpen(false)

      // Refresh the page to show new project
      router.refresh()

      // Redirect to the project page
      router.push(`/project/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a website to analyze with our AI-powered testing platform.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Website Analysis"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
            <p className="text-xs text-slate-500">
              Public URLs only. For localhost testing, deploy to Vercel, Netlify, or use ngrok.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your website or testing goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
