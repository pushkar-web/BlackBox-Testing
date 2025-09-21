import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">TestBox AI</span>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We&apos;ve sent you a confirmation link to complete your registration</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Please check your email and click the confirmation link to activate your account. Once confirmed, you
                can sign in and start analyzing websites.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
