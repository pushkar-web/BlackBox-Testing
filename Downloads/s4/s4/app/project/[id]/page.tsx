import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProjectHeader } from "@/components/project/project-header"
import { OverviewSection } from "@/components/project/overview-section"
import { TestResultsSection } from "@/components/project/test-results-section"
import { MarketInsightsSection } from "@/components/project/market-insights-section"
import { QASection } from "@/components/project/qa-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectStatusHandler } from "@/components/project/project-status-handler"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch project data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", data.user.id)
    .single()

  if (projectError || !project) {
    redirect("/dashboard")
  }

  // Fetch all related data
  const [testResults, marketAnalysis, crawlData, qaHistory] = await Promise.all([
    supabase.from("test_results").select("*").eq("project_id", id),
    supabase.from("market_analysis").select("*").eq("project_id", id),
    supabase.from("crawl_data").select("*").eq("project_id", id),
    supabase.from("qa_sessions").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ProjectHeader project={project} />

      <ProjectStatusHandler projectId={project.id} initialStatus={project.status} />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="testing">Test Results</TabsTrigger>
            <TabsTrigger value="market">Market Insights</TabsTrigger>
            <TabsTrigger value="qa">Q&A Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewSection
              project={project}
              testResults={testResults.data || []}
              marketAnalysis={marketAnalysis.data || []}
              crawlData={crawlData.data || []}
            />
          </TabsContent>

          <TabsContent value="testing">
            <TestResultsSection testResults={testResults.data || []} crawlData={crawlData.data || []} />
          </TabsContent>

          <TabsContent value="market">
            <MarketInsightsSection marketAnalysis={marketAnalysis.data || []} project={project} />
          </TabsContent>

          <TabsContent value="qa">
            <QASection
              projectId={project.id}
              qaHistory={qaHistory.data || []}
              project={project}
              testResults={testResults.data || []}
              crawlData={crawlData.data || []}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
