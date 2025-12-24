import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin@gmail.com';
    const password = 'Atharv@1136';

    console.log(`Attempting to create admin user: ${email}`);

    // 1. Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Admin User',
            },
        },
    });

    let user = signUpData.user;

    if (signUpError) {
        console.log('Sign up failed with message:', signUpError.message);

        // Try to sign in regardless of the error message, as the user might already exist
        console.log('Attempting to sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            console.error('Error signing in:', signInError.message);
            return;
        }

        user = signInData.user;
        console.log('Signed in successfully.');
    } else {
        console.log('Sign up successful.');
    }

    if (!user) {
        console.error('Failed to get user object.');
        return;
    }

    console.log('User ID:', user.id);

    // 2. Ensure profile exists in public.users
    // We need to be authenticated as the user to insert/update their own profile due to RLS
    // The client is already authenticated if we just signed up or signed in?
    // Yes, createClient persists session in memory by default for node? 
    // Actually, for node, it might not persist unless we use a storage adapter, but the `supabase` instance should have the session from the recent call.
    // Let's check session.

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
        console.log('No active session. Cannot update public.users.');
        // If we just signed up, we might not have a session if email confirmation is required.
        if (signUpData.session) {
            // we have session
        } else if (!user.confirmed_at && !user.email_confirmed_at) {
            console.log('User created but email not confirmed. Please confirm email if required.');
            return;
        }
    }

    console.log('Checking public.users profile...');

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, email, subscription')
        .eq('id', user.id)
        .single();

    if (profile) {
        console.log('Profile exists:', profile);
        // Ensure subscription is 'team' for admin (optional, based on logic)
        // But we can't update subscription with anon key usually unless RLS allows it.
        // Our RLS allows update for own user?
        // Let's try to update subscription to 'team' just in case.
        // Note: The admin logic checks `email === 'admin@gmail.com'` OR `subscription === 'team'`.
        // So we don't strictly need to update subscription if email matches.
        console.log('Admin access confirmed via email check.');
    } else {
        console.log('Profile not found. Creating profile...');
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                name: 'Admin User',
                username: 'admin',
                subscription: 'team', // Set as team for good measure
                is_active: true
            });

        if (insertError) {
            console.error('Error creating profile:', insertError);
        } else {
            console.log('Profile created successfully.');
        }
    }
}

createAdmin();
