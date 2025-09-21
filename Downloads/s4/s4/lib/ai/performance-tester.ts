interface TestResult {
  type: "performance"
  status: "passed" | "failed" | "warning"
  score: number
  issues: any[]
  recommendations: any[]
}

export async function performPerformanceTests(pageData: any): Promise<TestResult> {
  const issues: any[] = []
  const recommendations: any[] = []
  let score = 100

  // Handle fallback analysis mode
  if (pageData.metaDescription === "Unable to crawl - performing limited analysis") {
    console.log(`[v0] Performing limited performance analysis for ${pageData.url}`)

    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Run detailed performance analysis when website becomes accessible",
      impact: "Comprehensive performance insights require full page access",
    })

    // Basic recommendations for any website
    recommendations.push({
      type: "performance",
      priority: "high",
      message: "Implement CDN for global content delivery",
      impact: "Reduces load times for users worldwide",
    })

    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Optimize images and implement lazy loading",
      impact: "Significantly improves page load speeds",
    })

    return {
      type: "performance",
      status: "warning",
      score: 70, // Neutral score for limited analysis
      issues,
      recommendations,
    }
  }

  // Check HTML size
  const htmlSize = new Blob([pageData.htmlContent]).size
  if (htmlSize > 100000) {
    // 100KB
    issues.push({
      severity: "medium",
      type: "large_html_size",
      message: `HTML size is ${Math.round(htmlSize / 1024)}KB`,
      size: htmlSize,
    })
    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Optimize HTML size by removing unnecessary code and whitespace",
      impact: "Reduces initial page load time and bandwidth usage",
    })
    score -= 10
  }

  // Check number of external resources
  const totalExternalResources = pageData.scripts.length + pageData.stylesheets.length + pageData.images.length
  if (totalExternalResources > 50) {
    issues.push({
      severity: "medium",
      type: "too_many_requests",
      message: `${totalExternalResources} external resources detected`,
      count: totalExternalResources,
    })
    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Reduce HTTP requests by combining files and using image sprites",
      impact: "Improves page load speed by reducing network overhead",
    })
    score -= 15
  }

  // Check for unoptimized images
  const largeImages = pageData.images.filter(
    (img: string) => img.includes(".png") || img.includes(".jpg") || img.includes(".jpeg"),
  )

  if (largeImages.length > 10) {
    issues.push({
      severity: "medium",
      type: "unoptimized_images",
      message: `${largeImages.length} potentially unoptimized images`,
      count: largeImages.length,
    })
    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Optimize images using modern formats (WebP, AVIF) and appropriate compression",
      impact: "Significantly reduces page load time and bandwidth usage",
    })
    score -= 10
  }

  // Check for inline styles
  const inlineStyleMatches = pageData.htmlContent.match(/style=["'][^"']*["']/gi) || []
  if (inlineStyleMatches.length > 20) {
    issues.push({
      severity: "low",
      type: "excessive_inline_styles",
      message: `${inlineStyleMatches.length} inline styles detected`,
      count: inlineStyleMatches.length,
    })
    recommendations.push({
      type: "performance",
      priority: "low",
      message: "Move inline styles to external CSS files for better caching",
      impact: "Improves caching efficiency and reduces HTML size",
    })
    score -= 5
  }

  // Check for missing meta viewport
  const hasViewportMeta = pageData.htmlContent.includes('name="viewport"')
  if (!hasViewportMeta) {
    issues.push({
      severity: "high",
      type: "missing_viewport_meta",
      message: "Missing viewport meta tag for mobile optimization",
      location: pageData.url,
    })
    recommendations.push({
      type: "performance",
      priority: "high",
      message: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
      impact: "Essential for proper mobile rendering and Core Web Vitals",
    })
    score -= 20
  }

  // Check for render-blocking resources
  const renderBlockingCSS = pageData.stylesheets.length
  if (renderBlockingCSS > 5) {
    issues.push({
      severity: "medium",
      type: "render_blocking_css",
      message: `${renderBlockingCSS} CSS files may block rendering`,
      count: renderBlockingCSS,
    })
    recommendations.push({
      type: "performance",
      priority: "medium",
      message: "Inline critical CSS and defer non-critical stylesheets",
      impact: "Improves First Contentful Paint and Largest Contentful Paint",
    })
    score -= 10
  }

  const status = score >= 80 ? "passed" : score >= 60 ? "warning" : "failed"

  return {
    type: "performance",
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}
