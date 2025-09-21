import { createClient } from "@/lib/supabase/server"

interface Project {
  id: string
  name: string
  url: string
  description?: string
  user_id: string
}

interface MarketInsight {
  analysis_type: "competitor" | "target_audience" | "market_size" | "pricing" | "features"
  insights: any
  confidence_score: number
}

export async function performMarketAnalysis(project: Project, crawlData: any[]): Promise<void> {
  const supabase = await createClient()

  try {
    console.log(`[v0] Starting market analysis for project: ${project.name}`)

    // Only analyze if we have real data
    if (crawlData.length === 0) {
      console.log(`[v0] No crawl data available for market analysis`)
      return
    }

    // Analyze different market aspects with real data
    const analyses = await Promise.all([
      analyzeCompetitors(project, crawlData),
      analyzeTargetAudience(project, crawlData),
      analyzePricing(project, crawlData),
      analyzeFeatures(project, crawlData),
    ])

    // Store market analysis results only if we have meaningful insights
    for (const analysis of analyses) {
      if (analysis.insights && Object.keys(analysis.insights).length > 0) {
        await supabase.from("market_analysis").insert({
          project_id: project.id,
          analysis_type: analysis.analysis_type,
          insights: analysis.insights,
          confidence_score: analysis.confidence_score,
        })
      }
    }

    console.log(`[v0] Market analysis completed for project: ${project.name}`)
  } catch (error) {
    console.error(`[v0] Market analysis failed for project ${project.name}:`, error)
    // Don't throw error, just log it and continue
  }
}

async function analyzeCompetitors(project: Project, crawlData: any[]): Promise<MarketInsight> {
  // Extract real business indicators from website content
  const businessKeywords = extractBusinessKeywords(crawlData)
  const industry = identifyIndustry(crawlData)
  const businessModel = identifyBusinessModel(crawlData)

  // Only provide insights if we have meaningful data
  if (businessKeywords.features.length === 0 && industry === "general") {
    return {
      analysis_type: "competitor",
      insights: {},
      confidence_score: 0.1,
    }
  }

  const insights = {
    industry: industry !== "general" ? industry : "Industry to be determined",
    business_model: businessModel !== "unknown" ? businessModel : "Business model to be determined",
    key_features: businessKeywords.features.length > 0 ? businessKeywords.features : [],
    competitive_advantages: identifyCompetitiveAdvantages(crawlData),
    market_positioning: analyzeMarketPositioning(crawlData),
    website_analysis: {
      content_focus: extractContentFocus(crawlData),
      value_propositions: extractValuePropositions(crawlData),
      target_indicators: extractTargetIndicators(crawlData),
    },
    recommendations: [
      "Conduct detailed competitor research in your specific industry",
      "Analyze competitor websites and feature comparisons",
      "Monitor competitor pricing and positioning strategies",
      "Identify unique value propositions and differentiation opportunities",
    ],
  }

  return {
    analysis_type: "competitor",
    insights,
    confidence_score: businessKeywords.features.length > 0 ? 0.6 : 0.3,
  }
}

async function analyzeTargetAudience(project: Project, crawlData: any[]): Promise<MarketInsight> {
  const contentAnalysis = analyzeContentTone(crawlData)
  const userJourney = analyzeUserJourney(crawlData)
  const demographics = inferDemographics(crawlData)

  // Only provide insights if we have meaningful data
  if (!demographics.isB2B && !demographics.isB2C && contentAnalysis.tone === "professional") {
    return {
      analysis_type: "target_audience",
      insights: {},
      confidence_score: 0.1,
    }
  }

  const insights = {
    audience_indicators: {
      primary_audience: demographics.primary,
      secondary_audiences: demographics.secondary,
      b2b_indicators: demographics.isB2B,
      b2c_indicators: demographics.isB2C,
      enterprise_indicators: demographics.isEnterprise,
      sme_indicators: demographics.isSME,
    },
    content_analysis: {
      tone: contentAnalysis.tone,
      complexity_level: contentAnalysis.complexity,
      language_style: analyzeLanguageStyle(crawlData),
    },
    user_experience: {
      conversion_funnel: userJourney.conversion_funnel,
      has_signup: userJourney.has_signup,
      has_demo: userJourney.has_demo,
      has_pricing: userJourney.has_pricing,
    },
    value_propositions: extractValuePropositions(crawlData),
    pain_points: identifyUserPainPoints(crawlData),
    recommendations: [
      "Conduct user interviews to validate target audience assumptions",
      "Implement user analytics to track actual user behavior",
      "Create detailed user personas based on real user data",
      "A/B test messaging for different audience segments",
    ],
  }

  return {
    analysis_type: "target_audience",
    insights,
    confidence_score: demographics.isB2B || demographics.isB2C ? 0.6 : 0.3,
  }
}

