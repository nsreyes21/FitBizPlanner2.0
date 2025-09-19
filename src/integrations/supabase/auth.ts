// src/integrations/supabase/auth.ts
import { supabase } from './client';

export async function signUpEmail(email: string, password: string, redirectTo?: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo || `${location.origin}/auth/callback` }
  });
}

export async function signInEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithProvider(provider: 'google' | 'apple', redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo || `${location.origin}/auth/callback` }
  });
}

export async function signOutAll() {
  return supabase.auth.signOut();
}

export function onAuthChange(cb: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((evt, sess) => cb(evt, sess));
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error;
  }
  
  return data;
}

export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/auth/reset`
  });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}