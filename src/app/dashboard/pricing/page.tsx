"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Star, Zap, Users, Crown } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/constants'
import { useToast } from '@/hooks/use-toast'

export default function PricingPage() {
  const { toast } = useToast()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handleSelectPlan = (planName: string) => {
    toast({
      title: "Plan Selected",
      description: `You've selected the ${planName} plan. Redirecting to checkout...`,
    })
  }

  const getPrice = (plan: any) => {
    if (billingPeriod === 'yearly') {
      const monthlyPrice = parseInt(plan.price.replace('$', ''))
      const yearlyPrice = monthlyPrice * 12 * 0.8 // 20% discount for yearly
      return `$${yearlyPrice}`
    }
    return plan.price
  }

  const getPeriod = () => {
    return billingPeriod === 'yearly' ? '/ year' : plan.period
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start coding with AI assistance. Upgrade anytime as your needs grow.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative"
          >
            <div className={`absolute left-1 top-1 bottom-1 w-6 bg-primary rounded transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'
            }`} />
            <span className="relative z-10 px-2 text-xs">Toggle</span>
          </Button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-primary' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingPeriod === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan, index) => (
          <Card 
            key={plan.name} 
            className={`relative ${
              plan.popular 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {plan.name === 'Free' && <Zap className="h-5 w-5 text-yellow-500" />}
                {plan.name === 'Pro' && <Crown className="h-5 w-5 text-purple-500" />}
                {plan.name === 'Team' && <Users className="h-5 w-5 text-blue-500" />}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold">
                  {getPrice(plan)}
                  <span className="text-lg font-normal text-muted-foreground">
                    {billingPeriod === 'yearly' ? '/ year' : plan.period}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                onClick={() => handleSelectPlan(plan.name)}
              >
                {plan.cta}
              </Button>
              
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Feature Comparison</CardTitle>
          <CardDescription className="text-center">
            Compare all features across our plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Features</th>
                  <th className="text-center py-3 px-4 font-medium">Free</th>
                  <th className="text-center py-3 px-4 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 font-medium">Team</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 px-4">Public Projects</td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Private Projects</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Code Runs per Day</td>
                  <td className="text-center py-3 px-4">100</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">AI Assistance</td>
                  <td className="text-center py-3 px-4">Basic</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                  <td className="text-center py-3 px-4">Advanced</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Real-time Collaboration</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Shared Team Projects</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Support</td>
                  <td className="text-center py-3 px-4">Community</td>
                  <td className="text-center py-3 px-4">Email</td>
                  <td className="text-center py-3 px-4">Dedicated</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Computing Power</td>
                  <td className="text-center py-3 px-4">Standard</td>
                  <td className="text-center py-3 px-4">Enhanced</td>
                  <td className="text-center py-3 px-4">Premium</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </div>
            <div>
              <h4 className="font-medium">What happens to my projects if I downgrade?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Your projects remain safe. If you downgrade to Free, private projects become read-only until you upgrade again.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Do you offer student discounts?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Yes! Students with valid .edu email addresses can get 50% off Pro plans. Contact support for verification.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Is there a free trial for paid plans?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center space-y-4 py-12">
        <h2 className="text-2xl font-bold">Ready to start coding with AI?</h2>
        <p className="text-muted-foreground">
          Join thousands of developers who are already building amazing things with PyCode AI
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => handleSelectPlan('Pro')}>
            Start Free Trial
          </Button>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  )
}
