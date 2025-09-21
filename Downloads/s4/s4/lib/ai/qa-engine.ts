interface QAContext {
  project: any
  crawlData: any[]
  testResults: any[]
  marketAnalysis: any[]
}

export async function generateAnswer(question: string, context: QAContext): Promise<string> {
  const { project, crawlData, testResults, marketAnalysis } = context

  const questionAnalysis = analyzeQuestion(question, context)

  return await generateComprehensiveAnswer(question, questionAnalysis, context)
}

function analyzeQuestion(question: string, context: QAContext) {
  const lowerQuestion = question.toLowerCase()
  const { project, crawlData, testResults, marketAnalysis } = context

  // Extract key topics and intent from the question
  const topics = extractTopics(lowerQuestion)
  const intent = determineIntent(lowerQuestion)
  const scope = determineScope(lowerQuestion)

  // Analyze available data relevance
  const relevantData = {
    crawlData: crawlData.filter((page) => isRelevantToQuestion(page, lowerQuestion)),
    testResults: testResults.filter((result) => isRelevantToQuestion(result, lowerQuestion)),
    marketAnalysis: marketAnalysis.filter((analysis) => isRelevantToQuestion(analysis, lowerQuestion)),
    project,
  }

  return {
    topics,
    intent,
    scope,
    relevantData,
    questionType: categorizeQuestion(question),
    complexity: assessQuestionComplexity(lowerQuestion),
  }
}

function extractTopics(question: string): string[] {
  const topicKeywords = {
    performance: ["speed", "load", "performance", "fast", "slow", "optimization", "cache", "cdn"],
    security: ["security", "vulnerability", "safe", "ssl", "https", "attack", "protection", "breach"],
    seo: ["seo", "search", "ranking", "google", "keywords", "meta", "title", "description"],
    accessibility: ["accessibility", "a11y", "disabled", "screen reader", "contrast", "keyboard"],
    design: ["design", "ui", "ux", "layout", "color", "font", "responsive", "mobile"],
    content: ["content", "text", "copy", "writing", "blog", "article", "information"],
    functionality: ["function", "feature", "work", "broken", "error", "bug", "form", "button"],
    market: ["competitor", "market", "audience", "customer", "pricing", "business"],
    technical: ["code", "html", "css", "javascript", "framework", "library", "api"],
    analytics: ["traffic", "visitors", "conversion", "analytics", "metrics", "data"],
  }

  const foundTopics = []
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((keyword) => question.includes(keyword))) {
      foundTopics.push(topic)
    }
  }

  return foundTopics.length > 0 ? foundTopics : ["general"]
}

function determineIntent(question: string): string {
  if (question.includes("how") || question.includes("what should")) return "guidance"
  if (question.includes("why") || question.includes("explain")) return "explanation"
  if (question.includes("what is") || question.includes("what are")) return "information"
  if (question.includes("compare") || question.includes("vs") || question.includes("versus")) return "comparison"
  if (question.includes("recommend") || question.includes("suggest") || question.includes("best"))
    return "recommendation"
  if (question.includes("fix") || question.includes("solve") || question.includes("improve")) return "solution"
  if (question.includes("list") || question.includes("show me")) return "listing"
  return "general"
}

function determineScope(question: string): string {
  if (question.includes("overview") || question.includes("summary") || question.includes("general")) return "broad"
  if (question.includes("specific") || question.includes("detail") || question.includes("exactly")) return "detailed"
  if (question.includes("quick") || question.includes("brief") || question.includes("short")) return "concise"
  return "standard"
}

function isRelevantToQuestion(data: any, question: string): boolean {
  const dataString = JSON.stringify(data).toLowerCase()
  const questionWords = question.split(" ").filter((word) => word.length > 3)

  return (
    questionWords.some((word) => dataString.includes(word)) ||
    (data.test_type && question.includes(data.test_type)) ||
    (data.analysis_type && question.includes(data.analysis_type))
  )
}

function assessQuestionComplexity(question: string): "simple" | "moderate" | "complex" {
  const complexIndicators = ["analyze", "compare", "strategy", "comprehensive", "detailed", "in-depth"]
  const simpleIndicators = ["what", "is", "are", "does", "can", "will"]

  if (complexIndicators.some((indicator) => question.includes(indicator))) return "complex"
  if (simpleIndicators.some((indicator) => question.includes(indicator))) return "simple"
  return "moderate"
}

