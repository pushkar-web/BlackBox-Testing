interface TestResult {
  type: "ui_ux"
  status: "passed" | "failed" | "warning"
  score: number
  issues: any[]
  recommendations: any[]
}

export async function performUIUXTests(pageData: any): Promise<TestResult> {
  const issues: any[] = []
  const recommendations: any[] = []
  let score = 100

  // Check for mobile viewport
  const hasViewportMeta = pageData.htmlContent.includes('name="viewport"')
  if (!hasViewportMeta) {
    issues.push({
      severity: "high",
      type: "no_mobile_viewport",
      message: "Missing viewport meta tag for mobile responsiveness",
      location: pageData.url,
    })
    recommendations.push({
      type: "ui_ux",
      priority: "high",
      message: "Add viewport meta tag for proper mobile display",
      impact: "Essential for mobile user experience and responsive design",
    })
    score -= 20
  }

  // Check for responsive design indicators
  const hasMediaQueries = pageData.stylesheets.some(
    (css: string) => pageData.htmlContent.includes("@media") || css.includes("responsive"),
  )

  if (!hasMediaQueries && !pageData.htmlContent.includes("@media")) {
    issues.push({
      severity: "medium",
      type: "no_responsive_design",
      message: "No responsive design patterns detected",
      location: pageData.url,
    })
    recommendations.push({
      type: "ui_ux",
      priority: "medium",
      message: "Implement responsive design with CSS media queries",
      impact: "Improves user experience across different device sizes",
    })
    score -= 15
  }

  // Check for form usability
  pageData.forms.forEach((form: any, index: number) => {
    const hasSubmitButton =
      form.html.includes('type="submit"') || form.html.includes("<button") || form.html.includes('input[type="submit"]')

    if (!hasSubmitButton) {
      issues.push({
        severity: "medium",
        type: "form_no_submit",
        message: `Form ${index + 1} appears to be missing a submit button`,
        form: form.action || "Unknown action",
      })
      recommendations.push({
        type: "ui_ux",
        priority: "medium",
        message: "Ensure all forms have clear submit buttons",
        impact: "Essential for form completion and user task flow",
      })
      score -= 10
    }

    // Check for placeholder text (can be problematic for accessibility)
    const hasPlaceholders = form.html.includes("placeholder=")
    const hasLabels = form.html.includes("<label") || form.html.includes("aria-label=")

    if (hasPlaceholders && !hasLabels) {
      issues.push({
        severity: "medium",
        type: "placeholder_only_labels",
        message: `Form ${index + 1} relies only on placeholder text for field labels`,
        form: form.action || "Unknown action",
      })
      recommendations.push({
        type: "ui_ux",
        priority: "medium",
        message: "Use proper labels instead of relying solely on placeholder text",
        impact: "Improves accessibility and user experience",
      })
      score -= 10
    }
  })

  // Check for navigation elements
  const hasNavigation =
    pageData.htmlContent.includes("<nav") ||
    pageData.htmlContent.includes("navigation") ||
    pageData.htmlContent.includes("menu")

  if (!hasNavigation) {
    issues.push({
      severity: "medium",
      type: "no_navigation",
      message: "No clear navigation structure detected",
      location: pageData.url,
    })
    recommendations.push({
      type: "ui_ux",
      priority: "medium",
      message: "Add clear navigation menu for better user experience",
      impact: "Helps users understand site structure and find content",
    })
    score -= 15
  }

  // Check for loading states or progress indicators
  const hasLoadingIndicators =
    pageData.htmlContent.includes("loading") ||
    pageData.htmlContent.includes("spinner") ||
    pageData.htmlContent.includes("progress")

  if (pageData.scripts.length > 10 && !hasLoadingIndicators) {
    issues.push({
      severity: "low",
      type: "no_loading_states",
      message: "No loading indicators detected despite heavy JavaScript usage",
      scriptCount: pageData.scripts.length,
    })
    recommendations.push({
      type: "ui_ux",
      priority: "low",
      message: "Add loading states for better perceived performance",
      impact: "Improves user experience during content loading",
    })
    score -= 5
  }

  // Check for error handling in forms
  pageData.forms.forEach((form: any, index: number) => {
    const hasErrorHandling =
      form.html.includes("error") || form.html.includes("invalid") || form.html.includes("required")

    if (!hasErrorHandling) {
      issues.push({
        severity: "low",
        type: "no_form_validation",
        message: `Form ${index + 1} may lack proper validation and error handling`,
        form: form.action || "Unknown action",
      })
      recommendations.push({
        type: "ui_ux",
        priority: "low",
        message: "Implement client-side validation with clear error messages",
        impact: "Reduces user frustration and improves form completion rates",
      })
      score -= 5
    }
  })

  // Check for focus management
  const hasFocusManagement =
    pageData.htmlContent.includes("tabindex") ||
    pageData.htmlContent.includes("focus") ||
    pageData.htmlContent.includes("outline")

  if (!hasFocusManagement) {
    issues.push({
      severity: "medium",
      type: "poor_focus_management",
      message: "No focus management patterns detected",
      location: pageData.url,
    })
    recommendations.push({
      type: "ui_ux",
      priority: "medium",
      message: "Implement proper focus management for keyboard navigation",
      impact: "Essential for accessibility and keyboard-only users",
    })
    score -= 10
  }

  const status = score >= 80 ? "passed" : score >= 60 ? "warning" : "failed"

  return {
    type: "ui_ux",
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}
