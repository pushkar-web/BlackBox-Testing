"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Loader2, User, Bot } from "lucide-react"

interface QASectionProps {
  projectId: string
  qaHistory: any[]
  project?: any
  testResults?: any[]
  crawlData?: any[]
}

export function QASection({ projectId, qaHistory, project, testResults = [], crawlData = [] }: QASectionProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState(qaHistory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    const currentQuestion = question
    setQuestion("")

    try {
      const response = await fetch("/api/qa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          question: currentQuestion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get answer")
      }

      const data = await response.json()

      // Add the new Q&A to the conversations
      const newConversation = {
        id: Date.now().toString(),
        question: currentQuestion,
        answer: data.answer,
        created_at: new Date().toISOString(),
      }

      setConversations([newConversation, ...conversations])
    } catch (error) {
      console.error("Error asking question:", error)
      // You could add error handling UI here
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const generateSuggestedQuestions = () => {
    const questions = []

    // Analyze test results to generate relevant questions
    const failedTests = testResults.filter((result) => result.score < 70)
    const criticalIssues = testResults.flatMap((result) =>
      (result.issues || []).filter((issue: any) => issue.severity === "high" || issue.severity === "critical"),
    )

    // Add questions based on failed tests
    if (failedTests.length > 0) {
      questions.push("What are the failed test cases and how can I fix them?")

      const testTypes = [...new Set(failedTests.map((test) => test.test_type))]
      if (testTypes.includes("security")) {
        questions.push("What security vulnerabilities were found on my website?")
      }
      if (testTypes.includes("performance")) {
        questions.push("How can I improve my website's performance issues?")
      }
      if (testTypes.includes("seo")) {
        questions.push("What SEO problems need to be addressed?")
      }
      if (testTypes.includes("accessibility")) {
        questions.push("What accessibility issues should I prioritize fixing?")
      }
    }

    // Add questions based on overall health
    const avgScore =
      testResults.length > 0 ? testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length : 0

    if (avgScore < 60) {
      questions.push("What are the most critical issues affecting my website?")
    } else if (avgScore >= 80) {
      questions.push("How can I optimize my already good-performing website further?")
    }

    // Add questions based on content analysis
    if (crawlData.length > 0) {
      const pagesWithIssues = crawlData.filter(
        (page) => !page.title || !page.meta_description || page.content_text?.length < 100,
      )
      if (pagesWithIssues.length > 0) {
        questions.push("Which pages need better content optimization?")
      }
    }

    // Add general improvement questions
    questions.push("What should I prioritize to improve my website's ranking?")
    questions.push("How does my website compare to industry standards?")

    // Return top 6 most relevant questions
    return questions.slice(0, 6)
  }

  const suggestedQuestions = project
    ? generateSuggestedQuestions()
    : [
        "What are the main security issues with my website?",
        "How can I improve my website's performance?",
        "Who is my target audience?",
        "What are my main competitors?",
        "What features should I prioritize?",
        "How does my pricing compare to competitors?",
      ]

  return (
    <div className="space-y-6">
      {/* Ask Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Ask About Your Website
          </CardTitle>
          <CardDescription>
            Get AI-powered insights about your website's performance, market positioning, and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your website analysis..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !question.trim()}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {/* Suggested Questions */}
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((suggested, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion(suggested)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {suggested}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Questions Yet</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Ask your first question about your website analysis to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Card key={conversation.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">You</span>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(conversation.created_at)}
                        </Badge>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{conversation.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">TestBox AI</span>
                        <Badge variant="secondary" className="text-xs">
                          AI Assistant
                        </Badge>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {conversation.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