async function generateComprehensiveAnswer(question: string, analysis: any, context: QAContext): Promise<string> {
  const { topics, intent, scope, relevantData, questionType, complexity } = analysis

  // Build context-aware response based on question analysis
  let response = ""

  const greetings = [
    `Hey! Looking at your website "${context.project.name}", here's what I found:`,
    `Great question! I've been analyzing "${context.project.name}" and here's the scoop:`,
    `Let me break this down for you regarding "${context.project.name}":`,
    `Good question! Here's what I discovered about "${context.project.name}":`,
  ]
  response += `${greetings[Math.floor(Math.random() * greetings.length)]}\n\n`

  // Handle different question types with enhanced logic
  switch (questionType) {
    case "technical":
      response += await generateEnhancedTechnicalAnswer(question, relevantData, complexity, intent)
      break
    case "market":
      response += await generateEnhancedMarketAnswer(question, relevantData, complexity, intent)
      break
    case "performance":
      response +=
        "I'm still crunching the performance numbers for you! Give me a couple more minutes and I'll have some detailed insights about how fast your site loads and where we can speed things up. 🚀"
      break
    case "security":
      response +=
        "I'm doing a thorough security check right now! I'll have a complete security report ready in just a few minutes, including any vulnerabilities I find and how to fix them. 🔒"
      break
    case "seo":
      response += await generateSEOAnswer(question, relevantData, complexity, intent)
      break
    case "accessibility":
      response += await generateAccessibilityAnswer(question, relevantData, complexity, intent)
      break
    case "design":
      response += await generateDesignAnswer(question, relevantData, complexity, intent)
      break
    case "content":
      response += await generateContentAnswer(question, relevantData, complexity, intent)
      break
    case "general":
    default:
      response += await generateEnhancedGeneralAnswer(question, context, complexity, intent, topics)
  }

  // Add relevant follow-up suggestions based on the question
  response += await generateFollowUpSuggestions(question, analysis, context)

  return response
}

async function generateEnhancedTechnicalAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { crawlData, testResults } = relevantData

  let response = ""

  if (intent === "explanation") {
    response += "**Technical Explanation:**\n\n"
  } else if (intent === "solution") {
    response += "**Technical Solutions:**\n\n"
  } else {
    response += "**Technical Analysis:**\n\n"
  }

  // Analyze technologies found
  const technologies = extractTechnologies(crawlData)
  if (technologies.length > 0) {
    response += `**Technologies Detected:** ${technologies.join(", ")}\n\n`
  }

  // Technical issues analysis
  const technicalIssues = testResults.filter(
    (result) =>
      result.test_type === "security" || result.test_type === "performance" || result.test_type === "functionality",
  )

  if (technicalIssues.length > 0) {
    response += "**Technical Issues Found:**\n"
    technicalIssues.forEach((issue) => {
      response += `- **${issue.test_type.toUpperCase()}**: ${issue.issues.length} issues (Score: ${issue.score}/100)\n`
      if (complexity !== "simple" && issue.issues.length > 0) {
        response += `  ${issue.issues
          .slice(0, 2)
          .map((i: any) => `• ${i.message}`)
          .join("\n  ")}\n`
      }
    })
    response += "\n"
  }

  // Recommendations based on intent
  if (intent === "solution" || intent === "recommendation") {
    const allRecommendations = technicalIssues.flatMap((result) => result.recommendations)
    if (allRecommendations.length > 0) {
      response += "**Recommended Solutions:**\n"
      allRecommendations.slice(0, complexity === "complex" ? 8 : 5).forEach((rec: any) => {
        response += `- ${rec.message}\n`
      })
      response += "\n"
    }
  }

  return response
}

