import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const supabase = await createClient()

    // Get user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Get all related data
    const [testResults, marketAnalysis, crawlData, qaSessions] = await Promise.all([
      supabase.from("test_results").select("*").eq("project_id", projectId),
      supabase.from("market_analysis").select("*").eq("project_id", projectId),
      supabase.from("crawl_data").select("*").eq("project_id", projectId),
      supabase.from("qa_sessions").select("*").eq("project_id", projectId),
    ])

    // Calculate overall score
    const scores = testResults.data?.map((result) => result.score).filter(Boolean) || []
    const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    // Count issues by severity
    const criticalIssues = testResults.data?.filter((result) => 
      result.issues?.some((issue: any) => issue.severity === 'critical')
    ).length || 0

    const warningIssues = testResults.data?.filter((result) => 
      result.issues?.some((issue: any) => issue.severity === 'warning')
    ).length || 0

    // Prepare report data
    const reportData = {
      project: {
        id: project.id,
        name: project.name,
        url: project.url,
        description: project.description,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      summary: {
        overallScore,
        pagesAnalyzed: crawlData.data?.length || 0,
        totalIssues: testResults.data?.length || 0,
        criticalIssues,
        warningIssues,
        lastAnalyzed: project.updated_at,
      },
      testResults: testResults.data || [],
      marketAnalysis: marketAnalysis.data || [],
      crawlData: crawlData.data || [],
      qaSessions: qaSessions.data || [],
    }

    // Generate PDF content (simplified version)
    const pdfContent = generatePDFContent(reportData)

    // Return HTML report as response
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${project.name}-report.html"`,
      },
    })
  } catch (error) {
    console.error("Export API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generatePDFContent(data: any): Buffer {
  // Generate comprehensive HTML content for the report
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.project.name} - Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { color: #2c3e50; margin: 0; font-size: 28px; }
        .header p { color: #7f8c8d; margin: 5px 0; }
        .section { margin: 25px 0; }
        .section h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 10px; }
        .section h3 { color: #2c3e50; margin-top: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-card h4 { margin: 0 0 10px 0; color: #2c3e50; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #e74c3c; }
        .issues-list { margin: 15px 0; }
        .issue-item { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .critical { background: #f8d7da; border-color: #f5c6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .test-result { margin: 15px 0; padding: 15px; border: 1px solid #dee2e6; border-radius: 8px; }
        .test-result h4 { margin: 0 0 10px 0; color: #495057; }
        .score { font-size: 18px; font-weight: bold; }
        .score.good { color: #28a745; }
        .score.warning { color: #ffc107; }
        .score.critical { color: #dc3545; }
        .market-insight { background: #e8f4fd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3498db; }
        .qa-session { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .qa-question { font-weight: bold; color: #2c3e50; }
        .qa-answer { color: #7f8c8d; margin-top: 5px; }
        .footer { margin-top: 40px; text-align: center; color: #7f8c8d; border-top: 1px solid #bdc3c7; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.project.name} - Analysis Report</h1>
        <p>Website: ${data.project.url}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>📊 Executive Summary</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <h4>Overall Score</h4>
                <div class="value">${data.summary.overallScore}/100</div>
            </div>
            <div class="summary-card">
                <h4>Pages Analyzed</h4>
                <div class="value">${data.summary.pagesAnalyzed}</div>
            </div>
            <div class="summary-card">
                <h4>Total Issues</h4>
                <div class="value">${data.summary.totalIssues}</div>
            </div>
            <div class="summary-card">
                <h4>Critical Issues</h4>
                <div class="value" style="color: #dc3545;">${data.summary.criticalIssues}</div>
            </div>
            <div class="summary-card">
                <h4>Warning Issues</h4>
                <div class="value" style="color: #ffc107;">${data.summary.warningIssues}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🔍 Test Results Analysis</h2>
        ${data.testResults.map((result: any) => `
            <div class="test-result">
                <h4>${result.test_type.charAt(0).toUpperCase() + result.test_type.slice(1).replace('_', ' ')} Test</h4>
                <p><strong>Page:</strong> ${result.page_url}</p>
                <p><strong>Status:</strong> ${result.status}</p>
                <p><strong>Score:</strong> <span class="score ${result.score >= 80 ? 'good' : result.score >= 60 ? 'warning' : 'critical'}">${result.score || 'N/A'}/100</span></p>
                ${result.issues && result.issues.length > 0 ? `
                    <h5>Issues Found:</h5>
                    <div class="issues-list">
                        ${result.issues.map((issue: any) => `
                            <div class="issue-item ${issue.severity === 'critical' ? 'critical' : 'warning'}">
                                <strong>${issue.title || 'Issue'}</strong>
                                ${issue.description ? `<br>${issue.description}` : ''}
                                ${issue.severity ? `<br><em>Severity: ${issue.severity}</em>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${result.recommendations && result.recommendations.length > 0 ? `
                    <h5>Recommendations:</h5>
                    <ul>
                        ${result.recommendations.map((rec: any) => `<li>${rec}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📈 Market Analysis & Insights</h2>
        ${data.marketAnalysis.map((analysis: any) => `
            <div class="market-insight">
                <h3>${analysis.analysis_type.charAt(0).toUpperCase() + analysis.analysis_type.slice(1).replace('_', ' ')} Analysis</h3>
                <p><strong>Confidence Score:</strong> ${Math.round((analysis.confidence_score || 0) * 100)}%</p>
                <div>
                    ${typeof analysis.insights === 'string' ? analysis.insights : JSON.stringify(analysis.insights, null, 2)}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>🤖 AI Q&A Sessions</h2>
        ${data.qaSessions.map((session: any) => `
            <div class="qa-session">
                <div class="qa-question">Q: ${session.question}</div>
                <div class="qa-answer">A: ${session.answer}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>📄 Crawled Pages</h2>
        ${data.crawlData.map((page: any) => `
            <div style="margin: 15px 0; padding: 15px; border: 1px solid #dee2e6; border-radius: 8px;">
                <h4>${page.title || 'Untitled Page'}</h4>
                <p><strong>URL:</strong> ${page.page_url}</p>
                ${page.meta_description ? `<p><strong>Description:</strong> ${page.meta_description}</p>` : ''}
                ${page.content_text ? `<p><strong>Content Preview:</strong> ${page.content_text.substring(0, 200)}...</p>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Report generated by Blackbox Testing Platform</p>
        <p>For more information, visit your project dashboard</p>
    </div>
</body>
</html>
  `

  // Convert HTML to PDF using a simple approach
  // In production, you'd use puppeteer or similar
  return Buffer.from(htmlContent, 'utf-8')
}
