import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateAnswer } from "@/lib/ai/qa-engine"

export async function POST(request: NextRequest) {
  try {
    const { projectId, question } = await request.json()

    if (!projectId || !question) {
      return NextResponse.json({ error: "Project ID and question are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user has access to this project
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get project context (crawl data, test results, market analysis)
    const [crawlData, testResults, marketAnalysis] = await Promise.all([
      supabase.from("crawl_data").select("*").eq("project_id", projectId),
      supabase.from("test_results").select("*").eq("project_id", projectId),
      supabase.from("market_analysis").select("*").eq("project_id", projectId),
    ])

    const context = {
      project,
      crawlData: crawlData.data || [],
      testResults: testResults.data || [],
      marketAnalysis: marketAnalysis.data || [],
    }

    // Generate AI answer
    const answer = await generateAnswer(question, context)

    // Store Q&A session
    await supabase.from("qa_sessions").insert({
      project_id: projectId,
      question,
      answer,
      context: { question_type: "general" },
      user_id: user.id,
    })

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("QA API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
