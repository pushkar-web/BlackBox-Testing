"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Zap,
  Search,
  Eye,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface TestResultsSectionProps {
  testResults: any[]
  crawlData: any[]
}

export function TestResultsSection({ testResults, crawlData }: TestResultsSectionProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedResults(newExpanded)
  }

  const testCategories = [
    { name: "Security", type: "security", icon: Shield, color: "text-red-600" },
    { name: "Performance", type: "performance", icon: Zap, color: "text-yellow-600" },
    { name: "SEO", type: "seo", icon: Search, color: "text-green-600" },
    { name: "Accessibility", type: "accessibility", icon: Eye, color: "text-blue-600" },
    { name: "UI/UX", type: "ui_ux", icon: Globe, color: "text-purple-600" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "failed":
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "failed":
        return "text-red-600"
      default:
        return "text-slate-600"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  if (testResults.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Test Results Available</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Test results are still being processed. Please check back in a few minutes.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          {testCategories.map((category) => (
            <TabsTrigger key={category.type} value={category.type}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {testCategories.map((category) => {
              const categoryResults = testResults.filter((r) => r.test_type === category.type)
              if (categoryResults.length === 0) return null

              const Icon = category.icon
              const avgScore = Math.round(categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length)

              return (
                <Card key={category.type}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${category.color}`} />
                        <CardTitle>{category.name} Tests</CardTitle>
                        <Badge variant="outline">{avgScore}/100</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => toggleExpanded(category.type)}>
                        {expandedResults.has(category.type) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {expandedResults.has(category.type) && (
                    <CardContent>
                      <div className="space-y-4">
                        {categoryResults.map((result, index) => {
                          const StatusIcon = getStatusIcon(result.status)
                          return (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`w-4 h-4 ${getStatusColor(result.status)}`} />
                                  <span className="font-medium">{result.page_url}</span>
                                  <Badge variant="outline">{result.score}/100</Badge>
                                </div>
                              </div>

                              {result.issues.length > 0 && (
                                <div className="mb-3">
                                  <h4 className="font-medium mb-2">Issues Found:</h4>
                                  <div className="space-y-2">
                                    {result.issues.slice(0, 3).map((issue: any, issueIndex: number) => (
                                      <div key={issueIndex} className="flex items-start gap-2">
                                        <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                                          {issue.severity}
                                        </Badge>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                          {issue.message}
                                        </span>
                                      </div>
                                    ))}
                                    {result.issues.length > 3 && (
                                      <p className="text-sm text-slate-500">+{result.issues.length - 3} more issues</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {result.recommendations.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Recommendations:</h4>
                                  <div className="space-y-1">
                                    {result.recommendations.slice(0, 2).map((rec: any, recIndex: number) => (
                                      <div key={recIndex} className="text-sm text-slate-600 dark:text-slate-300">
                                        • {rec.message}
                                      </div>
                                    ))}
                                    {result.recommendations.length > 2 && (
                                      <p className="text-sm text-slate-500">
                                        +{result.recommendations.length - 2} more recommendations
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {testCategories.map((category) => (
          <TabsContent key={category.type} value={category.type}>
            <TestCategoryDetail
              category={category}
              results={testResults.filter((r) => r.test_type === category.type)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function TestCategoryDetail({ category, results }: { category: any; results: any[] }) {
  const Icon = category.icon

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Icon className={`w-12 h-12 ${category.color} mx-auto mb-4`} />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No {category.name} Results</h3>
          <p className="text-slate-600 dark:text-slate-300">{category.name} tests are still being processed.</p>
        </CardContent>
      </Card>
    )
  }

  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
  const allIssues = results.flatMap((r) => r.issues)
  const allRecommendations = results.flatMap((r) => r.recommendations)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${category.color}`} />
            <CardTitle>{category.name} Analysis</CardTitle>
            <Badge variant="outline" className="ml-auto">
              {avgScore}/100
            </Badge>
          </div>
          <CardDescription>Detailed {category.name.toLowerCase()} analysis across all pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{results.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Pages Tested</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{allIssues.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Issues Found</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{allRecommendations.length}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.page_url}</CardTitle>
                <Badge variant="outline">{result.score}/100</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.issues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Issues ({result.issues.length})</h4>
                    <div className="space-y-2">
                      {result.issues.map((issue: any, issueIndex: number) => (
                        <div key={issueIndex} className="p-3 border rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Badge className={getSeverityColor(issue.severity)} variant="secondary">
                              {issue.severity}
                            </Badge>
                            <span className="font-medium">{issue.type?.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations ({result.recommendations.length})</h4>
                    <div className="space-y-2">
                      {result.recommendations.map((rec: any, recIndex: number) => (
                        <div key={recIndex} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-start gap-2 mb-1">
                            <Badge variant="outline">{rec.priority}</Badge>
                            <span className="font-medium">{rec.type}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{rec.message}</p>
                          {rec.impact && <p className="text-xs text-slate-500">Impact: {rec.impact}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    case "low":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  }
}
