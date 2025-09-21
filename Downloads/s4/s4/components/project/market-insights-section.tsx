"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Target, Lightbulb, BarChart3, AlertTriangle } from "lucide-react"

interface MarketInsightsSectionProps {
  marketAnalysis: any[]
  project: any
}

export function MarketInsightsSection({ marketAnalysis, project }: MarketInsightsSectionProps) {
  if (marketAnalysis.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Market Analysis in Progress</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Our AI is analyzing your website's market positioning. Results will be available shortly.
          </p>
        </CardContent>
      </Card>
    )
  }

  const competitorAnalysis = marketAnalysis.find((a) => a.analysis_type === "competitor")
  const audienceAnalysis = marketAnalysis.find((a) => a.analysis_type === "target_audience")
  const pricingAnalysis = marketAnalysis.find((a) => a.analysis_type === "pricing")
  const featuresAnalysis = marketAnalysis.find((a) => a.analysis_type === "features")

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Overview
          </CardTitle>
          <CardDescription>High-level market positioning and competitive landscape analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {competitorAnalysis?.insights.industry || "Unknown"}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Industry</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {competitorAnalysis?.insights.business_model || "Unknown"}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Business Model</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {competitorAnalysis?.insights.market_positioning || "Unknown"}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Market Position</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {Math.round(
                  (marketAnalysis.reduce((sum, a) => sum + a.confidence_score, 0) / marketAnalysis.length) * 100,
                )}
                %
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Analysis */}
        {competitorAnalysis && competitorAnalysis.insights && Object.keys(competitorAnalysis.insights).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Competitive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitorAnalysis.insights.key_features && competitorAnalysis.insights.key_features.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {competitorAnalysis.insights.key_features
                      .slice(0, 5)
                      .map((feature: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {competitorAnalysis.insights.competitive_advantages && competitorAnalysis.insights.competitive_advantages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Competitive Advantages</h4>
                  <ul className="space-y-1">
                    {competitorAnalysis.insights.competitive_advantages
                      .slice(0, 3)
                      .map((advantage: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {advantage}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {competitorAnalysis.insights.website_analysis && (
                <div>
                  <h4 className="font-medium mb-2">Website Analysis</h4>
                  <div className="space-y-2">
                    {competitorAnalysis.insights.website_analysis.content_focus && (
                      <div>
                        <span className="text-sm font-medium">Content Focus: </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {competitorAnalysis.insights.website_analysis.content_focus.join(", ")}
                        </span>
                      </div>
                    )}
                    {competitorAnalysis.insights.website_analysis.value_propositions && competitorAnalysis.insights.website_analysis.value_propositions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Value Propositions: </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {competitorAnalysis.insights.website_analysis.value_propositions.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {competitorAnalysis.insights.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {competitorAnalysis.insights.recommendations
                      .slice(0, 3)
                      .map((recommendation: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          {recommendation}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Target Audience */}
        {audienceAnalysis && audienceAnalysis.insights && Object.keys(audienceAnalysis.insights).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audienceAnalysis.insights.audience_indicators && (
                <div>
                  <h4 className="font-medium mb-2">Audience Indicators</h4>
                  <div className="space-y-2">
                    {audienceAnalysis.insights.audience_indicators.primary_audience && (
                      <div>
                        <span className="text-sm font-medium">Primary: </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {audienceAnalysis.insights.audience_indicators.primary_audience}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {audienceAnalysis.insights.audience_indicators.b2b_indicators && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">B2B</span>
                        </div>
                      )}
                      {audienceAnalysis.insights.audience_indicators.b2c_indicators && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">B2C</span>
                        </div>
                      )}
                      {audienceAnalysis.insights.audience_indicators.enterprise_indicators && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">Enterprise</span>
                        </div>
                      )}
                      {audienceAnalysis.insights.audience_indicators.sme_indicators && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm">SME</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {audienceAnalysis.insights.content_analysis && (
                <div>
                  <h4 className="font-medium mb-2">Content Analysis</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Tone: </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {audienceAnalysis.insights.content_analysis.tone}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Language Style: </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {audienceAnalysis.insights.content_analysis.language_style}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {audienceAnalysis.insights.pain_points && audienceAnalysis.insights.pain_points.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Pain Points</h4>
                  <ul className="space-y-1">
                    {audienceAnalysis.insights.pain_points.slice(0, 3).map((pain: string, index: number) => (
                      <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {audienceAnalysis.insights.value_propositions && audienceAnalysis.insights.value_propositions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Value Propositions</h4>
                  <ul className="space-y-1">
                    {audienceAnalysis.insights.value_propositions.slice(0, 3).map((value: string, index: number) => (
                      <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Analysis */}
        {pricingAnalysis && pricingAnalysis.insights && Object.keys(pricingAnalysis.insights).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricingAnalysis.insights.pricing_analysis && (
                <div>
                  <h4 className="font-medium mb-2">Pricing Analysis</h4>
                  <div className="space-y-2">
                    {pricingAnalysis.insights.pricing_analysis.model && (
                      <div>
                        <span className="text-sm font-medium">Model: </span>
                        <Badge variant="outline" className="ml-2">
                          {pricingAnalysis.insights.pricing_analysis.model}
                        </Badge>
                      </div>
                    )}
                    {pricingAnalysis.insights.pricing_analysis.price_points && pricingAnalysis.insights.pricing_analysis.price_points.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Price Points: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {pricingAnalysis.insights.pricing_analysis.price_points.slice(0, 5).map((price: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              ${price}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pricingAnalysis.insights.business_model && (
                <div>
                  <h4 className="font-medium mb-2">Business Model</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {pricingAnalysis.insights.business_model}
                  </p>
                </div>
              )}

              {pricingAnalysis.insights.revenue_streams && pricingAnalysis.insights.revenue_streams.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Revenue Streams</h4>
                  <ul className="space-y-1">
                    {pricingAnalysis.insights.revenue_streams
                      .slice(0, 3)
                      .map((stream: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {stream}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {pricingAnalysis.insights.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {pricingAnalysis.insights.recommendations
                      .slice(0, 3)
                      .map((recommendation: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          {recommendation}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Features Analysis */}
      {featuresAnalysis && featuresAnalysis.insights && Object.keys(featuresAnalysis.insights).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Feature Analysis & Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuresAnalysis.insights.feature_analysis && (
                <div>
                  <h4 className="font-medium mb-3">Feature Analysis</h4>
                  <div className="space-y-3">
                    {featuresAnalysis.insights.feature_analysis.core_features && featuresAnalysis.insights.feature_analysis.core_features.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Core Features: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {featuresAnalysis.insights.feature_analysis.core_features.slice(0, 5).map((feature: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {featuresAnalysis.insights.feature_analysis.secondary_features && featuresAnalysis.insights.feature_analysis.secondary_features.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Secondary Features: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {featuresAnalysis.insights.feature_analysis.secondary_features.slice(0, 3).map((feature: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {featuresAnalysis.insights.technology_analysis && (
                <div>
                  <h4 className="font-medium mb-3">Technology Stack</h4>
                  <div className="space-y-2">
                    {featuresAnalysis.insights.technology_analysis.frontend_technologies && featuresAnalysis.insights.technology_analysis.frontend_technologies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Frontend: </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {featuresAnalysis.insights.technology_analysis.frontend_technologies.join(", ")}
                        </span>
                      </div>
                    )}
                    {featuresAnalysis.insights.technology_analysis.analytics_tools && featuresAnalysis.insights.technology_analysis.analytics_tools.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Analytics: </span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          {featuresAnalysis.insights.technology_analysis.analytics_tools.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {featuresAnalysis.insights.feature_gaps && featuresAnalysis.insights.feature_gaps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Feature Gaps</h4>
                  <div className="space-y-2">
                    {featuresAnalysis.insights.feature_gaps.slice(0, 5).map((gap: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {featuresAnalysis.insights.recommendations && (
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <ul className="space-y-1">
                    {featuresAnalysis.insights.recommendations
                      .slice(0, 3)
                      .map((recommendation: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 text-blue-500" />
                          {recommendation}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
