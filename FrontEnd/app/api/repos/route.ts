import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repos = await prisma.repo.findMany({
    include: {
      _count: { select: { Issues: true, Commits: true } },
    },
    orderBy: { ImportedAt: 'desc' },
  });

  return NextResponse.json(repos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { owner, name, defaultBranch, isPrivate, spaceId } = body;
    
    // Use provided PAT or fallback to session GitHub token (for GitHub API calls only, not stored in DB)
    const pat = body.pat || (session as any).githubToken;

    if (!owner || !name) {
      return NextResponse.json({ error: 'Owner and name are required' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({ where: { Email: session.user.email! } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Use the explicitly provided spaceId, or fall back to any existing space
    let space: any = null;
    if (spaceId) {
      space = await prisma.space.findUnique({ where: { SpaceID: spaceId } });
    }
    if (!space) {
      space = await prisma.space.findFirst({});
    }
    if (!space) return NextResponse.json({ error: 'No workspace found. Please create a workspace first on the Projects page.' }, { status: 404 });

    // Set up GitHub API headers
    const ghHeaders: any = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (pat) {
      ghHeaders['Authorization'] = `Bearer ${pat}`;
    }

    // Fetch commits from GitHub API
    let githubCommits: any[] = [];
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=15`, {
        headers: ghHeaders,
      });
      if (ghRes.ok) {
        githubCommits = await ghRes.json();
      }
    } catch (err) {
      console.error('Failed to fetch commits from GitHub API:', err);
    }

    // Fetch file tree
    let fileTree = null;
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${defaultBranch || 'main'}?recursive=1`, {
        headers: ghHeaders,
      });
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree && Array.isArray(treeData.tree)) {
          fileTree = treeData.tree.map((item: any) => ({
            path: item.path,
            type: item.type,
            size: item.size
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch file tree from GitHub API:', err);
    }

    // Create repo via Java backend
    const repo = await prisma.repo.create({
      data: {
        SpaceID: space.SpaceID,
        GHOwner: owner,
        GHName: name,
        DefaultBranch: defaultBranch || 'main',
        IsPrivate: isPrivate || false,
        FileTree: fileTree ? fileTree : undefined,
        ImportedBy: user.UserID,
      },
    });

    if (!repo) {
      return NextResponse.json({ error: 'Failed to import repository. It may already exist.' }, { status: 500 });
    }

    // Create audit log (non-critical, ignore errors)
    try {
      await prisma.auditLog.create({
        data: {
          UserID: user.UserID,
          SpaceID: space.SpaceID,
          AuditTitle: 'Repo Imported',
          AuditDesc: `Imported repository ${owner}/${name}`,
        },
      });
    } catch (e) { /* audit log failure should not block the response */ }

    return NextResponse.json(repo, { status: 201 });

  } catch (err: any) {
    console.error('Error in POST /api/repos:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