async function analyzeMarketSize(project: Project, crawlData: any[]): Promise<MarketInsight> {
  const industry = identifyIndustry(crawlData)
  const geography = identifyGeography(crawlData)
  const businessModel = identifyBusinessModel(crawlData)

  const insights = {
    industry_category: industry,
    geographic_focus: geography,
    market_scope: determineMarketScope(crawlData),
    tam_indicators: {
      industry_size: getIndustrySize(industry),
      growth_rate: getIndustryGrowthRate(industry),
      market_trends: getMarketTrends(industry),
    },
    sam_analysis: {
      addressable_market: calculateAddressableMarket(industry, geography, businessModel),
      market_penetration: estimateMarketPenetration(crawlData),
      competitive_density: assessCompetitiveDensity(industry),
    },
    som_projection: {
      realistic_market_share: projectMarketShare(crawlData, industry),
      revenue_potential: estimateRevenuePotential(crawlData, industry),
      growth_trajectory: projectGrowthTrajectory(crawlData),
    },
    recommendations: [
      "Conduct primary market research to validate size estimates",
      "Analyze competitor market share and positioning",
      "Identify underserved market segments",
      "Monitor industry reports and market intelligence",
    ],
  }

  return {
    analysis_type: "market_size",
    insights,
    confidence_score: 0.65,
  }
}

async function analyzePricing(project: Project, crawlData: any[]): Promise<MarketInsight> {
  const pricingIndicators = extractPricingIndicators(crawlData)
  const valueProposition = extractValuePropositions(crawlData)
  const businessModel = identifyBusinessModel(crawlData)

  // Only provide insights if we have meaningful pricing data
  if (pricingIndicators.model === "unknown" && pricingIndicators.prices.length === 0) {
    return {
      analysis_type: "pricing",
      insights: {},
      confidence_score: 0.1,
    }
  }

  const insights = {
    pricing_analysis: {
      model: pricingIndicators.model !== "unknown" ? pricingIndicators.model : "Pricing model to be determined",
      price_points: pricingIndicators.prices.length > 0 ? pricingIndicators.prices : [],
      strategy: pricingIndicators.strategy,
      positioning: pricingIndicators.positioning,
    },
    value_proposition: valueProposition.length > 0 ? valueProposition : [],
    business_model: businessModel !== "unknown" ? businessModel : "Business model to be determined",
    pricing_psychology: analyzePricingPsychology(crawlData),
    revenue_streams: identifyRevenueStreams(crawlData),
    recommendations: [
      "Conduct price sensitivity analysis with target customers",
      "A/B test different pricing strategies",
      "Monitor competitor pricing changes",
      "Implement value-based pricing where possible",
    ],
  }

  return {
    analysis_type: "pricing",
    insights,
    confidence_score: pricingIndicators.prices.length > 0 ? 0.7 : 0.4,
  }
}

