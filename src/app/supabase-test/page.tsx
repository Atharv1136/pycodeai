'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export default function SupabaseTestPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    // Create client once
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleSignUp = async () => {
        setLoading(true)
        setMessage('')
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) setMessage(error.message)
        else setMessage('Check your email for the confirmation link!')
        setLoading(false)
    }

    const handleSignIn = async () => {
        setLoading(true)
        setMessage('')
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) setMessage(error.message)
        else setMessage('Signed in successfully!')
        setLoading(false)
    }

    const handleSignOut = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        setMessage('Signed out')
        setLoading(false)
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Supabase Integration Test</h1>

            {user ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
                        <p className="font-semibold">Logged in as:</p>
                        <p>{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSignIn}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={handleSignUp}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    {message}
                </div>
            )}
        </div>
    )
}
