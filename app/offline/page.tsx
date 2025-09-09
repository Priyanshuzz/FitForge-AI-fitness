"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw, Home, Dumbbell } from "lucide-react"

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-4 bg-orange-100 rounded-full w-fit">
            <WifiOff className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            You're Offline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-slate-600">
              It looks like you've lost your internet connection. Don't worry, you can still access some features of FitForge AI while offline.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Available Offline:</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• View cached workout plans</li>
              <li>• Track progress entries</li>
              <li>• Review previous sessions</li>
              <li>• Access fitness tips</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Dumbbell className="h-5 w-5" />
              <span className="font-semibold">FitForge AI</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your fitness journey continues, even offline
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}