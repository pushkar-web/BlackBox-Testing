"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Zap,
  Search,
  Eye,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"

interface OverviewSectionProps {
  project: any
  testResults: any[]
  marketAnalysis: any[]
  crawlData: any[]
}

export function OverviewSection({ project, testResults, marketAnalysis, crawlData }: OverviewSectionProps) {
  const isAnalyzing = project.status === "analyzing" || project.status === "pending"
  const hasResults = testResults.length > 0

  if (isAnalyzing && !hasResults) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analysis in Progress
            </CardTitle>
            <CardDescription>
              We're analyzing your website. Results will appear here as they become available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-slate-400">--</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Overall Score</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-slate-400">--</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Pages Analyzed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-slate-400">--</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate overall scores
  const getTestTypeScore = (testType: string) => {
    const results = testResults.filter((r) => r.test_type === testType)
    if (results.length === 0) return 0
    return Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
  }

  const overallScore =
    testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length) : 0

  const testCategories = [
    {
      name: "Security",
      type: "security",
      icon: Shield,
      score: getTestTypeScore("security"),
      color: "text-red-600",
    },
    {
      name: "Performance",
      type: "performance",
      icon: Zap,
      score: getTestTypeScore("performance"),
      color: "text-yellow-600",
    },
    {
      name: "SEO",
      type: "seo",
      icon: Search,
      score: getTestTypeScore("seo"),
      color: "text-green-600",
    },
    {
      name: "Accessibility",
      type: "accessibility",
      icon: Eye,
      score: getTestTypeScore("accessibility"),
      color: "text-blue-600",
    },
    {
      name: "UI/UX",
      type: "ui_ux",
      icon: Globe,
      score: getTestTypeScore("ui_ux"),
      color: "text-purple-600",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle
    if (score >= 60) return AlertTriangle
    return XCircle
  }

  const totalIssues = testResults.reduce((sum, r) => sum + r.issues.length, 0)
  const criticalIssues = testResults.reduce(
    (sum, r) => sum + r.issues.filter((issue: any) => issue.severity === "high").length,
    0,
  )

  const generateProjectDescription = () => {
    if (!hasResults) return "Analysis pending..."

    const domain = new URL(project.url).hostname
    const mainPage = crawlData.find((page) => page.page_url === project.url) || crawlData[0]

    const generateNaturalDescription = () => {
      // Extract key information from the website
      const title = mainPage?.title || project.name
      const metaDescription = mainPage?.meta_description || ""
      const contentPreview = mainPage?.content_text?.slice(0, 200) || ""

      // Determine website type and purpose
      let websiteType = "website"
      let purpose = ""

      if (title.toLowerCase().includes("blog") || contentPreview.toLowerCase().includes("blog")) {
        websiteType = "blog"
        purpose = "sharing insights and articles"
      } else if (
        title.toLowerCase().includes("shop") ||
        title.toLowerCase().includes("store") ||
        contentPreview.toLowerCase().includes("buy") ||
        contentPreview.toLowerCase().includes("product")
      ) {
        websiteType = "e-commerce platform"
        purpose = "selling products online"
      } else if (title.toLowerCase().includes("portfolio") || contentPreview.toLowerCase().includes("portfolio")) {
        websiteType = "portfolio website"
        purpose = "showcasing work and skills"
      } else if (
        title.toLowerCase().includes("company") ||
        title.toLowerCase().includes("business") ||
        contentPreview.toLowerCase().includes("services")
      ) {
        websiteType = "business website"
        purpose = "providing services and information"
      } else if (
        contentPreview.toLowerCase().includes("learn") ||
        contentPreview.toLowerCase().includes("course") ||
        contentPreview.toLowerCase().includes("education")
      ) {
        websiteType = "educational platform"
        purpose = "providing learning resources"
      } else if (contentPreview.toLowerCase().includes("news") || contentPreview.toLowerCase().includes("article")) {
        websiteType = "news website"
        purpose = "delivering news and information"
      }

      // Build natural description
      let description = `${title} is a ${websiteType}`

      if (purpose) {
        description += ` focused on ${purpose}`
      }

      if (metaDescription && metaDescription.length > 20) {
        description += `. ${metaDescription}`
      }

      // Add analysis insights
      const scoreText =
        overallScore >= 80
          ? "excellent condition"
          : overallScore >= 60
            ? "good condition with room for improvement"
            : "needs significant improvements"

      description += ` Our comprehensive analysis of ${crawlData.length} page${crawlData.length !== 1 ? "s" : ""} reveals the site is in ${scoreText}, with an overall health score of ${overallScore} out of 100.`

      if (totalIssues === 0) {
        description += " The website performs well across all tested categories with no critical issues detected."
      } else if (criticalIssues > 0) {
        description += ` We identified ${totalIssues} issue${totalIssues !== 1 ? "s" : ""} that need attention, including ${criticalIssues} critical issue${criticalIssues !== 1 ? "s" : ""} that should be addressed immediately to improve user experience and performance.`
      } else {
        description += ` We found ${totalIssues} minor issue${totalIssues !== 1 ? "s" : ""} that, while not critical, could be improved to enhance the overall user experience.`
      }

      // Add category-specific insights
      const strongCategories = testCategories.filter((cat) => cat.score >= 80)
      const weakCategories = testCategories.filter((cat) => cat.score < 60)

      if (strongCategories.length > 0) {
        description += ` The website excels in ${strongCategories.map((cat) => cat.name.toLowerCase()).join(", ")}.`
      }

      if (weakCategories.length > 0) {
        description += ` Areas for improvement include ${weakCategories.map((cat) => cat.name.toLowerCase()).join(", ")}.`
      }

      return description
    }

    return generateNaturalDescription()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Project Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
                <ExternalLink className="w-4 h-4" />
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {project.url}
                </a>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{generateProjectDescription()}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Website Health Overview
          </CardTitle>
          <CardDescription>Comprehensive analysis of your website's performance across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>{overallScore}/100</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Overall Score</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">{crawlData.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Pages Analyzed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">{totalIssues}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Total Issues</p>
              {criticalIssues > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {criticalIssues} Critical
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testCategories.map((category) => {
          const Icon = category.icon
          const ScoreIcon = getScoreIcon(category.score)

          return (
            <Card key={category.type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <ScoreIcon className={`w-5 h-5 ${getScoreColor(category.score)}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Score</span>
                    <span className={`font-semibold ${getScoreColor(category.score)}`}>{category.score}/100</span>
                  </div>
                  <Progress value={category.score} className="h-2" />
                  <div className="text-xs text-slate-500">
                    {category.score >= 80 ? "Excellent" : category.score >= 60 ? "Good" : "Needs Improvement"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {marketAnalysis.length > 0 ? "✓" : "⏳"}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Market Analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {testResults.filter((r) => r.status === "passed").length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Tests Passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {testResults.filter((r) => r.status === "failed").length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Tests Failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {testResults.filter((r) => r.status === "warning").length}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Warnings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
