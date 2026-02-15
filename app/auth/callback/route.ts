import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
    }
  } catch (e) {
    console.error('Exception during auth callback:', e);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  return NextResponse.redirect(new URL('https://hello-world-hps26.vercel.app/dashboard', request.url));
}
