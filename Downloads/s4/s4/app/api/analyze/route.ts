import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeWebsite } from "@/lib/ai/website-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    let supabase
    try {
      supabase = await createClient()
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      console.error("[v0] Project not found:", projectError)
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    console.log("[v0] Starting analysis for project:", project.name, project.url)

    // Update project status to analyzing and start analysis immediately
    await supabase
      .from("projects")
      .update({ status: "analyzing", updated_at: new Date().toISOString() })
      .eq("id", projectId)

    console.log("[v0] Starting analysis immediately...")

    try {
      await analyzeWebsite(project)

      // Update project status to completed
      await supabase
        .from("projects")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", projectId)

      console.log("[v0] Analysis completed for project:", projectId)
    } catch (analysisError) {
      console.error("[v0] Analysis failed:", analysisError)

      // Update project status to failed
      await supabase
        .from("projects")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", projectId)

      return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Analysis completed" })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