async function generateEnhancedMarketAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { marketAnalysis } = relevantData

  let response = ""

  if (marketAnalysis.length === 0) {
    return "Market analysis is still being processed. Please check back in a few minutes for detailed market insights, or ask me about other aspects of your website analysis."
  }

  if (intent === "comparison") {
    response += "**Market Comparison Analysis:**\n\n"
  } else if (intent === "recommendation") {
    response += "**Market Strategy Recommendations:**\n\n"
  } else {
    response += "**Market Analysis Insights:**\n\n"
  }

  // Detailed analysis based on available data
  const competitorAnalysis = marketAnalysis.find((analysis) => analysis.analysis_type === "competitor")
  const audienceAnalysis = marketAnalysis.find((analysis) => analysis.analysis_type === "target_audience")
  const pricingAnalysis = marketAnalysis.find((analysis) => analysis.analysis_type === "pricing")

  if (competitorAnalysis && (question.includes("competitor") || question.includes("competition"))) {
    response += `**Competitive Landscape:**\n`
    response += `- Industry: ${competitorAnalysis.insights.industry}\n`
    response += `- Business Model: ${competitorAnalysis.insights.business_model}\n`
    response += `- Market Position: ${competitorAnalysis.insights.market_positioning}\n`

    if (complexity !== "simple") {
      response += `- Direct Competitors: ${competitorAnalysis.insights.competitor_analysis.direct_competitors.slice(0, 5).join(", ")}\n`
      response += `- Competitive Advantages: ${competitorAnalysis.insights.competitive_advantages.join(", ")}\n`
    }
    response += "\n"
  }

  if (audienceAnalysis && (question.includes("audience") || question.includes("customer"))) {
    response += `**Target Audience Analysis:**\n`
    response += `- Primary Audience: ${audienceAnalysis.insights.primary_audience}\n`

    if (complexity !== "simple") {
      const segments = Object.entries(audienceAnalysis.insights.customer_segments)
        .filter(([key, value]) => value)
        .map(([key]) => key.replace("_", " ").toUpperCase())
      response += `- Customer Segments: ${segments.join(", ")}\n`
    }
    response += "\n"
  }

  if (pricingAnalysis && (question.includes("pricing") || question.includes("price"))) {
    response += `**Pricing Strategy:**\n`
    response += `- Pricing Model: ${pricingAnalysis.insights.pricing_model}\n`
    response += `- Market Positioning: ${pricingAnalysis.insights.competitive_pricing.positioning}\n\n`
  }

  return response
}

async function generateSEOAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { testResults, crawlData } = relevantData
  const seoResults = testResults.filter((result) => result.test_type === "seo")

  let response = "**SEO Analysis:**\n\n"

  if (seoResults.length === 0) {
    return "SEO analysis is still being processed. Please check back in a few minutes for detailed SEO insights."
  }

  const avgScore = seoResults.reduce((sum, result) => sum + result.score, 0) / seoResults.length
  response += `**SEO Score:** ${Math.round(avgScore)}/100\n\n`

  // Meta information analysis
  const pagesWithMeta = crawlData.filter((page) => page.title && page.meta_description)
  response += `**Meta Information:**\n`
  response += `- Pages with titles: ${crawlData.filter((p) => p.title).length}/${crawlData.length}\n`
  response += `- Pages with descriptions: ${pagesWithMeta.length}/${crawlData.length}\n\n`

  // SEO issues and recommendations
  const allIssues = seoResults.flatMap((result) => result.issues)
  const allRecommendations = seoResults.flatMap((result) => result.recommendations)

  if (allIssues.length > 0) {
    response += `**SEO Issues:**\n`
    allIssues.slice(0, complexity === "complex" ? 8 : 5).forEach((issue: any) => {
      response += `- ${issue.message}\n`
    })
    response += "\n"
  }

  if (intent === "solution" || intent === "recommendation") {
    response += `**SEO Recommendations:**\n`
    allRecommendations.slice(0, complexity === "complex" ? 8 : 5).forEach((rec: any) => {
      response += `- ${rec.message}\n`
    })
  }

  return response
}

async function generateAccessibilityAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { testResults } = relevantData
  const a11yResults = testResults.filter((result) => result.test_type === "accessibility")

  let response = "**Accessibility Analysis:**\n\n"

  if (a11yResults.length === 0) {
    return "Accessibility analysis is still being processed. Please check back in a few minutes for detailed accessibility insights."
  }

  const avgScore = a11yResults.reduce((sum, result) => sum + result.score, 0) / a11yResults.length
  response += `**Accessibility Score:** ${Math.round(avgScore)}/100\n\n`

  const allIssues = a11yResults.flatMap((result) => result.issues)
  const criticalIssues = allIssues.filter((issue: any) => issue.severity === "high" || issue.severity === "critical")

  if (criticalIssues.length > 0) {
    response += `**Critical Accessibility Issues:**\n`
    criticalIssues.slice(0, 5).forEach((issue: any) => {
      response += `- ${issue.message}\n`
    })
    response += "\n"
  }

  if (intent === "solution" || intent === "recommendation") {
    const allRecommendations = a11yResults.flatMap((result) => result.recommendations)
    response += `**Accessibility Improvements:**\n`
    allRecommendations.slice(0, complexity === "complex" ? 8 : 5).forEach((rec: any) => {
      response += `- ${rec.message}\n`
    })
  }

  return response
}

