import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function GET() {
  // In a real OAuth flow, we would exchange the code for an access token here.
  // For now, we simulate a successful login by setting a cookie.
  const cookieStore = await cookies();
  cookieStore.set('auth_token', 'mock_github_token_123', {
    path: '/',
    httpOnly: true,
  });

  // Redirect to dashboard after successful "login"
  redirect('/dashboard');
}
