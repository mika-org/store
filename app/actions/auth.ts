'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('user_session')?.value;
  if (!sessionCookie) return null;
  try {
    let decoded = decodeURIComponent(sessionCookie);
    if (decoded.startsWith('"') && decoded.endsWith('"')) {
      decoded = decoded.slice(1, -1);
    }
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export async function loginUser(input: any) {
  try {
    const supabase = await createServerSupabaseClient();

    // Query user by email
    const { data: user, error } = await supabase
      .from('users_shop')
      .select('*')
      .eq('email', input.email)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Verify bcrypt password
    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Prepare session data (exclude password)
    const sessionData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true, user: sessionData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerUser(input: any) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users_shop')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'Email is already registered.' };
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Insert user
    const { data: newUser, error } = await supabase
      .from('users_shop')
      .insert({
        email: input.email,
        password: hashedPassword,
        full_name: input.fullName,
        phone: input.phone || null,
        role: input.role || 'customer',
      })
      .select('*')
      .single();

    if (error) throw error;

    // Prepare session data
    const sessionData = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
    };

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true, user: sessionData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
  return { success: true };
}

export async function updatePassword(newPassword: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session')?.value;
    if (!sessionCookie) return { success: false, error: 'Not logged in.' };

    const session = JSON.parse(decodeURIComponent(sessionCookie));
    const supabase = await createServerSupabaseClient();

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users_shop')
      .update({ password: hashedPassword })
      .eq('id', session.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