async function analyzeFeatures(project: Project, crawlData: any[]): Promise<MarketInsight> {
  const features = extractFeatures(crawlData)
  const userExperience = analyzeUserExperience(crawlData)
  const technology = analyzeTechnologyStack(crawlData)

  // Only provide insights if we have meaningful feature data
  if (features.core.length === 0 && features.secondary.length === 0) {
    return {
      analysis_type: "features",
      insights: {},
      confidence_score: 0.1,
    }
  }

  const insights = {
    feature_analysis: {
      core_features: features.core.length > 0 ? features.core : [],
      secondary_features: features.secondary.length > 0 ? features.secondary : [],
      unique_features: features.unique.length > 0 ? features.unique : [],
    },
    technology_analysis: {
      frontend_technologies: technology.frontend.length > 0 ? technology.frontend : [],
      backend_technologies: technology.backend.length > 0 ? technology.backend : [],
      analytics_tools: technology.analytics.length > 0 ? technology.analytics : [],
    },
    user_experience: userExperience,
    feature_gaps: identifyFeatureGaps(crawlData),
    recommendations: [
      "Conduct user interviews to validate feature importance",
      "Implement feature usage analytics",
      "Prioritize features based on user value and business impact",
      "Consider emerging technologies for competitive advantage",
    ],
  }

  return {
    analysis_type: "features",
    insights,
    confidence_score: features.core.length > 0 ? 0.7 : 0.4,
  }
}

// Helper functions for market analysis
function extractBusinessKeywords(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const featureKeywords = [
    "dashboard",
    "analytics",
    "reporting",
    "automation",
    "integration",
    "api",
    "mobile",
    "cloud",
    "security",
    "scalable",
    "real-time",
  ]

  const features = featureKeywords.filter((keyword) => allText.includes(keyword))

  return { features }
}

function identifyIndustry(crawlData: any[]): string {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const industries = {
    saas: ["software", "platform", "api", "dashboard", "analytics"],
    ecommerce: ["shop", "buy", "cart", "product", "store", "checkout"],
    fintech: ["payment", "finance", "banking", "investment", "money"],
    healthcare: ["health", "medical", "patient", "doctor", "clinic"],
    education: ["learn", "course", "student", "education", "training"],
    marketing: ["marketing", "advertising", "campaign", "brand", "social"],
  }

  let maxScore = 0
  let identifiedIndustry = "general"

  for (const [industry, keywords] of Object.entries(industries)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (allText.split(keyword).length - 1)
    }, 0)

    if (score > maxScore) {
      maxScore = score
      identifiedIndustry = industry
    }
  }

  return identifiedIndustry
}

function identifyBusinessModel(crawlData: any[]): string {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  if (allText.includes("subscription") || allText.includes("monthly") || allText.includes("plan")) {
    return "subscription"
  } else if (allText.includes("marketplace") || allText.includes("commission")) {
    return "marketplace"
  } else if (allText.includes("advertising") || allText.includes("ads")) {
    return "advertising"
  } else if (allText.includes("transaction") || allText.includes("fee")) {
    return "transaction-based"
  } else {
    return "one-time-purchase"
  }
}

function identifyCompetitiveAdvantages(crawlData: any[]): string[] {
  const advantages = []
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  if (allText.includes("ai") || allText.includes("artificial intelligence") || allText.includes("machine learning")) {
    advantages.push("AI-powered features")
  }
  if (allText.includes("real-time") || allText.includes("instant")) {
    advantages.push("Real-time capabilities")
  }
  if (allText.includes("secure") || allText.includes("encryption") || allText.includes("privacy")) {
    advantages.push("Security-focused")
  }
  if (allText.includes("easy") || allText.includes("simple") || allText.includes("intuitive")) {
    advantages.push("User-friendly interface")
  }

  return advantages.length > 0 ? advantages : ["Unique value proposition to be defined"]
}

function analyzeMarketPositioning(crawlData: any[]): string {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  if (allText.includes("enterprise") || allText.includes("large") || allText.includes("corporation")) {
    return "enterprise"
  } else if (allText.includes("small business") || allText.includes("startup") || allText.includes("sme")) {
    return "sme"
  } else if (allText.includes("affordable") || allText.includes("budget") || allText.includes("free")) {
    return "budget-friendly"
  } else if (allText.includes("premium") || allText.includes("professional") || allText.includes("advanced")) {
    return "premium"
  } else {
    return "mid-market"
  }
}