async function generateDesignAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { crawlData, testResults } = relevantData

  let response = "**Design Analysis:**\n\n"

  // UI/UX test results
  const uiResults = testResults.filter((result) => result.test_type === "ui_ux")

  if (uiResults.length > 0) {
    const avgScore = uiResults.reduce((sum, result) => sum + result.score, 0) / uiResults.length
    response += `**Design Score:** ${Math.round(avgScore)}/100\n\n`

    const designIssues = uiResults.flatMap((result) => result.issues)
    if (designIssues.length > 0) {
      response += `**Design Issues:**\n`
      designIssues.slice(0, complexity === "complex" ? 8 : 5).forEach((issue: any) => {
        response += `- ${issue.message}\n`
      })
      response += "\n"
    }
  }

  // Responsive design analysis
  const mobileIssues = testResults.filter((result) =>
    result.issues.some(
      (issue: any) =>
        issue.message.toLowerCase().includes("mobile") || issue.message.toLowerCase().includes("responsive"),
    ),
  )

  if (mobileIssues.length > 0) {
    response += `**Mobile/Responsive Issues:** ${mobileIssues.length} pages have mobile-related issues\n\n`
  }

  if (intent === "recommendation") {
    const designRecommendations = uiResults.flatMap((result) => result.recommendations)
    response += `**Design Recommendations:**\n`
    designRecommendations.slice(0, complexity === "complex" ? 8 : 5).forEach((rec: any) => {
      response += `- ${rec.message}\n`
    })
  }

  return response
}

async function generateContentAnswer(
  question: string,
  relevantData: any,
  complexity: string,
  intent: string,
): Promise<string> {
  const { crawlData } = relevantData

  let response = "**Content Analysis:**\n\n"

  // Content statistics
  const totalPages = crawlData.length
  const pagesWithContent = crawlData.filter((page) => page.content_text && page.content_text.length > 100)
  const avgContentLength =
    pagesWithContent.reduce((sum, page) => sum + page.content_text.length, 0) / pagesWithContent.length

  response += `**Content Statistics:**\n`
  response += `- Total Pages: ${totalPages}\n`
  response += `- Pages with substantial content: ${pagesWithContent.length}\n`
  response += `- Average content length: ${Math.round(avgContentLength)} characters\n\n`

  // Content quality indicators
  const pagesWithImages = crawlData.filter((page) => page.images && page.images.length > 0)
  const pagesWithForms = crawlData.filter((page) => page.forms && page.forms.length > 0)

  response += `**Content Features:**\n`
  response += `- Pages with images: ${pagesWithImages.length}/${totalPages}\n`
  response += `- Pages with forms: ${pagesWithForms.length}/${totalPages}\n\n`

  if (intent === "recommendation") {
    response += `**Content Recommendations:**\n`
    if (avgContentLength < 300) {
      response += `- Consider adding more detailed content to improve SEO and user engagement\n`
    }
    if (pagesWithImages.length < totalPages * 0.5) {
      response += `- Add more visual content (images, videos) to improve user experience\n`
    }
    response += `- Ensure all content is relevant, up-to-date, and provides value to users\n`
    response += `- Consider adding calls-to-action to guide user behavior\n`
  }

  return response
}

