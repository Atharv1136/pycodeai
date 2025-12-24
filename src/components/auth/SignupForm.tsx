"use client"

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useEditorStore } from '@/lib/store'

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." }),
})

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { registerUser } = useEditorStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            terms: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        
        try {
            // Register user using store function
            const result = await registerUser(values.fullName, values.email, values.password, 'free')
            
            if (result.success) {
                toast({
                    title: "Account Created",
                    description: "Welcome! We're redirecting you to the dashboard.",
                })
                router.push('/dashboard')
            } else {
                toast({
                    title: "Registration Failed",
                    description: result.error || "Please try again.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Registration error:', error)
            toast({
                title: "Registration Failed",
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
                <h2 className="text-3xl font-bold tracking-tight">Create an Account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Start your coding journey with us today.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="8+ characters" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel htmlFor="terms" className="text-sm font-normal">
                                        I agree to the{' '}
                                        <Link href="#" className="font-medium text-primary hover:underline">
                                            Terms of Service
                                        </Link>
                                        {' '}and{' '}
                                        <Link href="#" className="font-medium text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </FormLabel>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
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
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign In
                </Link>
            </p>
        </div>
    )
}
