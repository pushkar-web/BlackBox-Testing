interface TestResult {
  type: "accessibility"
  status: "passed" | "failed" | "warning"
  score: number
  issues: any[]
  recommendations: any[]
}

export async function performAccessibilityTests(pageData: any): Promise<TestResult> {
  const issues: any[] = []
  const recommendations: any[] = []
  let score = 100

  // Check for missing alt text on images
  const imagesWithoutAlt = pageData.images.filter((img: string) => {
    const imgTag = pageData.htmlContent.match(
      new RegExp(`<img[^>]*src=["']${img.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i"),
    )
    return imgTag && !imgTag[0].includes("alt=")
  })

  if (imagesWithoutAlt.length > 0) {
    issues.push({
      severity: "medium",
      type: "missing_alt_text",
      message: `${imagesWithoutAlt.length} images missing alt text`,
      count: imagesWithoutAlt.length,
    })
    recommendations.push({
      type: "accessibility",
      priority: "medium",
      message: "Add descriptive alt text to all images",
      impact: "Improves screen reader accessibility and SEO",
    })
    score -= 15
  }

  // Check for heading structure
  const headings = pageData.htmlContent.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || []
  const headingLevels = headings.map((h: string) => Number.parseInt(h.match(/<h([1-6])/i)?.[1] || "0"))

  const hasH1 = headingLevels.includes(1)
  if (!hasH1) {
    issues.push({
      severity: "high",
      type: "missing_h1",
      message: "Page is missing an H1 heading",
      location: pageData.url,
    })
    recommendations.push({
      type: "accessibility",
      priority: "high",
      message: "Add a descriptive H1 heading to the page",
      impact: "Improves page structure and screen reader navigation",
    })
    score -= 20
  }

  // Check for proper heading hierarchy
  let previousLevel = 0
  let hierarchyIssues = 0
  headingLevels.forEach((level) => {
    if (level > previousLevel + 1) {
      hierarchyIssues++
    }
    previousLevel = level
  })

  if (hierarchyIssues > 0) {
    issues.push({
      severity: "medium",
      type: "heading_hierarchy",
      message: "Heading hierarchy is not properly structured",
      issues: hierarchyIssues,
    })
    recommendations.push({
      type: "accessibility",
      priority: "medium",
      message: "Ensure headings follow proper hierarchical order (H1 → H2 → H3, etc.)",
      impact: "Improves content structure and navigation for assistive technologies",
    })
    score -= 10
  }

  // Check for form labels
  pageData.forms.forEach((form: any, index: number) => {
    const inputs = form.html.match(/<input[^>]*>/gi) || []
    const inputsWithoutLabels = inputs.filter((input: string) => {
      const hasId = input.match(/id=["']([^"']+)["']/i)
      if (!hasId) return true

      const labelExists = form.html.includes(`for="${hasId[1]}"`)
      const hasAriaLabel = input.includes("aria-label=")
      return !labelExists && !hasAriaLabel
    })

    if (inputsWithoutLabels.length > 0) {
      issues.push({
        severity: "high",
        type: "missing_form_labels",
        message: `Form ${index + 1} has ${inputsWithoutLabels.length} inputs without labels`,
        form: form.action || "Unknown action",
      })
      recommendations.push({
        type: "accessibility",
        priority: "high",
        message: "Associate all form inputs with descriptive labels",
        impact: "Essential for screen reader users to understand form fields",
      })
      score -= 15
    }
  })

  // Check for color contrast (basic check for common patterns)
  const hasLowContrastWarning =
    pageData.htmlContent.includes("color: #ccc") ||
    pageData.htmlContent.includes("color: #ddd") ||
    pageData.htmlContent.includes("color: #eee")

  if (hasLowContrastWarning) {
    issues.push({
      severity: "medium",
      type: "potential_contrast_issues",
      message: "Potential low color contrast detected",
      location: pageData.url,
    })
    recommendations.push({
      type: "accessibility",
      priority: "medium",
      message: "Verify color contrast meets WCAG AA standards (4.5:1 ratio)",
      impact: "Ensures text is readable for users with visual impairments",
    })
    score -= 10
  }

  const status = score >= 80 ? "passed" : score >= 60 ? "warning" : "failed"

  return {
    type: "accessibility",
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}