async function generateEnhancedGeneralAnswer(
  question: string,
  context: QAContext,
  complexity: string,
  intent: string,
  topics: string[],
): Promise<string> {
  const { project, crawlData, testResults, marketAnalysis } = context

  let response = ""

  // Validate that we have the correct project data
  if (!project || !project.url) {
    return "Hmm, I'm having trouble accessing your project data right now. Could you try refreshing the page? I'll be right here when you're ready to dive back in!"
  }

  const deduplicatedResults = deduplicateTestResults(testResults)
  const validTestResults = deduplicatedResults.filter((result) => result && result.score !== undefined)

  const avgTestScore =
    validTestResults.length > 0
      ? validTestResults.reduce((sum, result) => sum + result.score, 0) / validTestResults.length
      : 0

  const totalPages = crawlData ? crawlData.length : 0
  const totalIssues = validTestResults.reduce((sum, result) => sum + (result.issues ? result.issues.length : 0), 0)

  if (question.toLowerCase().includes("failed") || question.toLowerCase().includes("fail")) {
    const failedTests = validTestResults.filter((result) => result.score < 70)

    const allCriticalIssues = validTestResults.flatMap((result) =>
      (result.issues || []).filter((issue: any) => issue.severity === "high" || issue.severity === "critical"),
    )
    const criticalIssues = deduplicateIssues(allCriticalIssues)

    if (failedTests.length > 0) {
      response += `Alright, let's talk about what's not quite working perfectly on "${project.name}". Don't worry though - every website has room for improvement!\n\n`

      response += `**Here's what needs some attention:**\n`

      const groupedFailedTests = groupTestsByCategory(failedTests)

      Object.entries(groupedFailedTests).forEach(([category, tests]) => {
        const testName = category.replace("_", " ").toUpperCase()
        const avgScore = tests.reduce((sum, test) => sum + test.score, 0) / tests.length
        const allIssues = tests.flatMap((test) => test.issues || [])
        const uniqueIssues = deduplicateIssues(allIssues)

        response += `• **${testName}**: Scored ${Math.round(avgScore)}/100 with ${uniqueIssues.length} issues to fix\n`

        if (uniqueIssues.length > 0) {
          const topIssues = uniqueIssues.slice(0, complexity === "complex" ? 3 : 2)
          topIssues.forEach((issue: any) => {
            response += `- ${issue.message}\n`
            if (issue.severity) {
              const severityEmoji = issue.severity === "critical" ? "🚨" : issue.severity === "high" ? "⚠️" : "ℹ️"
              response += `${severityEmoji} ${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} priority\n`
            }
          })
        }
      })
      response += "\n"

      response += `**The good news? Here's how to fix them:**\n`

      Object.entries(groupedFailedTests).forEach(([category, tests]) => {
        const testName = category.replace("_", " ").toUpperCase()
        const allRecommendations = tests.flatMap((test) => test.recommendations || [])
        const uniqueRecommendations = deduplicateRecommendations(allRecommendations)

        if (uniqueRecommendations.length > 0) {
          response += `**For ${testName}:**\n`
          uniqueRecommendations.slice(0, 3).forEach((rec: any) => {
            response += `✅ ${rec.message || rec}\n`
          })
        }
      })
      response += "\n"
    }

    if (criticalIssues.length > 0) {
      response += `**🚨 These need your immediate attention:**\n`
      criticalIssues.slice(0, 5).forEach((issue: any) => {
        response += `• ${issue.message}\n`
      })
      response += "\n"
    }

    if (failedTests.length === 0 && criticalIssues.length === 0) {
      response += `Actually, this is great news! 🎉 No major failures detected. Your website "${project.name}" is doing really well with a solid ${Math.round(avgTestScore)}/100 score.\n\n`

      if (avgTestScore < 90) {
        response += `**Want to make it even better? Here are some ideas:**\n`
        const allRecommendations = validTestResults.flatMap((result) => result.recommendations || [])
        const uniqueRecommendations = deduplicateRecommendations(allRecommendations)
        if (uniqueRecommendations.length > 0) {
          uniqueRecommendations.slice(0, 3).forEach((rec: any) => {
            response += `• ${rec.message || rec}\n`
          })
        }
        response += "\n"
      }
    }

    return response
  }

  if (intent === "information" || topics.includes("general")) {
    response += `**Here's the full picture:**\n`
    response += `🌐 **Your site:** ${project.name} (${project.url})\n`
    response += `📄 **Pages I checked:** ${totalPages}\n`
    response += `💯 **Overall health score:** ${Math.round(avgTestScore)}/100\n`
    response += `🔍 **Issues found:** ${totalIssues}\n`

    let healthStatus = ""
    let healthEmoji = ""
    if (avgTestScore >= 90) {
      healthStatus = "Fantastic! Your website is crushing it! 🚀"
      healthEmoji = "🌟"
    } else if (avgTestScore >= 80) {
      healthStatus = "Looking good! Just a few tweaks and you'll be golden ✨"
      healthEmoji = "👍"
    } else if (avgTestScore >= 60) {
      healthStatus = "Not bad, but there's definitely room for improvement 💪"
      healthEmoji = "⚡"
    } else if (avgTestScore >= 40) {
      healthStatus = "We've got some work to do, but nothing we can't handle! 🛠️"
      healthEmoji = "🔧"
    } else {
      healthStatus = "Okay, let's roll up our sleeves - there are some important fixes needed 🚨"
      healthEmoji = "🆘"
    }

    response += `${healthEmoji} **Status:** ${healthStatus}\n\n`
  }

  const testCategories = [
    { key: "performance", name: "Speed & Performance", emoji: "⚡" },
    { key: "security", name: "Security", emoji: "🔒" },
    { key: "seo", name: "SEO & Search", emoji: "🔍" },
    { key: "accessibility", name: "Accessibility", emoji: "♿" },
    { key: "ui_ux", name: "Design & UX", emoji: "🎨" },
  ]

  testCategories.forEach((category) => {
    if (topics.includes(category.key) || complexity === "complex") {
      const categoryResults = validTestResults.filter((result) => result.test_type === category.key)
      if (categoryResults.length > 0) {
        const avgScore = categoryResults.reduce((sum, result) => sum + result.score, 0) / categoryResults.length
        const issueCount = categoryResults.reduce((sum, result) => sum + (result.issues ? result.issues.length : 0), 0)

        let status = ""
        let actionNeeded = ""
        if (avgScore >= 80) {
          status = "Excellent"
          actionNeeded = "maybe just some fine-tuning"
        } else if (avgScore >= 60) {
          status = "Pretty good"
          actionNeeded = "a few improvements would help"
        } else if (avgScore >= 40) {
          status = "Needs some love"
          actionNeeded = "several things to fix"
        } else {
          status = "Needs urgent attention"
          actionNeeded = "important fixes required"
        }

        response += `${category.emoji} **${category.name}:** ${status} (${Math.round(avgScore)}/100, ${issueCount} issues) - ${actionNeeded}\n`

        const topIssue = categoryResults
          .flatMap((result) => result.issues || [])
          .find((issue) => issue.severity === "high" || issue.severity === "critical")
        if (topIssue) {
          response += `  🎯 Top priority: ${topIssue.message}\n`
        }
      }
    }
  })

  if (response.includes("⚡ **Speed & Performance:**") || response.includes("🔒 **Security:**")) {
    response += "\n"
  }

  if (marketAnalysis && marketAnalysis.length > 0 && (topics.includes("market") || complexity === "complex")) {
    const competitorAnalysis = marketAnalysis.find((analysis) => analysis.analysis_type === "competitor")
    const audienceAnalysis = marketAnalysis.find((analysis) => analysis.analysis_type === "target_audience")

    response += `📊 **Market insights:** I've done some digging into your competitive landscape and audience!\n`

    if (competitorAnalysis) {
      response += `• Industry: ${competitorAnalysis.insights?.industry || "Still analyzing..."}\n`
      response += `• Business model: ${competitorAnalysis.insights?.business_model || "Working on it..."}\n`
    }

    if (audienceAnalysis) {
      response += `• Your main audience: ${audienceAnalysis.insights?.primary_audience || "Crunching the numbers..."}\n`
    }

    response += "\n"
  }

  if (intent === "recommendation" || intent === "solution") {
    const highPriorityIssues = validTestResults.flatMap((result) =>
      (result.issues || []).filter((issue: any) => issue.severity === "high" || issue.severity === "critical"),
    )

    if (highPriorityIssues.length > 0) {
      response += `🎯 **Let's tackle the big stuff first** (${highPriorityIssues.length} critical items):\n\n`

      const issuesByCategory: { [key: string]: any[] } = {}
      validTestResults.forEach((result) => {
        const criticalIssues = (result.issues || []).filter(
          (issue: any) => issue.severity === "high" || issue.severity === "critical",
        )
        if (criticalIssues.length > 0) {
          issuesByCategory[result.test_type] = criticalIssues
        }
      })

      Object.entries(issuesByCategory).forEach(([category, issues]) => {
        const categoryName = category.replace("_", " ").toUpperCase()
        response += `**${categoryName}:**\n`
        issues.slice(0, 2).forEach((issue: any) => {
          response += `  • ${issue.message}\n`
        })
      })
      response += "\n"
    } else if (totalIssues > 0) {
      const allRecommendations = validTestResults.flatMap((result) => result.recommendations || [])
      if (allRecommendations.length > 0) {
        response += `💡 **Here's what I'd focus on next** (${totalIssues} total improvements):\n\n`

        const prioritizedRecs = allRecommendations
          .filter((rec) => rec.message || typeof rec === "string")
          .slice(0, complexity === "complex" ? 6 : 3)

        prioritizedRecs.forEach((rec: any, index) => {
          response += `${index + 1}. ${rec.message || rec}\n`
        })
        response += "\n"
      }
    } else {
      response += `🚀 **You're doing great! Here are some advanced ideas:**\n`
      response += `• Consider implementing some cutting-edge performance optimizations\n`
      response += `• Maybe refresh your content strategy to boost engagement\n`
      response += `• Explore some advanced SEO techniques to climb those rankings\n\n`
    }
  }

  return response
}

