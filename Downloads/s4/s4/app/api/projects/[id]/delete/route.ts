import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      },
    )

    const projectId = params.id

    console.log("[v0] Attempting to delete project:", projectId)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check - User:", user?.id, "Error:", authError)

    if (authError || !user) {
      console.log("[v0] Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("id, user_id, name")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    console.log("[v0] Project check - Found:", existingProject, "Error:", fetchError)

    if (fetchError || !existingProject) {
      console.log("[v0] Project not found or unauthorized:", fetchError)
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 })
    }

    console.log("[v0] Deleting related data...")

    // Use regular supabase client for deletion since RLS policies should handle access control
    const deleteSupabase = supabase

    // Delete test results
    const { error: testResultsError } = await deleteSupabase.from("test_results").delete().eq("project_id", projectId)

    if (testResultsError) {
      console.log("[v0] Error deleting test results:", testResultsError)
    }

    // Delete crawl data
    const { error: crawlDataError } = await deleteSupabase.from("crawl_data").delete().eq("project_id", projectId)

    if (crawlDataError) {
      console.log("[v0] Error deleting crawl data:", crawlDataError)
    }

    // Delete market analysis
    const { error: marketAnalysisError } = await deleteSupabase
      .from("market_analysis")
      .delete()
      .eq("project_id", projectId)

    if (marketAnalysisError) {
      console.log("[v0] Error deleting market analysis:", marketAnalysisError)
    }

    // Delete QA sessions
    const { error: qaSessionsError } = await deleteSupabase
      .from("qa_sessions")
      .delete()
      .eq("project_id", projectId)

    if (qaSessionsError) {
      console.log("[v0] Error deleting QA sessions:", qaSessionsError)
    }

    // Delete the project itself (this should cascade delete related data due to foreign key constraints)
    const { error: deleteError } = await deleteSupabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", user.id)

    console.log("[v0] Project deletion result - Error:", deleteError)

    if (deleteError) {
      console.error("[v0] Error deleting project:", deleteError)
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
    }

    console.log("[v0] Project deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in delete project API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
