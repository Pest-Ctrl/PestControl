import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');

  if (token) {
    return NextResponse.json({ 
      user: {
        email: "developer@gmail.com",
        name: "Developer",
        provider: "github"
      } 
    });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