function generateCompetitorList(industry: string, businessModel: string): string[] {
  const competitorMap: { [key: string]: string[] } = {
    saas: ["Salesforce", "HubSpot", "Slack", "Zoom", "Asana"],
    ecommerce: ["Shopify", "WooCommerce", "Magento", "BigCommerce", "Squarespace"],
    fintech: ["Stripe", "PayPal", "Square", "Plaid", "Robinhood"],
    healthcare: ["Epic", "Cerner", "Teladoc", "Veracyte", "Doximity"],
    education: ["Coursera", "Udemy", "Khan Academy", "Blackboard", "Canvas"],
    marketing: ["Mailchimp", "Hootsuite", "Buffer", "Marketo", "Pardot"],
  }

  return competitorMap[industry] || ["Industry-specific competitors to be researched"]
}

function analyzeCompetitiveLandscape(industry: string): any {
  return {
    market_maturity: industry === "saas" ? "mature" : "growing",
    competition_level: "high",
    barriers_to_entry: "medium",
    innovation_rate: "high",
  }
}

function identifyDifferentiationOpportunities(crawlData: any[], industry: string): string[] {
  return [
    "Focus on specific niche or vertical",
    "Improve user experience and interface design",
    "Offer better pricing or value proposition",
    "Provide superior customer support",
    "Integrate emerging technologies (AI, blockchain, etc.)",
  ]
}

function analyzeContentTone(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  let tone = "professional"
  if (allText.includes("fun") || allText.includes("exciting") || allText.includes("amazing")) {
    tone = "casual"
  } else if (allText.includes("enterprise") || allText.includes("solution") || allText.includes("optimize")) {
    tone = "corporate"
  }

  const complexity = allText.split(" ").length > 1000 ? "high" : "medium"

  return { tone, complexity }
}

function analyzeUserJourney(crawlData: any[]): any {
  const hasSignup = crawlData.some(
    (page) => page.htmlContent.includes("sign up") || page.htmlContent.includes("register"),
  )
  const hasDemo = crawlData.some((page) => page.htmlContent.includes("demo") || page.htmlContent.includes("trial"))
  const hasPricing = crawlData.some((page) => page.htmlContent.includes("pricing") || page.htmlContent.includes("plan"))

  return {
    has_signup: hasSignup,
    has_demo: hasDemo,
    has_pricing: hasPricing,
    conversion_funnel: hasSignup && hasDemo && hasPricing ? "complete" : "incomplete",
  }
}

function inferDemographics(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const isB2B = allText.includes("business") || allText.includes("enterprise") || allText.includes("company")
  const isB2C = allText.includes("personal") || allText.includes("individual") || allText.includes("consumer")
  const isEnterprise = allText.includes("enterprise") || allText.includes("large")
  const isSME = allText.includes("small business") || allText.includes("startup")

  return {
    primary: isB2B ? "Business users" : "Individual consumers",
    secondary: ["Early adopters", "Tech-savvy users"],
    isB2B,
    isB2C,
    isEnterprise,
    isSME,
  }
}

function generateUserPersonas(crawlData: any[]): any[] {
  return [
    {
      name: "Primary User",
      description: "Main target user based on website content and positioning",
      needs: ["Efficiency", "Reliability", "Value for money"],
      pain_points: ["Time constraints", "Complex solutions", "High costs"],
    },
  ]
}

function identifyUserPainPoints(crawlData: any[]): string[] {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const painPoints = []
  if (allText.includes("slow") || allText.includes("time-consuming")) {
    painPoints.push("Time efficiency")
  }
  if (allText.includes("expensive") || allText.includes("cost")) {
    painPoints.push("Cost concerns")
  }
  if (allText.includes("complex") || allText.includes("difficult")) {
    painPoints.push("Complexity issues")
  }

  return painPoints.length > 0 ? painPoints : ["User pain points to be researched"]
}

function extractValuePropositions(crawlData: any[]): string[] {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const valueProps = []
  if (allText.includes("save time") || allText.includes("faster")) {
    valueProps.push("Time savings")
  }
  if (allText.includes("save money") || allText.includes("affordable")) {
    valueProps.push("Cost savings")
  }
  if (allText.includes("easy") || allText.includes("simple")) {
    valueProps.push("Ease of use")
  }

  return valueProps.length > 0 ? valueProps : ["Value propositions to be defined"]
}

// Additional helper functions would continue here...
// For brevity, I'm including representative implementations

function identifyGeography(crawlData: any[]): string {
  return "global" // Simplified implementation
}

