import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL must be set in .env');
    process.exit(1);
}

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    console.error('To fix this:');
    console.error('1. Go to Supabase Dashboard > Project Settings > API');
    console.error('2. Copy the "service_role" secret');
    console.error('3. Add it to your .env file: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetAdmin() {
    const email = 'admin@gmail.com';
    const password = 'Atharv@1136';

    console.log(`Resetting admin user: ${email}`);

    // 1. Find the user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log(`User found (ID: ${existingUser.id}). Deleting...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return;
        }
        console.log('User deleted successfully.');
    } else {
        console.log('User does not exist.');
    }

    // 2. Create the user with the correct password
    console.log('Creating new admin user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            name: 'Admin User'
        }
    });

    if (createError) {
        console.error('Error creating user:', createError);
        return;
    }

    console.log('Admin user created successfully with ID:', newUser.user.id);

    // 3. Ensure profile exists in public.users
    // Since we used admin.createUser, the trigger might have run if it's set up.
    // But let's verify/upsert just in case.

    const { error: profileError } = await supabase
        .from('users')
        .upsert({
            id: newUser.user.id,
            email: email,
            name: 'Admin User',
            username: 'admin',
            subscription: 'team',
            is_active: true
        });

    if (profileError) {
        console.error('Error creating/updating profile:', profileError);
    } else {
        console.log('Profile ensured in public.users.');
    }
}

resetAdmin();
