"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useEditorStore } from '@/lib/store'

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
  remember: z.boolean().default(false).optional(),
})

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { loginUser } = useEditorStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        
        try {
            const result = await loginUser(values.email, values.password)
            
            if (result.success) {
                toast({
                    title: "Login Successful",
                    description: "Welcome back! Redirecting to your dashboard.",
                })
                router.push('/dashboard')
            } else {
                toast({
                    title: "Login Failed",
                    description: result.error || "Invalid email or password.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Login error:', error)
            toast({
                title: "Login Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email address</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="remember"
                        render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <Label htmlFor="remember" className="font-normal text-sm">Remember me</Label>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </Form>
            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <div className="mt-6">
                    <Button variant="outline" className="w-full">
                        Continue with Google
                    </Button>
                </div>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