async function generateFollowUpSuggestions(question: string, analysis: any, context: QAContext): Promise<string> {
  const { topics, intent, questionType } = analysis
  const { testResults } = context

  let suggestions = "\n💬 **What else would you like to know?**\n"

  const followUps = []

  const failedTests = testResults.filter((result) => result.score < 70)
  const hasSecurityIssues = testResults.some((result) => result.test_type === "security" && result.score < 80)
  const hasPerformanceIssues = testResults.some((result) => result.test_type === "performance" && result.score < 80)
  const hasSEOIssues = testResults.some((result) => result.test_type === "seo" && result.score < 80)

  if (questionType === "performance" || hasPerformanceIssues) {
    followUps.push("How can I make my website lightning fast?")
    followUps.push("What's slowing down my site the most?")
    followUps.push("Which pages need the most speed work?")
  } else if (questionType === "security" || hasSecurityIssues) {
    followUps.push("What are my biggest security risks?")
    followUps.push("How can I bulletproof my website security?")
    followUps.push("What security upgrades should I prioritize?")
  } else if (questionType === "market") {
    followUps.push("Who am I really competing against?")
    followUps.push("What does my ideal customer look like?")
    followUps.push("How can I stand out from the competition?")
  } else if (questionType === "seo" || hasSEOIssues) {
    followUps.push("How do I climb higher in Google search?")
    followUps.push("What keywords should I be targeting?")
    followUps.push("Which pages need SEO love the most?")
  } else {
    if (failedTests.length > 0) {
      followUps.push("What should I fix first to get the biggest impact?")
      followUps.push("How long will these fixes realistically take?")
      followUps.push("How are these issues affecting my visitors?")
    } else {
      followUps.push("How does my site stack up against others in my industry?")
      followUps.push("What features would wow my users?")
      followUps.push("How can I turn more visitors into customers?")
    }
  }

  const avgScore =
    testResults.length > 0 ? testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length : 0

  if (avgScore < 60) {
    followUps.push("What would it cost to get these issues fixed?")
  } else if (avgScore >= 80) {
    followUps.push("How do I keep my site performing this well?")
  }

  // Add 3-4 most relevant follow-ups with more casual formatting
  followUps.slice(0, 4).forEach((followUp) => {
    suggestions += `• "${followUp}"\n`
  })

  return suggestions
}