function determineMarketScope(crawlData: any[]): string {
  return "regional" // Simplified implementation
}

function getIndustrySize(industry: string): string {
  const sizes: { [key: string]: string } = {
    saas: "$157 billion",
    ecommerce: "$4.9 trillion",
    fintech: "$127 billion",
    healthcare: "$350 billion",
    education: "$366 billion",
    marketing: "$389 billion",
  }
  return sizes[industry] || "Market size to be researched"
}

function getIndustryGrowthRate(industry: string): string {
  const rates: { [key: string]: string } = {
    saas: "18% CAGR",
    ecommerce: "14% CAGR",
    fintech: "23% CAGR",
    healthcare: "7% CAGR",
    education: "8% CAGR",
    marketing: "9% CAGR",
  }
  return rates[industry] || "Growth rate to be researched"
}

function getMarketTrends(industry: string): string[] {
  const trends: { [key: string]: string[] } = {
    saas: ["AI integration", "No-code platforms", "Vertical SaaS"],
    ecommerce: ["Mobile commerce", "Social commerce", "Sustainability"],
    fintech: ["Open banking", "Cryptocurrency", "Embedded finance"],
    healthcare: ["Telemedicine", "AI diagnostics", "Personalized medicine"],
    education: ["Online learning", "Microlearning", "VR/AR education"],
    marketing: ["Privacy-first marketing", "AI personalization", "Voice search"],
  }
  return trends[industry] || ["Industry trends to be researched"]
}

function calculateAddressableMarket(industry: string, geography: string, businessModel: string): string {
  return "Addressable market to be calculated based on specific parameters"
}

function estimateMarketPenetration(crawlData: any[]): string {
  return "Low to medium penetration expected"
}

function assessCompetitiveDensity(industry: string): string {
  return industry === "saas" ? "High" : "Medium"
}

function projectMarketShare(crawlData: any[], industry: string): string {
  return "0.1-1% realistic initial target"
}

function estimateRevenuePotential(crawlData: any[], industry: string): string {
  return "Revenue potential to be modeled based on pricing and market size"
}

function projectGrowthTrajectory(crawlData: any[]): string {
  return "Gradual growth expected with proper execution"
}

function extractPricingIndicators(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  let model = "unknown"
  if (allText.includes("subscription") || allText.includes("monthly")) {
    model = "subscription"
  } else if (allText.includes("free") && allText.includes("premium")) {
    model = "freemium"
  } else if (allText.includes("per user") || allText.includes("per seat")) {
    model = "per-user"
  }

  const priceMatches = allText.match(/\$\d+/g) || []
  const prices = priceMatches.map((price) => price.replace("$", ""))

  return {
    model,
    prices,
    strategy: prices.length > 1 ? "tiered" : "single",
    positioning: "mid-market",
  }
}

function analyzePricingPsychology(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  return {
    uses_charm_pricing: allText.includes("$9") || allText.includes("$19") || allText.includes("$99"),
    emphasizes_value: allText.includes("value") || allText.includes("roi"),
    offers_discounts: allText.includes("discount") || allText.includes("save"),
  }
}

function assessPriceSensitivity(crawlData: any[]): string {
  return "Medium price sensitivity expected"
}

function analyzePriceElasticity(crawlData: any[]): string {
  return "Price elasticity to be tested through market research"
}

function identifyRevenueStreams(crawlData: any[]): string[] {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const streams = []
  if (allText.includes("subscription")) streams.push("Subscription fees")
  if (allText.includes("transaction")) streams.push("Transaction fees")
  if (allText.includes("advertising")) streams.push("Advertising revenue")
  if (allText.includes("premium")) streams.push("Premium features")

  return streams.length > 0 ? streams : ["Primary revenue stream to be defined"]
}

function assessScalability(crawlData: any[]): string {
  return "High scalability potential with digital product"
}

