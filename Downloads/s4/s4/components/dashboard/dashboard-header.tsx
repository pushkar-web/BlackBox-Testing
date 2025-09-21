"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Shield, LogOut, Settings, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (email?: string) => {
    if (!email) return "U"
    return email.charAt(0).toUpperCase()
  }

  return (
    <header className="border-b bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">TestBox AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Account</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 dark:text-red-400"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