function getDetailedStatusText(testResults: any[], testType: string): string {
  const results = testResults.filter((result) => result.test_type === testType)
  if (results.length === 0) return "Analysis pending"

  const avgScore = results.reduce((sum, result) => sum + result.score, 0) / results.length
  const issueCount = results.reduce((sum, result) => sum + result.issues.length, 0)

  let status = ""
  if (avgScore >= 80) status = "Good"
  else if (avgScore >= 60) status = "Needs Improvement"
  else status = "Critical Issues"

  return `${status} (Score: ${Math.round(avgScore)}/100, ${issueCount} issues)`
}

function categorizeQuestion(question: string): string {
  const lowerQuestion = question.toLowerCase()

  // Enhanced categorization with more keywords
  if (
    lowerQuestion.includes("market") ||
    lowerQuestion.includes("competitor") ||
    lowerQuestion.includes("audience") ||
    lowerQuestion.includes("customer") ||
    lowerQuestion.includes("pricing") ||
    lowerQuestion.includes("business model")
  ) {
    return "market"
  } else if (
    lowerQuestion.includes("performance") ||
    lowerQuestion.includes("speed") ||
    lowerQuestion.includes("load") ||
    lowerQuestion.includes("optimization") ||
    lowerQuestion.includes("cache") ||
    lowerQuestion.includes("cdn")
  ) {
    return "performance"
  } else if (
    lowerQuestion.includes("security") ||
    lowerQuestion.includes("vulnerability") ||
    lowerQuestion.includes("safe") ||
    lowerQuestion.includes("ssl") ||
    lowerQuestion.includes("https") ||
    lowerQuestion.includes("attack")
  ) {
    return "security"
  } else if (
    lowerQuestion.includes("seo") ||
    lowerQuestion.includes("search") ||
    lowerQuestion.includes("ranking") ||
    lowerQuestion.includes("google") ||
    lowerQuestion.includes("keywords") ||
    lowerQuestion.includes("meta")
  ) {
    return "seo"
  } else if (
    lowerQuestion.includes("accessibility") ||
    lowerQuestion.includes("a11y") ||
    lowerQuestion.includes("disabled") ||
    lowerQuestion.includes("screen reader") ||
    lowerQuestion.includes("contrast")
  ) {
    return "accessibility"
  } else if (
    lowerQuestion.includes("design") ||
    lowerQuestion.includes("ui") ||
    lowerQuestion.includes("ux") ||
    lowerQuestion.includes("layout") ||
    lowerQuestion.includes("responsive") ||
    lowerQuestion.includes("mobile")
  ) {
    return "design"
  } else if (
    lowerQuestion.includes("content") ||
    lowerQuestion.includes("text") ||
    lowerQuestion.includes("copy") ||
    lowerQuestion.includes("writing") ||
    lowerQuestion.includes("blog") ||
    lowerQuestion.includes("article")
  ) {
    return "content"
  } else if (
    lowerQuestion.includes("technical") ||
    lowerQuestion.includes("code") ||
    lowerQuestion.includes("implementation") ||
    lowerQuestion.includes("html") ||
    lowerQuestion.includes("css") ||
    lowerQuestion.includes("javascript")
  ) {
    return "technical"
  } else {
    return "general"
  }
}

