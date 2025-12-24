"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { currentUser, projects } = useEditorStore();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // User is logged in
                // We need to fetch the full profile from public.users to populate the store correctly
                // The store expects a User object which matches public.users structure

                try {
                    const { data: profile, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        useEditorStore.setState({
                            currentUser: {
                                id: profile.id,
                                email: profile.email,
                                name: profile.name,
                                subscription: profile.subscription,
                                credits: profile.credits,
                                creditLimit: profile.credit_limit,
                                codeRuns: profile.code_runs,
                                aiQueries: profile.ai_queries,
                                createdAt: new Date(profile.created_at),
                                lastActive: new Date(profile.last_active),
                                isActive: profile.is_active,
                                profileComplete: profile.profile_complete,
                                username: profile.username,
                                bio: profile.bio,
                                location: profile.location,
                                website: profile.website,
                                github: profile.github,
                                twitter: profile.twitter,
                                linkedin: profile.linkedin,
                                avatarUrl: profile.avatar_url
                            }
                        });
                    } else {
                        // Fallback if profile doesn't exist yet (shouldn't happen if signup works)
                        useEditorStore.setState({
                            currentUser: {
                                id: session.user.id,
                                email: session.user.email!,
                                name: session.user.user_metadata.name || 'User',
                                subscription: 'free',
                                credits: 100,
                                creditLimit: 100,
                                codeRuns: 0,
                                aiQueries: 0,
                                createdAt: new Date(session.user.created_at),
                                lastActive: new Date(),
                                isActive: true,
                                profileComplete: false,
                                username: '',
                                bio: '',
                                location: '',
                                website: '',
                                github: '',
                                twitter: '',
                                linkedin: '',
                                avatarUrl: ''
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user profile in AuthProvider:", error);
                }
            } else {
                // User is logged out
                useEditorStore.setState({ currentUser: null });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    return <>{children}</>;
}
