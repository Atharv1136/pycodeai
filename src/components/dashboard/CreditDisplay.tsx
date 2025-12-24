"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/store'
import { CreditCard, Crown, AlertTriangle } from 'lucide-react'

export function CreditDisplay() {
  const { currentUser, checkCreditLimit } = useEditorStore()

  if (!currentUser) return null

  const isLowCredits = currentUser.credits <= 10
  const isOutOfCredits = checkCreditLimit()

  return (
    <Card className={`${isOutOfCredits ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : isLowCredits ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Credit Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={currentUser.subscription === 'free' ? 'secondary' : 'default'}
              className={currentUser.subscription === 'team' ? 'bg-purple-100 text-purple-800' : ''}
            >
              <Crown className="h-3 w-3 mr-1" />
              {currentUser.subscription.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${isOutOfCredits ? 'text-red-600' : isLowCredits ? 'text-yellow-600' : ''}`}>
              {currentUser.credits}
            </div>
            <div className="text-xs text-muted-foreground">
              / {currentUser.creditLimit}
            </div>
          </div>
        </div>

        {isOutOfCredits && (
          <div className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-800 dark:text-red-200 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Credit limit reached! Upgrade to premium to continue.</span>
          </div>
        )}

        {isLowCredits && !isOutOfCredits && (
          <div className="flex items-center gap-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded text-yellow-800 dark:text-yellow-200 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Low credits remaining. Consider upgrading.</span>
          </div>
        )}

        {currentUser.subscription === 'free' && (
          <Button size="sm" className="w-full">
            Upgrade to Pro
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