function extractTechnologies(crawlData: any[]): string[] {
  const technologies = new Set<string>()

  crawlData.forEach((page) => {
    page.scripts.forEach((script: string) => {
      if (script.includes("react")) technologies.add("React")
      if (script.includes("vue")) technologies.add("Vue.js")
      if (script.includes("angular")) technologies.add("Angular")
      if (script.includes("jquery")) technologies.add("jQuery")
      if (script.includes("bootstrap")) technologies.add("Bootstrap")
    })
  })

  return Array.from(technologies)
}

function getStatusText(testResults: any[], testType: string): string {
  const results = testResults.filter((result) => result.test_type === testType)
  if (results.length === 0) return "Pending"

  const avgScore = results.reduce((sum, result) => sum + result.score, 0) / results.length

  if (avgScore >= 80) return "Good"
  if (avgScore >= 60) return "Needs Improvement"
  return "Critical Issues"
}

// Helper functions for deduplication
function deduplicateTestResults(testResults: any[]): any[] {
  const seen = new Set()
  return testResults.filter((result) => {
    const key = `${result.test_type}-${result.page_url || "general"}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function deduplicateIssues(issues: any[]): any[] {
  const seen = new Set()
  return issues.filter((issue) => {
    const key = issue.message.toLowerCase().trim()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function deduplicateRecommendations(recommendations: any[]): any[] {
  const seen = new Set()
  return recommendations.filter((rec) => {
    const message = rec.message || rec
    const key = message.toLowerCase().trim()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function groupTestsByCategory(tests: any[]): { [key: string]: any[] } {
  return tests.reduce((groups, test) => {
    const category = test.test_type
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(test)
    return groups
  }, {})
}