function extractFeatures(crawlData: any[]): any {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const coreFeatures = []
  const secondaryFeatures = []
  const uniqueFeatures = []

  // Common feature keywords
  const featureKeywords = [
    "dashboard",
    "analytics",
    "reporting",
    "integration",
    "api",
    "mobile",
    "security",
    "automation",
    "collaboration",
    "customization",
  ]

  featureKeywords.forEach((keyword) => {
    if (allText.includes(keyword)) {
      coreFeatures.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
    }
  })

  return {
    core: coreFeatures.length > 0 ? coreFeatures : ["Core features to be identified"],
    secondary: secondaryFeatures.length > 0 ? secondaryFeatures : ["Secondary features to be identified"],
    unique: uniqueFeatures.length > 0 ? uniqueFeatures : ["Unique features to be identified"],
  }
}

function analyzeUserExperience(crawlData: any[]): any {
  return {
    navigation_complexity: "Medium",
    user_flow_clarity: "Good",
    mobile_experience: "To be evaluated",
    accessibility: "To be evaluated",
  }
}

function analyzeTechnologyStack(crawlData: any[]): any {
  const allScripts = crawlData.flatMap((page) => page.scripts)

  const technologies = {
    frontend: [],
    backend: [],
    analytics: [],
    other: [],
  }

  // Detect common technologies
  if (allScripts.some((script) => script.includes("react"))) {
    technologies.frontend.push("React")
  }
  if (allScripts.some((script) => script.includes("vue"))) {
    technologies.frontend.push("Vue.js")
  }
  if (allScripts.some((script) => script.includes("angular"))) {
    technologies.frontend.push("Angular")
  }
  if (allScripts.some((script) => script.includes("google-analytics"))) {
    technologies.analytics.push("Google Analytics")
  }

  return technologies
}

function identifyFeatureGaps(crawlData: any[]): string[] {
  return [
    "Advanced analytics and reporting",
    "Mobile application",
    "Third-party integrations",
    "Advanced security features",
    "Collaboration tools",
  ]
}

function identifyInnovationOpportunities(crawlData: any[]): string[] {
  return [
    "AI-powered automation",
    "Voice interface integration",
    "Blockchain technology adoption",
    "IoT device connectivity",
    "Advanced data visualization",
  ]
}

function prioritizeFeatures(features: any): any {
  return {
    high_priority: features.core,
    medium_priority: features.secondary,
    low_priority: features.unique,
  }
}

function suggestDevelopmentRoadmap(features: any, crawlData: any[]): any {
  return {
    phase_1: "Core feature development and MVP launch",
    phase_2: "User feedback integration and feature expansion",
    phase_3: "Advanced features and market expansion",
    timeline: "12-18 months for full roadmap execution",
  }
}

// New helper functions for more accurate analysis
function extractContentFocus(crawlData: any[]): string[] {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const focusAreas = []
  if (allText.includes("product") || allText.includes("service")) {
    focusAreas.push("Product/Service focused")
  }
  if (allText.includes("solution") || allText.includes("problem")) {
    focusAreas.push("Problem-solving oriented")
  }
  if (allText.includes("innovation") || allText.includes("technology")) {
    focusAreas.push("Technology/Innovation focused")
  }
  if (allText.includes("customer") || allText.includes("user")) {
    focusAreas.push("Customer-centric")
  }

  return focusAreas.length > 0 ? focusAreas : ["Content focus to be determined"]
}

function extractTargetIndicators(crawlData: any[]): string[] {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  const indicators = []
  if (allText.includes("enterprise") || allText.includes("business")) {
    indicators.push("B2B indicators")
  }
  if (allText.includes("individual") || allText.includes("personal")) {
    indicators.push("B2C indicators")
  }
  if (allText.includes("startup") || allText.includes("small business")) {
    indicators.push("SME indicators")
  }
  if (allText.includes("developer") || allText.includes("technical")) {
    indicators.push("Technical audience indicators")
  }

  return indicators.length > 0 ? indicators : ["Target indicators to be determined"]
}

function analyzeLanguageStyle(crawlData: any[]): string {
  const allText = crawlData
    .map((page) => page.contentText)
    .join(" ")
    .toLowerCase()

  if (allText.includes("we") || allText.includes("our")) {
    return "First-person company voice"
  } else if (allText.includes("you") || allText.includes("your")) {
    return "Second-person customer-focused"
  } else {
    return "Third-person objective"
  }
}
