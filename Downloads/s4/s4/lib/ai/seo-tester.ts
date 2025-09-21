interface TestResult {
  type: "seo"
  status: "passed" | "failed" | "warning"
  score: number
  issues: any[]
  recommendations: any[]
}

export async function performSEOTests(pageData: any): Promise<TestResult> {
  const issues: any[] = []
  const recommendations: any[] = []
  let score = 100

  // Handle fallback analysis mode
  if (pageData.metaDescription === "Unable to crawl - performing limited analysis") {
    console.log(`[v0] Performing limited SEO analysis for ${pageData.url}`)

    // Basic URL structure analysis
    const urlParts = pageData.url.split('/')
    const domain = urlParts[2]

    if (domain && domain.length > 15) {
      recommendations.push({
        type: "seo",
        priority: "low",
        message: "Consider a shorter, more memorable domain name",
        impact: "Improves brand recall and typing accuracy",
      })
    }

    // General SEO recommendations
    recommendations.push({
      type: "seo",
      priority: "high",
      message: "Ensure all pages have unique, descriptive title tags (50-60 characters)",
      impact: "Critical for search engine rankings and click-through rates",
    })

    recommendations.push({
      type: "seo",
      priority: "high",
      message: "Add compelling meta descriptions (150-160 characters) to all pages",
      impact: "Improves click-through rates from search results",
    })

    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Implement structured data markup for better search visibility",
      impact: "Helps search engines understand your content better",
    })

    return {
      type: "seo",
      status: "warning",
      score: 60, // Lower score due to limited analysis
      issues,
      recommendations,
    }
  }

  // Check title tag
  if (!pageData.title || pageData.title.length === 0) {
    issues.push({
      severity: "high",
      type: "missing_title",
      message: "Page is missing a title tag",
      location: pageData.url,
    })
    recommendations.push({
      type: "seo",
      priority: "high",
      message: "Add a descriptive title tag (50-60 characters)",
      impact: "Critical for search engine rankings and click-through rates",
    })
    score -= 25
  } else if (pageData.title.length > 60) {
    issues.push({
      severity: "medium",
      type: "long_title",
      message: `Title tag is ${pageData.title.length} characters (recommended: 50-60)`,
      length: pageData.title.length,
    })
    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Shorten title tag to 50-60 characters for better display in search results",
      impact: "Prevents title truncation in search engine results",
    })
    score -= 10
  }

  // Check meta description
  if (!pageData.metaDescription || pageData.metaDescription.length === 0) {
    issues.push({
      severity: "high",
      type: "missing_meta_description",
      message: "Page is missing a meta description",
      location: pageData.url,
    })
    recommendations.push({
      type: "seo",
      priority: "high",
      message: "Add a compelling meta description (150-160 characters)",
      impact: "Improves click-through rates from search results",
    })
    score -= 20
  } else if (pageData.metaDescription.length > 160) {
    issues.push({
      severity: "medium",
      type: "long_meta_description",
      message: `Meta description is ${pageData.metaDescription.length} characters (recommended: 150-160)`,
      length: pageData.metaDescription.length,
    })
    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Shorten meta description to 150-160 characters",
      impact: "Prevents description truncation in search results",
    })
    score -= 5
  }

  // Check for H1 tag
  const h1Match = pageData.htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (!h1Match) {
    issues.push({
      severity: "high",
      type: "missing_h1",
      message: "Page is missing an H1 heading",
      location: pageData.url,
    })
    recommendations.push({
      type: "seo",
      priority: "high",
      message: "Add a descriptive H1 heading that includes target keywords",
      impact: "Important ranking factor and improves content structure",
    })
    score -= 15
  }

  // Check for multiple H1 tags
  const h1Matches = pageData.htmlContent.match(/<h1[^>]*>.*?<\/h1>/gi) || []
  if (h1Matches.length > 1) {
    issues.push({
      severity: "medium",
      type: "multiple_h1",
      message: `Page has ${h1Matches.length} H1 tags (recommended: 1)`,
      count: h1Matches.length,
    })
    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Use only one H1 tag per page for better SEO structure",
      impact: "Improves content hierarchy and search engine understanding",
    })
    score -= 10
  }

  // Check for images without alt text
  const imagesWithoutAlt = pageData.images.filter((img: string) => {
    const imgTag = pageData.htmlContent.match(
      new RegExp(`<img[^>]*src=["']${img.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i"),
    )
    return imgTag && !imgTag[0].includes("alt=")
  })

  if (imagesWithoutAlt.length > 0) {
    issues.push({
      severity: "medium",
      type: "images_missing_alt",
      message: `${imagesWithoutAlt.length} images missing alt text`,
      count: imagesWithoutAlt.length,
    })
    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Add descriptive alt text to all images for better SEO",
      impact: "Improves image search rankings and accessibility",
    })
    score -= 10
  }

  // Check content length
  const wordCount = pageData.contentText.split(/\s+/).length
  if (wordCount < 300) {
    issues.push({
      severity: "medium",
      type: "thin_content",
      message: `Page has only ${wordCount} words (recommended: 300+)`,
      wordCount,
    })
    recommendations.push({
      type: "seo",
      priority: "medium",
      message: "Add more valuable content to improve search rankings",
      impact: "Search engines favor pages with substantial, quality content",
    })
    score -= 15
  }

  // Check for internal links
  const internalLinks = pageData.links.filter(
    (link: string) => link.startsWith("/") || link.includes(new URL(pageData.url).hostname),
  )

  if (internalLinks.length < 3) {
    issues.push({
      severity: "low",
      type: "few_internal_links",
      message: `Only ${internalLinks.length} internal links found`,
      count: internalLinks.length,
    })
    recommendations.push({
      type: "seo",
      priority: "low",
      message: "Add more internal links to improve site structure and user navigation",
      impact: "Helps search engines understand site structure and distributes page authority",
    })
    score -= 5
  }

  const status = score >= 80 ? "passed" : score >= 60 ? "warning" : "failed"

  return {
    type: "seo",
    status,
    score: Math.max(0, score),
    issues,
    recommendations,
  }
}
