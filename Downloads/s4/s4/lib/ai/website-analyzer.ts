import { createClient } from "@/lib/supabase/server"
import { crawlWebsite } from "./web-crawler"
import { performSecurityTests } from "./security-tester"
import { performAccessibilityTests } from "./accessibility-tester"
import { performPerformanceTests } from "./performance-tester"
import { performSEOTests } from "./seo-tester"
import { performUIUXTests } from "./ui-ux-tester"
import { performMarketAnalysis } from "./market-analyzer"

interface Project {
  id: string
  name: string
  url: string
  description?: string
  user_id: string
}

export async function analyzeWebsite(project: Project) {
  const supabase = await createClient()

  try {
    console.log(`[v0] Starting analysis for project: ${project.name}`)

    // Step 1: Crawl the website to gather data
    console.log(`[v0] Crawling website: ${project.url}`)

    let crawlData: any[] = []
    try {
      crawlData = await crawlWebsite(project.url)
      console.log(`[v0] Successfully crawled ${crawlData.length} pages`)
    } catch (crawlError) {
      console.error(`[v0] Crawling failed:`, crawlError)

      // Update project with more specific error
      await supabase
        .from("projects")
        .update({
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("id", project.id)

      throw new Error(`Unable to access website: ${crawlError.message}`)
    }

    if (crawlData.length === 0) {
      throw new Error("Failed to crawl any pages from the website. Please check if the URL is correct and accessible.")
    }

    // Store crawl data
    console.log(`[v0] Storing crawl data for ${crawlData.length} pages`)
    for (const pageData of crawlData) {
      await supabase.from("crawl_data").insert({
        project_id: project.id,
        page_url: pageData.url,
        title: pageData.title,
        meta_description: pageData.metaDescription,
        content_text: pageData.contentText,
        html_content: pageData.htmlContent,
        images: pageData.images,
        links: pageData.links,
        forms: pageData.forms,
        scripts: pageData.scripts,
        stylesheets: pageData.stylesheets,
      })
    }

    // Step 2: Run different types of tests
    console.log(`[v0] Running tests for ${crawlData.length} pages`)
    const testPromises = crawlData.map(async (pageData) => {
      try {
        console.log(`[v0] Running tests for page: ${pageData.url}`)

        const tests = [
          performSecurityTests(pageData).catch(err => {
            console.error(`[v0] Security test failed for ${pageData.url}:`, err)
            return null
          }),
          performAccessibilityTests(pageData).catch(err => {
            console.error(`[v0] Accessibility test failed for ${pageData.url}:`, err)
            return null
          }),
          performPerformanceTests(pageData).catch(err => {
            console.error(`[v0] Performance test failed for ${pageData.url}:`, err)
            return null
          }),
          performSEOTests(pageData).catch(err => {
            console.error(`[v0] SEO test failed for ${pageData.url}:`, err)
            return null
          }),
          performUIUXTests(pageData).catch(err => {
            console.error(`[v0] UI/UX test failed for ${pageData.url}:`, err)
            return null
          }),
        ]

        const results = await Promise.allSettled(tests)

        // Store test results (only successful ones)
        for (const result of results) {
          if (result.status === "fulfilled" && result.value) {
            try {
              await supabase.from("test_results").insert({
                project_id: project.id,
                test_type: result.value.type,
                page_url: pageData.url,
                status: result.value.status,
                score: result.value.score,
                issues: result.value.issues,
                recommendations: result.value.recommendations,
              })
              console.log(`[v0] Stored ${result.value.type} test results for ${pageData.url}`)
            } catch (dbError) {
              console.error(`[v0] Failed to store test result:`, dbError)
            }
          } else if (result.status === "rejected") {
            console.error(`[v0] Test failed for ${pageData.url}:`, result.reason)
          }
        }
      } catch (error) {
        console.error(`[v0] Error running tests for ${pageData.url}:`, error)
      }
    })

    await Promise.allSettled(testPromises)
    console.log(`[v0] All tests completed for project: ${project.name}`)

    console.log(`[v0] Performing market analysis for project: ${project.name}`)
    try {
      await performMarketAnalysis(project, crawlData)
      console.log(`[v0] Market analysis completed for project: ${project.name}`)
    } catch (error) {
      console.error(`[v0] Market analysis failed:`, error)
      // Continue even if market analysis fails
    }

    console.log(`[v0] Analysis completed successfully for project: ${project.name}`)
  } catch (error) {
    console.error(`[v0] Analysis failed for project ${project.name}:`, error)
    throw error
  }
}
