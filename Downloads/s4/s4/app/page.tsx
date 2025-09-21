import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Zap, Brain, BarChart3, Search, Globe } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">TestBox AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            AI-Powered Website Analysis
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 text-balance">
            Comprehensive{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Blackbox Testing
            </span>{" "}
            for Modern Websites
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 text-pretty max-w-3xl mx-auto">
            Discover bugs, security vulnerabilities, and optimization opportunities with our AI-powered testing
            platform. Get market insights, competitor analysis, and actionable recommendations in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need for Complete Website Analysis
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our AI-powered platform combines automated testing, market analysis, and intelligent insights to give you a
            complete picture of your website's performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Automated Bug Detection</CardTitle>
              <CardDescription>
                Comprehensive scanning for accessibility issues, broken links, form errors, and UI/UX problems across
                all pages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Security Analysis</CardTitle>
              <CardDescription>
                Advanced security testing including vulnerability scanning, SSL analysis, and protection against common
                threats.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Performance Optimization</CardTitle>
              <CardDescription>
                Detailed performance metrics, Core Web Vitals analysis, and specific recommendations for speed
                improvements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Intelligent analysis powered by advanced AI models that understand context and provide actionable
                recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Market Analysis</CardTitle>
              <CardDescription>
                Comprehensive market research including competitor analysis, target audience insights, and pricing
                strategies.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Universal Compatibility</CardTitle>
              <CardDescription>
                Test any website - localhost development sites, staging environments, or live production websites.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/50 dark:bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get comprehensive website analysis in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Enter Your URL</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Simply paste your website URL - works with localhost, staging, or production sites
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI Analysis</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our AI crawls every page, tests components, and analyzes market positioning
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Get Insights</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Receive detailed reports with actionable recommendations and market insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to Optimize Your Website?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of developers and businesses who trust TestBox AI for comprehensive website analysis.
          </p>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Start Your Free Analysis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">TestBox AI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">© 2024 TestBox AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
