interface TestResult {
  type: "security"
  status: "passed" | "failed" | "warning"
  score: number
  issues: any[]
  recommendations: any[]
}

export async function performSecurityTests(pageData: any): Promise<TestResult> {
  const issues: any[] = []
  const recommendations: any[] = []
  let score = 100

  // Handle fallback analysis mode
  if (pageData.metaDescription === "Unable to crawl - performing limited analysis") {
    console.log(`[v0] Performing limited security analysis for ${pageData.url}`)

    // Basic URL-based security checks
    if (!pageData.url.startsWith("https://")) {
      issues.push({
        severity: "high",
        type: "insecure_protocol",
        message: "Website is not using HTTPS",
        location: pageData.url,
      })
      recommendations.push({
        type: "security",
        priority: "high",
        message: "Implement SSL/TLS certificate to enable HTTPS",
        impact: "Protects user data in transit and improves SEO ranking",
      })
      score -= 30
    } else {
      recommendations.push({
        type: "security",
        priority: "low",
        message: "Continue monitoring SSL certificate expiry and renewal",
        impact: "Maintains secure connections for users",
      })
    }

    return {
      type: "security",
      status: score >= 80 ? "passed" : score >= 60 ? "warning" : "failed",
      score: Math.max(0, score),
      issues,
      recommendations,
    }
  }

  // Check for HTTPS
  if (!pageData.url.startsWith("https://")) {
    issues.push({
      severity: "high",
      type: "insecure_protocol",
      message: "Website is not using HTTPS",
      location: pageData.url,
    })
    recommendations.push({
      type: "security",
      priority: "high",
      message: "Implement SSL/TLS certificate to enable HTTPS",
      impact: "Protects user data in transit and improves SEO ranking",
    })
    score -= 30
  }

  // Check for mixed content
  const insecureResources = [
    ...pageData.images.filter((img: string) => img.startsWith("http://")),
    ...pageData.scripts.filter((script: string) => script.startsWith("http://")),
    ...pageData.stylesheets.filter((css: string) => css.startsWith("http://")),
  ]

  if (insecureResources.length > 0) {
    issues.push({
      severity: "medium",
      type: "mixed_content",
      message: `Found ${insecureResources.length} insecure resources`,
      resources: insecureResources,
    })
    recommendations.push({
      type: "security",
      priority: "medium",
      message: "Update all HTTP resources to use HTTPS",
      impact: "Prevents mixed content warnings and security vulnerabilities",
    })
    score -= 15
  }

  // Check for inline scripts (potential XSS risk)
  const inlineScriptMatches = pageData.htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || []
  const inlineScripts = inlineScriptMatches.filter((script: string) => !script.includes("src="))

  if (inlineScripts.length > 0) {
    issues.push({
      severity: "medium",
      type: "inline_scripts",
      message: `Found ${inlineScripts.length} inline scripts`,
      count: inlineScripts.length,
    })
    recommendations.push({
      type: "security",
      priority: "medium",
      message: "Move inline scripts to external files and implement Content Security Policy",
      impact: "Reduces XSS attack surface and improves security posture",
    })
    score -= 10
  }

  // Check for forms without CSRF protection indicators
  pageData.forms.forEach((form: any, index: number) => {
    if (form.method.toLowerCase() === "post") {
      const hasCSRFToken = form.html.includes("csrf") || form.html.includes("_token")
      if (!hasCSRFToken) {
        issues.push({
          severity: "high",
          type: "csrf_vulnerability",
          message: `Form ${index + 1} may be vulnerable to CSRF attacks`,
          form: form.action || "Unknown action",
        })
        recommendations.push({
          type: "security",
          priority: "high",
          message: "Implement CSRF protection for all forms",
          impact: "Prevents Cross-Site Request Forgery attacks",
        })
        score -= 20
      }
    }
  })

  const status = score >= 80 ? "passed" : score >= 60 ? "warning" : "failed"

  return {
    type: "security",
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}
