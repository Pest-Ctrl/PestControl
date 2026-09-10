import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pat = searchParams.get('pat');
  
  let token = pat;
  if (!token) {
    token = (session as any).githubToken;
  }

  if (!token) {
    return NextResponse.json({ error: 'No GitHub token available. Please provide a PAT.' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      return NextResponse.json({ error: data.message || 'Failed to fetch repositories' }, { status: res.status });
    }

    const repos = await res.json();
    return NextResponse.json(repos);
  } catch (error) {
    console.error('Failed to fetch github repos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
